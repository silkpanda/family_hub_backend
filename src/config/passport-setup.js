// This file configures the Passport.js Google OAuth2.0 strategy for user authentication.

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback', // The URL Google will redirect to after authentication.
    },
    // This function is called when a user is successfully authenticated by Google.
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database.
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          // If user exists, update their access tokens.
          user.accessToken = accessToken;
          user.refreshToken = refreshToken || user.refreshToken;
          await user.save();
          return done(null, user); // Pass the existing user to the next step.
        }
        // If user does not exist, create a new user record.
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          profilePhotoUrl: profile.photos[0].value,
          accessToken,
          refreshToken,
        });
        return done(null, user); // Pass the new user to the next step.
      } catch (err) {
        return done(err, null); // Pass an error if one occurs.
      }
    }
  )
);