import doctorModel from "../models/doctorModel.js";
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js"; 


function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
} 

const formatToDDMMYYYY = (dateString) => {
  const [year, month, day] = dateString.split("-"); // "2025-09-06"
  return `${day}_${month}_${year}`; // "06_09_2025"
};

 

 const appointmentReschedule = async (req, res) => {
  try {
    const { appointmentId, newSlotDate, newSlotTime } = req.body;
    const doctorId = req.docId; // from authDoctor middleware

    if (!appointmentId || !newSlotDate || !newSlotTime) {
      return res.json({ success: false, message: "Missing parameters" });
    }

    // 1) Fetch appointment
    const appt = await appointmentModel.findById(appointmentId);
    if (!appt) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // 2) Ownership check
    if (String(appt.docId) !== String(doctorId)) {
      return res.json({ success: false, message: "Not authorized to reschedule this appointment" });
    }

    // 3) Status check
    if (appt.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled" });
    }
    if (appt.isCompleted) {
      return res.json({ success: false, message: "Cannot reschedule completed appointment" });
    }

    // 4) Fetch doctor slots
    const doc = await doctorModel.findById(doctorId);
    if (!doc) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    let slots_booked = doc.slots_booked || {}; 

    console.log("slots_booked: " , slots_booked)

    // 5) Check if new slot is already booked
    const bookedForDate = slots_booked[newSlotDate] || [];
    if (bookedForDate.includes(newSlotTime)) {
      return res.json({ success: false, message: "Requested slot already booked" });
    }

    // 6) Free old slot
    const oldDate = appt.slotDate;
    const oldTime = appt.slotTime;
    if (slots_booked[oldDate]) {
      slots_booked[oldDate] = slots_booked[oldDate].filter((t) => t !== oldTime);
      if (slots_booked[oldDate].length === 0) {
        delete slots_booked[oldDate];
      }
    }

    // 7) Book new slot
    slots_booked[newSlotDate] = slots_booked[newSlotDate] || [];
    slots_booked[newSlotDate].push(newSlotTime);

    await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });

    // 8) Update appointment
    const newVerificationCode = generate6DigitCode();

    appt.rescheduled = true;
    appt.rescheduleHistory = appt.rescheduleHistory || [];
    appt.rescheduleHistory.push({
      fromDate: formatToDDMMYYYY(oldDate),
      fromTime: oldTime,
      toDate: formatToDDMMYYYY(newSlotDate),
      toTime: newSlotTime,
      by: doctorId,
      at: new Date(),
    });

    appt.slotDate = formatToDDMMYYYY(newSlotDate);
    appt.slotTime = newSlotTime;
    appt.isVerified = false; // verification reset
    appt.verificationCode = newVerificationCode;

    await appt.save();

    // 9) Response
    return res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      verificationCode: newVerificationCode,
      // appointment: appt,
    });
  } catch (err) {
    console.error("Reschedule Error:", err);
    return res.json({ success: false, message: err.message });
  }
}; 

 
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);

    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bycrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    // const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId: req.docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}; 


const verifyAppointmentByCode = async (req, res) => {
  try {
    const { appointmentId, code } = req.body;
    const doctorId = req.docId;

    if (!appointmentId || !code) {
      return res.json({ success: false, message: "AppointmentId and code required" });
    }

    const appt = await appointmentModel.findById(appointmentId);
    if (!appt) return res.json({ success: false, message: "Appointment not found" }); 

    

  if (appt.docId.toString() !== doctorId.toString()) {
  return res.json({ success: false, message: "Not authorized to verify this appointment" });
}
    if (appt.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled" });
    }
    if (appt.isVerified) {
      return res.json({ success: false, message: "Appointment already verified" });
    }

    if (!appt.verificationCode) {
      return res.json({ success: false, message: "No verification code available" });
    }

    // if (new Date() > new Date(appt.verificationExpiresAt)) {
    //   return res.json({ success: false, message: "Verification code expired" });
    // }

    if (String(appt.verificationCode) !== String(code).trim()) {
      return res.json({ success: false, message: "Invalid verification code" });
    }

    appt.isVerified = true;
    appt.verifiedAt = new Date();
    appt.verifiedBy = doctorId;
    appt.verificationCode = undefined; // remove code after use (optional)
    await appt.save();

    return res.json({ success: true, message: "Appointment verified successfully" });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body; 
     const docId = req.docId ;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body; 
    const docId = req.docId ;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "Cancellation Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    // const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId: req.docId });

    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for Doctor panel
const doctorProfile = async (req, res) => {
  try {
    // const { docId } = req.body;
    const profileData = await doctorModel.findById(req.docId).select("-password");

    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile data from Doctor panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  verifyAppointmentByCode,
  appointmentReschedule,
};
