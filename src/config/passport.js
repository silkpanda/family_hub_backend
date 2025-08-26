// FILE: /src/config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Household = require('../models/Household');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        const newUserDto = {
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
        };
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (user) return done(null, user);

            user = await User.create(newUserDto);
            const household = await Household.create({ name: `${profile.displayName}'s Household`, members: [user._id] });
            user.households.push(household._id);
            user.role = 'parent';
            await user.save();
            done(null, user);
        } catch (err) {
            console.error("Passport Strategy Error:", err);
            done(err, null);
        }
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));
};