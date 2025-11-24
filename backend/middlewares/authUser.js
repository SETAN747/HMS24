import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// user authentication middleware
const authUser = async (req, res, next) => {
  try {
    // const { token } = req.headers; 
    const token = req.cookies.token; 
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET); 
     const user = await userModel.findById(token_decode.id);

      if (!user || !user.activeSession.sessionId) {
      return res.json({ success: false, message: "Session missing, login again" });
    }  
      const currentIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip; 

      if (user.activeSession.ipAddress !== currentIp) {
      // clear session
      user.activeSession = {
        sessionId: null,
        ipAddress: null,
        createdAt: null,
        expiresAt: null,
        userAgent: null
      };
      await user.save();
      res.clearCookie("token");
      return res.json({ success: false, message: "IP changed. Session blocked. Login again" });
    }  

     if (new Date() > new Date(user.activeSession.expiresAt)) {
      user.activeSession = {
        sessionId: null,
        ipAddress: null,
        createdAt: null,
        expiresAt: null,
        userAgent: null
      };
      await user.save();
      res.clearCookie("token");
      return res.json({ success: false, message: "Session expired" });
    }  

       // refresh expiry time
    user.activeSession.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

      req.user = { userId: token_decode.id , session: user.activeSession }; 
      console.log("req.user.userID :",req.user)
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;