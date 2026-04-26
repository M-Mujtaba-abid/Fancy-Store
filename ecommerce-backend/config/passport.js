import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User, UserIdentity } from "../models/index.js";  // ✅ dono import

passport.use(
  new GoogleStrategy(
    {
      clientID:    process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/user/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email    = profile.emails[0].value;
        const googleId = profile.id;

        // Step 1: Google identity pehle se hai?
        const existingIdentity = await UserIdentity.findOne({
          where:   { provider: "google", providerId: googleId },
          include: [User]
        });

        // Pehle se aaya hua → seedha login
        if (existingIdentity) return done(null, existingIdentity.User);

        // Step 2: Email se check karo — shayad local account hai
        let user = await User.findOne({ where: { email } });

        if (!user) {
          // Bilkul naya user → Users table mein banao
          user = await User.create({
            name:   profile.displayName,
            email:  email,
            avatar: profile.photos[0].value,
          });
        }

        // Google identity add karo UserIdentity mein
        await UserIdentity.create({
          userId:     user.id,
          provider:   "google",
          providerId: googleId,
        });

        return done(null, user);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;