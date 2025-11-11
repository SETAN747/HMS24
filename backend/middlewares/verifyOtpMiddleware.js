import SignupOtp from "../models/SignupOtp.js";

const verifyOtpMiddleware = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.json({ success: false, message: "Email and OTP required" });

    const record = await SignupOtp.findOne({ email });
    if (!record) return res.json({ success: false, message: "No signup request found" });

    if (new Date() > record.expiresAt) {
      await SignupOtp.deleteOne({ email });
      return res.json({ success: false, message: "OTP expired" });
    }

    if (record.attempts >= 5) {
      await SignupOtp.deleteOne({ email });
      return res.json({ success: false, message: "Too many attempts" });
    }

    if (String(record.otp) !== String(otp)) {
      record.attempts = (record.attempts || 0) + 1;
      await record.save();
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // OTP ok -> attach data to req and continue
    req.tempSignup = { name: record.name, email: record.email, password: record.passwordHash };
    console.log("name at verifyOtpMiddleware:",record.name)
     console.log("email at verifyOtpMiddleware:",record.email)
      console.log("name at verifyOtpMiddleware:",record.passwordHash)
    // delete OTP record now (one-time)
    await SignupOtp.deleteOne({ email });

    return next();
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
}; 

export default verifyOtpMiddleware ;