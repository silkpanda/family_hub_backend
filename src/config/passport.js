const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Household = require('../models/Household');

// --- THIS IS THE FIX ---
// We are now using the full, absolute URL for the callback, which is required
// for a secure, production environment. This ensures there is no ambiguity
// for Google, your server, or the browser during the authentication handshake.
const callbackURL = `${process.env.APP_BASE_URL}/api/auth/google/callback`;

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
        proxy: true // Important for environments like Render
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log('[Passport] Google Strategy: Received profile from Google.');
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
        };

        try {
            console.log(`[Passport] Google Strategy: Searching for user with googleId: ${profile.id}`);
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                console.log('[Passport] Google Strategy: Found existing user.');
                // Update user details if they have changed
                user.displayName = profile.displayName;
                user.image = profile.photos[0].value;
                await user.save();
                done(null, user);
            } else {
                console.log('[Passport] Google Strategy: User not found, creating new user.');
                user = await User.create(newUser);
                
                console.log('[Passport] Google Strategy: Creating a new household for the new user.');
                const newHousehold = await Household.create({
                    name: `${user.displayName}'s Household`,
                    members: [{ user: user._id, role: 'parent', color: '#4CAF50' }] 
                });

                user.households.push(newHousehold._id);
                user.activeHouseholdId = newHousehold._id;
                await user.save();
                console.log('[Passport] Google Strategy: New user and household created successfully.');
                done(null, user);
            }
        } catch (err) {
            console.error('[Passport] Google Strategy: Error during user lookup or creation.', err);
            done(err, null);
        }
    })
);

passport.serializeUser((user, done) => {
    console.log(`[Passport] Serializing user: ${user.id}`);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log(`[Passport] Deserializing user: ${id}`);
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

