import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/user/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (!user) {
          user = await User.findOne({
            where: { email: profile.emails[0].value }
          });

          if (user) {
            await user.update({
              googleId: profile.id,
              avatar: profile.photos[0].value,
              authProvider: "google",
            });
          } else {
            user = await User.create({
              googleId:     profile.id,
              name:         profile.displayName,
              email:        profile.emails[0].value,
              avatar:       profile.photos[0].value,
              authProvider: "google",
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;