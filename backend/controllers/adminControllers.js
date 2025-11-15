import bcrypt from "bcryptjs";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // Input validation
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (!validator.isStrongPassword(password, { minLength: 6 })) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters and strong." });
    }

    if (!validator.isNumeric(fees.toString())) {
      return res.status(400).json({ error: "Fees must be a valid number." });
    }

    // Check if doctor already exists
    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res
        .status(409)
        .json({ error: "Doctor with this email already exists." });
    }

    // Upload image to Cloudinary
    let uploadedImageUrl = "";
    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, {
        folder: "doctor_profiles",
        resource_type: "image",
      });
      uploadedImageUrl = result.secure_url;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor object
    const doctorData = {
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      image: uploadedImageUrl,
      date: Date.now(),
    };

    // Save to DB
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    return res
      .status(201)
      .json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const loginAdmin = async (req, res) => {
  try {
    if (req.cookies.dtoken) {
      return res.status(400).json({ message: "Doctor already logged in" });
    }
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Check against .env credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email,
        role: "admin", // isse role check kar paayenge
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("atoken", token, {
      httpOnly: true,
      secure: true, // https only (production)
      sameSite: "none", // cross-site requests allowed
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Admin login successful",
      success: true,
      token: {
        email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const logoutAdmin = async (req, res) => {
  res.clearCookie("atoken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.json({ success: true, message: "Logged out successfully" });
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  logoutAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};
