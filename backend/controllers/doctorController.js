import doctorModel from "../models/doctorModel.js";
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import notificationModel from "../models/notificationModel.js";

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const formatToDDMMYYYY = (dateString) => {
  const [year, month, day] = dateString.split("-"); // "2025-09-06"
  return `${day}_${month}_${year}`; // "06_09_2025"
};

const getDoctorAppointmentStats = (appointments) => {
  const now = new Date();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2); // today + tomorrow

  const last24Hours = new Date(now);
  last24Hours.setHours(now.getHours() - 24);

  let upcoming = 0; // no_show
  let checkedIn = 0;
  let inConsultation = 0;
  let cancelledLast24Hrs = 0;

  appointments.forEach((item) => {
    // 📅 normalize appointment date
    let appointmentDate;
    if (item.slotDate && item.slotDate.includes("_")) {
      const [d, m, y] = item.slotDate.split("_").map(Number);
      appointmentDate = new Date(y, m - 1, d);
    } else {
      appointmentDate = new Date(item.slotDateISO || item.slotDate);
    }
    appointmentDate.setHours(0, 0, 0, 0);

    // 🟦 UPCOMING = no_show (Today & Tomorrow)
    if (
      item.appointmentStatus === "no_show" &&
      appointmentDate >= today &&
      appointmentDate < tomorrow
    ) {
      upcoming++;
    }

    // 🟨 CHECKED IN
    if (item.appointmentStatus === "checked_in") {
      checkedIn++;
    }

    // 🟩 IN CONSULTATION
    if (item.appointmentStatus === "in_consultation") {
      inConsultation++;
    }

    // 🟥 CANCELLED (last 24 hrs)
    if (
       (item.appointmentStatus === "cancelled_by_user" ||
   item.appointmentStatus === "cancelled_by_doctor") &&
      new Date(item.updatedAt || item.createdAt) >= last24Hours
    ) {
      cancelledLast24Hrs++;
    } 

     console.log(
  "appointmentStatus :",item.appointmentStatus,
  "updatedAt :",
  item.updatedAt,
  new Date(item.updatedAt || item.createdAt) >= last24Hours
);
  }); 

 

  return {
    upcoming,
    checkedIn,
    inConsultation,
    cancelledLast24Hrs,
  };
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
      return res.json({
        success: false,
        message: "Not authorized to reschedule this appointment",
      });
    }

    // 3) Status check
    if (appt.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled" });
    }
    if (appt.isCompleted) {
      return res.json({
        success: false,
        message: "Cannot reschedule completed appointment",
      });
    }

    // 4) Fetch doctor slots
    const doc = await doctorModel.findById(doctorId);
    if (!doc) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    let slots_booked = doc.slots_booked || {};

    console.log("slots_booked: ", slots_booked);

    // 5) Check if new slot is already booked
    const bookedForDate = slots_booked[newSlotDate] || [];
    if (bookedForDate.includes(newSlotTime)) {
      return res.json({
        success: false,
        message: "Requested slot already booked",
      });
    }

    // 6) Free old slot
    const oldDate = appt.slotDate;
    const oldTime = appt.slotTime;
    if (slots_booked[oldDate]) {
      slots_booked[oldDate] = slots_booked[oldDate].filter(
        (t) => t !== oldTime
      );
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
      availability,
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
    if (req.cookies.atoken) {
      return res.status(400).json({ message: "Admin already logged in" });
    }
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bycrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);

      res.cookie("dtoken", token, {
        httpOnly: true,
        secure: true, // https only (production)
        sameSite: "none", // cross-site requests allowed
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({
        success: true,
        token: {
          name: doctor.name,
          email: doctor.email,
        },
      });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const logoutDoctor = async (req, res) => {
  res.clearCookie("dtoken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.json({ success: true, message: "Logged out successfully" });
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
      return res.json({
        success: false,
        message: "AppointmentId and code required",
      });
    }

    const appt = await appointmentModel.findById(appointmentId);
    if (!appt)
      return res.json({ success: false, message: "Appointment not found" });

    if (appt.docId.toString() !== doctorId.toString()) {
      return res.json({
        success: false,
        message: "Not authorized to verify this appointment",
      });
    }
    if (appt.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled" });
    }
    if (appt.isVerified) {
      return res.json({
        success: false,
        message: "Appointment already verified",
      });
    }

    if (!appt.verificationCode) {
      return res.json({
        success: false,
        message: "No verification code available",
      });
    }

    // if (new Date() > new Date(appt.verificationExpiresAt)) {
    //   return res.json({ success: false, message: "Verification code expired" });
    // }

    if (String(appt.verificationCode) !== String(code).trim()) {
      return res.json({ success: false, message: "Invalid verification code" });
    }

    appt.isVerified = true;
    appt.verifiedAt = new Date();
    appt.appointmentStatus = "checked_in";
    appt.verifiedBy = doctorId;
    appt.verificationCode = undefined; // remove code after use (optional)

    await appt.save();

    return res.json({
      success: true,
      message: "Appointment verified successfully",
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.docId;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // validate ownership and verification status
    if (appointmentData.docId !== docId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    if (!appointmentData.isVerified) {
      return res.json({
        success: false,
        message: "Appointment not verified yet",
      });
    }

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
        appointmentStatus: "completed",
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
    const docId = req.docId;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
        appointmentStatus: "cancelled_by_doctor",
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
    const docId = req.docId;
    const appointments = await appointmentModel.find({ docId: req.docId });

    let totalEarnings = 0;
    let todayEarnings = 0;
    let totalPatients = new Set();
    let todayPatients = new Set();
    let todayAppointments = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // -------------------------
    // WEEKLY DATA PREPARATION
    // -------------------------
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyCounts = Array(7).fill(0);

    // Last week range for comparison
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setHours(0, 0, 0, 0);

    let lastWeekAppointments = 0;
    let lastWeekEarnings = 0;

    appointments.forEach((item) => {
      // ✅ Convert slotDate ("8_11_2025") into proper Date
      let appointmentDate;
      if (item.slotDate && item.slotDate.includes("_")) {
        const [day, month, year] = item.slotDate.split("_").map(Number);
        appointmentDate = new Date(year, month - 1, day);
      } else {
        appointmentDate = new Date(item.slotDateISO || item.slotDate);
      }
      appointmentDate.setHours(0, 0, 0, 0);

      // Total earnings
      if (item.isCompleted || item.payment) {
        totalEarnings += item.amount || 0;
      }

      totalPatients.add(item.userId?.toString());

      // Today's data
      if (appointmentDate >= today && appointmentDate < tomorrow) {
        todayAppointments++;
        todayPatients.add(item.userId?.toString());
        if (item.isCompleted || item.payment) {
          todayEarnings += item.amount || 0;
        }
      }

      // Weekly chart (this week)
      const dayIndex = appointmentDate.getDay();
      weeklyCounts[dayIndex] += 1;

      // Last week data
      if (appointmentDate >= lastWeekStart && appointmentDate < lastWeekEnd) {
        lastWeekAppointments++;
        if (item.isCompleted || item.payment) {
          lastWeekEarnings += item.amount || 0;
        }
      }
    });

    // 📊 Comparison percent (today vs last week same day)
    const compareToLastWeek =
      lastWeekAppointments > 0
        ? ((todayAppointments - lastWeekAppointments) / lastWeekAppointments) *
          100
        : todayAppointments > 0
        ? 100
        : 0;

    const notifications = await notificationModel
      .find({ docId })
      .sort({ createdAt: -1 });

    const appointmentStats = getDoctorAppointmentStats(appointments);

    const dashData = {
      total: {
        earnings: totalEarnings,
        appointments: appointments.length,
        patients: totalPatients.size,
      },
      today: {
        earnings: todayEarnings,
        appointments: todayAppointments,
        patients: todayPatients.size,
        compareToLastWeek: Number(compareToLastWeek.toFixed(1)),
      },
      weekly: {
        labels: weekDays,
        values: weeklyCounts,
      },
      appointmentStats,
      latestAppointments: appointments.reverse().slice(0, 5),
      notifications,
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for Doctor panel
const doctorProfile = async (req, res) => {
  try {
    // const { docId } = req.body;
    const profileData = await doctorModel
      .findById(req.docId)
      .select("-password");

    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile data from Doctor panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { fees, address, available, availability } = req.body;
    const docId = req.docId;
    console.log(docId, fees, address, available, availability);

    if (!docId)
      return res.json({ success: false, message: "Doctor ID missing" });

    await doctorModel.findByIdAndUpdate(docId, {
      fees,
      address,
      available,
      availability,
    });

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
  logoutDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  verifyAppointmentByCode,
  appointmentReschedule,
};
