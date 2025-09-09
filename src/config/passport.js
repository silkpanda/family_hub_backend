const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Household = require('../models/Household');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists in our database
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // If user exists, just return them
                    return done(null, user);
                } else {
                    // If not, create a new user in our database
                    const newUser = await User.create({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        image: profile.photos[0].value,
                    });
                    
                    // Also create a new household for this new user
                    const newHousehold = await Household.create({
                        name: `${profile.displayName}'s Household`,
                        members: [{ user: newUser._id, color: '#4CAF50' }] // Add them as the first member
                    });

                    // Add the household to the user's record
                    newUser.households.push(newHousehold._id);
                    await newUser.save();

                    return done(null, newUser);
                }
            } catch (error) {
                console.error('Error in Google Strategy:', error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
