const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Ensure this path is correct

// --- Session Management ---
// These functions tell Passport how to save and retrieve user information from the session.

// Saves the user's ID to the session cookie.
passport.serializeUser((user, done) => {
    console.log('[Passport] Serializing user:', user.id);
    done(null, user.id);
});

// Retrieves the full user details from the database using the ID from the session cookie.
passport.deserializeUser(async (id, done) => {
    try {
        console.log('[Passport] Deserializing user:', id);
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


// --- Google OAuth 2.0 Strategy ---
// This is the core logic for handling the Google login process.
passport.use(
    new GoogleStrategy({
            // These options MUST match the settings in your Google Cloud Console.
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // The callbackURL must be the absolute URL of your backend.
            callbackURL: `${process.env.APP_BASE_URL}/api/auth/google/callback`,
        },
        // This 'verify' function is called after Google successfully authenticates the user.
        async (accessToken, refreshToken, profile, done) => {
            console.log('[Passport] Google Strategy: Received profile from Google.');
            try {
                // Check if a user with this Google ID already exists in your database.
                console.log(`[Passport] Google Strategy: Searching for user with googleId: ${profile.id}`);
                const existingUser = await User.findOne({ googleId: profile.id });

                if (existingUser) {
                    // If the user exists, return them to proceed with login.
                    console.log('[Passport] Google Strategy: Found existing user.');
                    return done(null, existingUser);
                }

                // If the user does not exist, create a new user in your database.
                console.log('[Passport] Google Strategy: User not found. Creating new user.');
                const newUser = new User({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value,
                });

                await newUser.save();
                console.log('[Passport] Google Strategy: Successfully saved new user.');
                // Return the newly created user to proceed with login.
                done(null, newUser);

            } catch (err) {
                // If any error occurs during the database operation, pass it to Passport.
                console.error('[Passport] Google Strategy: An error occurred.', err);
                return done(err, false);
            }
        }
    )
);

