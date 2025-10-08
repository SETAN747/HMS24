import express from "express";
import passport from "passport";
import { googleAuthCallback } from "../controllers/userController.js"
import {
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
   addReview,
} from "../controllers/userController.js"; 
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";


const userRouter = express.Router(); 

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser); 
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment); 
userRouter.get("/appointments", authUser, listAppointment);  
userRouter.post("/cancel-appointment", authUser, cancelAppointment); 
userRouter.post("/payment-razorpay", authUser, paymentRazorpay); 
userRouter.post("/verify-razorpay", authUser, verifyRazorpay); 
userRouter.post("/get-doctor-suggestions",authUser,getDoctorSuggestions); 
userRouter.post("/add-review", authUser, addReview);


// START Google OAuth — redirect to Google
userRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Google OAuth callback
userRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleAuthCallback
); 




export default userRouter;