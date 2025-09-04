// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const picture = profile.photos?.[0]?.value;

        // 1️⃣ Try to find user by googleId
        let user = await userModel.findOne({ googleId: profile.id });

        // 2️⃣ If not found, try to find by email (link Google account)
        if (!user && email) {
          user = await userModel.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            user.authProvider = "google";
            if (!user.image && picture) user.image = picture; // map to `image`
            await user.save();
          }
        }

        // 3️⃣ If still not found, create a brand-new Google user
        if (!user) {
          user = await userModel.create({
            name: profile.displayName || "Google User",
            email,
            googleId: profile.id,
            image: picture || undefined,
            authProvider: "google",
            password: undefined, // optional password (not used for google)
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
