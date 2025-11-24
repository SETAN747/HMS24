import express from "express";
import passport from "passport";
import { googleAuthCallback } from "../controllers/userController.js";
import { signupRequest,
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
  addReview,
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/userController.js";
import { doctorList } from "../controllers/doctorController.js";
import authUser from "../middlewares/authUser.js";
import verifyOtpMiddleware from "../middlewares/verifyOtpMiddleware.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", signupRequest);
userRouter.post("/register/verify-otp",verifyOtpMiddleware,registerUser);
userRouter.post("/register/resend-otp", resendSignupOtp);
userRouter.post("/login", loginUser); 
userRouter.post("/logout",authUser ,logoutUser);

userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.get("/doctor-list", authUser, doctorList);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verify-razorpay", authUser, verifyRazorpay);
userRouter.post("/get-doctor-suggestions", authUser, getDoctorSuggestions);
userRouter.post("/add-review", authUser, addReview);
userRouter.get("/getUserNotifications", authUser, getUserNotifications);
userRouter.post("/markNotificationAsRead", authUser, markNotificationAsRead);

// START Google OAuth — redirect to Google
userRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    session: false,
  })
);

// Google OAuth callback
userRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleAuthCallback
);

export default userRouter;
