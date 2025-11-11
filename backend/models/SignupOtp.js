import mongoose from "mongoose";

const signupOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true }, // hashed pw
  otp: { type: String, required: true }, // store plain or hashed (here plain for simplicity)
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  resendCount: { type: Number, default: 0 },
}, { timestamps: true });

const SignupOtp = mongoose.models.SignupOtp || mongoose.model("SignupOtp", signupOtpSchema);
export default SignupOtp;
