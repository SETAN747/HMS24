import validator from "validator";
import bycrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import reviewModel from "../models/reviewModel.js";
import notificationModel from "../models/notificationModel.js";
import Counter from "../models/counter.js";
import razorpayInstance from "../config/razorpay.js";
import genAI from "../config/gemini.js";
import { getIO } from "../config/socket.io.js";
import SignupOtp from "../models/SignupOtp.js";
import { sendMail } from "../config/mailer.js";
import { v4 as uuidv4 } from "uuid";


// ✅ Helper: Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}; 

const generateOrUpdateSession = (user, clientIp, userAgent) => { 

  const formatReadableDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

  const now = formatReadableDate(new Date());
const expires = formatReadableDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); 

  if (!user.activeSession || !user.activeSession.sessionId) {
    // Create new session
    user.activeSession = {
      sessionId: uuidv4(),
      ipAddress: clientIp,
      userAgent,
      createdAt: now,
      expiresAt: expires,
    };
  } else {
    // Update existing session
    user.activeSession.ipAddress = clientIp;
    user.activeSession.userAgent = userAgent;
    user.activeSession.expiresAt = expires;
  }

  return user.activeSession;
};

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // "123456"
}

const generateAppointmentToken = (docId, slotDate, seq) => {
  // Example slotDate: "1_11_2025"  → DD_MM_YYYY format
  const docShort = String(docId).slice(-4).toUpperCase();

  // Split the date into parts
  const [day, month, year] = slotDate.split("_");

  // Convert into YYYYMMDD format for consistency in token
  const ymd = `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;

  // Pad the sequence number to 3 digits
  const padded = String(seq).padStart(3, "0");

  // Final token format
  return `APT-${docShort}-${ymd}-${padded}`;

  // generateAppointmentToken("68b5adc82df4e258586013ba", "1_11_2025", 5);
  // => "APT-13BA-20251101-005"
};
  
 // API For Sending OTP
 const signupRequest = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ success: false, message: "Missing details" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Enter valid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password must be ≥ 8 chars" });

    // check user exists
    const exist = await userModel.findOne({ email });
    if (exist) return res.json({ success: false, message: "Email already registered" });

    // hash password now and store in temp record
    const salt = await bycrypt.genSalt(10);
    const passwordHash = await bycrypt.hash(password, salt);

    // generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // upsert temp record
    await SignupOtp.findOneAndUpdate(
      { email },
      { name, passwordHash, otp, expiresAt, attempts: 0 },
      { upsert: true, new: true }
    );

    // send email
    const html = `
      <p>Hi ${name},</p>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>Code valid for 15 minutes.</p>
    `;
    await sendMail({ to: email, from: process.env.SMTP_USER, subject: "Verify your email", html });

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
}; 

// API for Resending Signup OTP
const resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: "Email required" });

    const record = await SignupOtp.findOne({ email });
    if (!record) return res.json({ success: false, message: "No signup request found" });

    // optional: limit resend attempts
    if (record.resendCount >= 5) return res.json({ success: false, message: "Resend limit reached" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    record.otp = otp;
    record.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    record.resendCount = (record.resendCount || 0) + 1;
    record.attempts = 0;
    await record.save();

    await sendMail({ to: email, from: process.env.MAIL_FROM, subject: "Your verification code (resend)", html: `<p>Your code: <strong>${otp}</strong></p>` });

    return res.json({ success: true, message: "OTP resent" });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.tempSignup; 
    console.log("name at registerUser:",name)
    console.log("email at registerUser:",email)
    console.log("password at registerUser:",password)

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "enter a valid email" });
    }

    // validating strong password
    // if (password.length < 8) {
    //   return res.json({ success: false, message: "enter a strong password" });
    // }

    // Check if user already exists
    // const existingUser = await userModel.findOne({ email });
    // if (existingUser) {
    //   return res.json({ success: false, message: "Email already registered" });
    // }

    // hashing user password
    // const salt = await bycrypt.genSalt(10);
    // const hashedPassword = await bycrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password,
      authProvider: "local",
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = generateToken(user._id);

    // res.json({ success: true, token }); 
    res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // https only (production)
  sameSite: "none",    // cross-site requests allowed
  maxAge: 7 * 24 * 60 * 60 * 1000
}); 
   
res.json({ success: true,  token: {
    name: user.name,
    email: user.email,
  } }); 
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

    // Get IP + device
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers["user-agent"];

    // ⭐ Add or update active session here
    generateOrUpdateSession(user, clientIp, userAgent);
    await user.save();

     res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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

       const clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers["user-agent"]; 

      generateOrUpdateSession(user, clientIp, userAgent); 

      await user.save();

      
      res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // https only (production)
  sameSite: "none",    // cross-site requests allowed
  maxAge: 7 * 24 * 60 * 60 * 1000
});       

 res.json({ success: true,  token: {
    name: user.name,
    email: user.email,
  } }); 
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}; 

 const logoutUser = async (req, res) => { 
  
  console.log(req.user)
  const userId = req.user.userId; 
  if (userId) {
    await userModel.findByIdAndUpdate(userId, {
      activeSession: {
        sessionId: null,
        ipAddress: null,
        createdAt: null,
        expiresAt: null,
        userAgent: null
      }
    });
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.json({ success: true, message: "Logged out successfully" });
};


// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const useData = await userModel.findById(userId).select("-password");

    // console.log("useData :",useData)

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
    const { docId, slotDate, slotTime ,patientDetails } = req.body;
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

    const verificationCode = generate6DigitCode();

    // --- atomic sequence get/increment ---
    const counterKey = `${docId}_${slotDate}`;
    const counterDoc = await Counter.findOneAndUpdate(
      { _id: counterKey },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seq = counterDoc.seq;

    const appointmentToken = generateAppointmentToken(docId, slotDate, seq);

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      patientDetails,
      date: Date.now(),
      verificationCode,
      appointmentToken,
      tokenSeq: seq,
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Notification DB me save
    const patientNotificationMessage = `Your appointment with ${appointmentData.docData.name} (${appointmentData.docData.speciality}) has been successfully booked for ${appointmentData.slotDate} at ${appointmentData.slotTime}. Consultation Fee: ₹${appointmentData.amount}.`;

    const doctorNotificationMessage = `Your appointment with Patient ${appointmentData.userData.name} has been successfully booked for ${appointmentData.slotDate} at ${appointmentData.slotTime}. Consultation Fee: ₹${appointmentData.amount}.`;

    const notification = await notificationModel.create({
      userId: appointmentData.userId,
      docId,
      title: "Appointment Confirmed ✅",
      message: {
        patient: patientNotificationMessage,
        doctor: doctorNotificationMessage,
      },
      link: "/my-appointments",
    });

    // Real-time emit
    const io = getIO();
    io.to(appointmentData.userId).emit("new-notification", notification);
    io.to(appointmentData.docId).emit("new-notification", notification);

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

    const doctorName = doctorData.name || "the doctor";

    // Notification DB me save
    const notification = await notificationModel.create({
      userId: appointmentData.userId,
      title: "Appointment Cancelled Successfully ✅",
      message: `Your appointment with ${doctorName} has been cancelled.`,
      link: "/my-appointments",
    });

    // Real-time emit
    const io = getIO();
    io.to(appointmentData.userId).emit("new-notification", notification);

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

      // Inside verifyRazorpay after confirming payment success
      const appointmentData = await appointmentModel.findById(
        orderInfo.receipt
      );

      // const userData = await userModel.findById(appointmentData.userId);

      const notificationMessage = `Your payment of ₹${appointmentData.amount} for the appointment with ${appointmentData.docData.name} (${appointmentData.docData.speciality}) is successful.`;

      const notification = await notificationModel.create({
        userId: appointmentData.userId,
        title: "Payment Successful 💳",
        message: notificationMessage,
        link: "/my-appointments",
      });

      // Real-time emit
      const io = getIO();
      io.to(appointmentData.userId).emit("new-notification", notification);

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

const addReview = async (req, res) => {
  try {
    const { appointmentId, rating, reviewText, websiteExperience } = req.body;
    const userId = req.user.userId;

    if (!appointmentId || !rating) {
      return res.json({
        success: false,
        message: "Appointment ID and rating are required",
      });
    }

    // ✅ Check appointment existence
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // ✅ Check completion
    if (!appointment.isCompleted) {
      return res.json({
        success: false,
        message: "You can review only after completion",
      });
    }

    // ✅ Prevent duplicate review
    const existing = await reviewModel.findOne({ appointmentId });
    if (existing) {
      return res.json({
        success: false,
        message: "You already reviewed this appointment",
      });
    }

    // ✅ Create review
    const newReview = new reviewModel({
      appointmentId,
      userId,
      docId: appointment.docId,
      rating,
      reviewText,
      websiteExperience,
    });
    await newReview.save();

    // ✅ Update doctor rating (optional but recommended)
    const reviews = await reviewModel.find({ docId: appointment.docId });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await doctorModel.findByIdAndUpdate(appointment.docId, {
      $set: {
        averageRating: avgRating.toFixed(1),
        totalReviews: reviews.length,
      },
    });

    appointment.isReviewed = true;
    await appointment.save();

    const notificationMessage = `Thank You ${appointment.userData.name} , You submitted a review for ${appointment.docData.name}.`;

    const notification = await notificationModel.create({
      userId: appointment.userId, // send to doctor or admin
      title: "Your Review Submitted Successfully ⭐",
      message: notificationMessage,
      link: "/doctor-reviews", // internal dashboard
    });

    // Real-time emit
    const io = getIO();
    io.to(appointment.userId).emit("new-notification", notification);

    res.json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await notificationModel
      .find({ userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 🔹 Sabhi unread notifications ko read mark karo
    const result = await notificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  signupRequest,
  resendSignupOtp,
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  getDoctorSuggestions,
  googleAuthCallback,
  addReview,
  getUserNotifications,
  markNotificationAsRead,
  
};
