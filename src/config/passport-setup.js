import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import Family from '../models/family.model.js'; // Import the Family model
import crypto from 'crypto'; // For generating a unique invitation code

// This configures Passport to use Google for OAuth 2.0 authentication.
passport.use(
  new GoogleStrategy(
    {
      // These are your API credentials from the Google Cloud Console.
      // They are loaded from environment variables for security.
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // This is the full URL that Google will redirect the user back to after login.
      // It MUST exactly match one of the URLs in your Google Cloud Console's "Authorized redirect URIs".
      callbackURL: '/api/auth/google/callback',
    },
    // This is the "verify" callback function. It runs after Google successfully authenticates a user.
    // It receives the user's profile and access tokens from Google.
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with this Google ID already exists in our database.
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // If the user exists, update their access and refresh tokens.
          // This is useful in case they have been re-issued by Google.
          user.accessToken = accessToken;
          user.refreshToken = refreshToken; // Important for offline access (e.g., calendar sync)
          await user.save();
          
          // Pass the existing user to the next step in the Passport flow.
          return done(null, user);
        }

        // If the user does not exist, this is their first time logging in.
        // We need to create a new user account for them.
        const newUser = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          profilePhotoUrl: profile.photos[0].value,
          accessToken,
          refreshToken,
        });

        // --- Create a new Family for the new user ---
        // Every new user will become the owner of their own new family group.
        // They can invite others to join this family later.
        const newFamily = await Family.create({
            familyName: `${newUser.displayName}'s Family`, // A default family name
            owner: newUser._id,
            // Generate a unique, random invitation code for the family
            invitationCode: crypto.randomBytes(8).toString('hex'),
        });

        // Assign the new family's ID to the user.
        newUser.familyId = newFamily._id;
        await newUser.save();

        // Pass the newly created user to the next step in the Passport flow.
        return done(null, newUser);
      } catch (err) {
        // If any error occurs during the process, pass it to Passport.
        console.error("Error in Passport verify callback:", err);
        return done(err, null);
      }
    }
  )
);
