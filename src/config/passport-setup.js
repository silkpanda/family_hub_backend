import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback', // Must match Google Cloud console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, update tokens if necessary
          user.accessToken = accessToken;
          user.refreshToken = refreshToken; // IMPORTANT for offline access for calendar sync
          await user.save();
          return done(null, user);
        }

        // New user, create them
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          profilePhotoUrl: profile.photos[0].value,
          accessToken,
          refreshToken,
        });
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);