import validator from "validator";
import bycrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpayInstance from "../config/razorpay.js";
import genAI from "../config/gemini.js";


// ✅ Helper: Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "enter a valid email" });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "enter a strong password" });
    }  

     // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    // hashing user password
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
       authProvider: "local",
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = generateToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}; 




 const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user; // Passport verify se aya hua user
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=user_not_found`
      );
    }

    // JWT create
    const token = generateToken(user._id);

    // Frontend ke liye redirect URL banaye
    const url = new URL(process.env.FRONTEND_URL);
    url.pathname = "/oauth-callback";
    url.searchParams.set("token", token);

    console.log("✅ USER from passport:", user);
console.log("✅ Generated token:", token);
console.log("✅ Redirect URL:", url.toString());

    return res.redirect(url.toString()); 

    
  } catch (err) {
    console.error(err);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};


// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

     // If user is Google login only (no password)
    if (!user.password) {
      return res.json({
        success: false,
        message: "Please login with Google",
      });
    }

    const isMatch = await bycrypt.compare(password, user.password);

    if (isMatch) {
      const token = generateToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const useData = await userModel.findById(userId).select("-password"); 

    console.log("useData :",useData)

    res.json({ success: true, user: useData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.userId; // token se mila hua

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked;

    // checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
  try {
    const userId = req.user.userId; // token se mila hua
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.userId; // token se mila hua

    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

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

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({
        success: false,
        message: "Appointment cancelled or not found",
      });
    }

    // creating options for razorpay payment

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    //creating of an order
    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify payment
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });

      res.json({ success: true, message: "Payment successfull" });
    } else {
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

const getDoctorSuggestions = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !symptoms.toString().trim()) {
      return res.status(400).json({ error: "Symptoms / text are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1) CLASSIFIER — decide whether input is greeting / general question / symptom
    const classifyPrompt = `
You are a short text classifier for a medical assistant.
Classify the following USER TEXT into exactly one word: SYMPTOM, GENERAL, or GREETING.
- SYMPTOM means the text describes human health problems or symptoms and should be used to find a medical speciality and doctors.
- GENERAL means the text is a medical question or request for advice (not asking to book a doctor).
- GREETING means a simple greeting like "hi", "hello", "hey" or similar.

Return ONLY one of these words (no explanation).

User text: """${symptoms}"""
`;
    const classifyResult = await model.generateContent(classifyPrompt);
    const classifyToken = (classifyResult.response.text() || "")
      .trim()
      .toUpperCase();

    // If classifier says GREETING -> return a greeting type
    if (classifyToken.includes("GREETING")) {
      return res.json({
        type: "greeting",
        message: "Hi! 👋 I am Prescripto AI. How can I help you today?",
      });
    }

    // If classifier says GENERAL -> return concise medical advice using the model
    if (classifyToken.includes("GENERAL")) {
      const advicePrompt = `
You are a concise, accurate medical assistant. Answer the user's medical question clearly and briefly (1-3 short paragraphs). 
If the question is unrelated to human health, reply exactly: "Sorry, I can only answer human medical questions."

User question: """${symptoms}"""
`;
      const adviceResult = await model.generateContent(advicePrompt);
      const adviceText = (adviceResult.response.text() || "").trim();

      return res.json({
        type: "advice",
        message: adviceText,
      });
    }

    // Else assume SYMPTOM (or fallback to symptom flow)
    // 2) SPECIALITY DETECTION — ask model to return exact speciality or NO_MATCH
    const specPrompt = `
You are a medical assistant. The patient has these symptoms: """${symptoms}""".
From the following list choose EXACTLY ONE token (and return ONLY that token, no extra text):
- General physician
- Gynecologist
- Dermatologist
- Pediatricians
- Neurologist
- Gastroenterologist

If none of the above match, reply exactly: NO_MATCH

Return one of: General physician OR Gynecologist OR Dermatologist OR Pediatricians OR Neurologist OR Gastroenterologist OR NO_MATCH.
`;
    const specResult = await model.generateContent(specPrompt);
    const aiResponse = (specResult.response.text() || "").trim();

    // If model says NO_MATCH -> return advice type with "sorry" message
    if (aiResponse === "NO_MATCH" || /NO_MATCH/i.test(aiResponse)) {
      return res.json({
        type: "advice",
        message: "Sorry, we do not have doctors for this.",
      });
    }

    // Otherwise assume aiResponse is one of the speciality names
    const speciality = aiResponse;

    // 3) Fetch earliest available doctors from DB (same as before)
    const doctors = await doctorModel
      .find({ speciality })
      .select("-email -password -about")
      .sort({ nextAvailable: 1 })
      .limit(5);

    // If no doctors found in DB, return advice fallback
    if (!doctors || doctors.length === 0) {
      return res.json({
        type: "advice",
        message: "Sorry, we do not have doctors for this.",
      });
    }

    // Success -> return doctors
    return res.json({
      type: "doctors",
      speciality,
      doctors,
      message: null,
    });
  } catch (err) {
    console.error("getDoctorSuggestions error:", err);
    return res.status(500).json({ error: "Server error / Gemini error" });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  getDoctorSuggestions,
  googleAuthCallback,
};
