// /backend/src/config/passport-setup.js

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('[PASSPORT] Google callback received. Profile:', profile.displayName);
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('[PASSPORT] Found existing user:', user.email);
          user.accessToken = accessToken;
          user.refreshToken = refreshToken || user.refreshToken; // Keep old refresh token if new one isn't provided
          await user.save();
          return done(null, user);
        }

        console.log('[PASSPORT] User not found. Creating new user...');
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          profilePhotoUrl: profile.photos[0].value,
          accessToken,
          refreshToken,
        });
        console.log('[PASSPORT] New user created:', user.email);
        return done(null, user);
        
      } catch (err) {
        console.error('[PASSPORT] ERROR in strategy:', err); // Log the full error
        return done(err, null);
      }
    }
  )
);