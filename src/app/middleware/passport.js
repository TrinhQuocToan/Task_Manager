const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/Users');

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email'],
    enableProof: true,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await User.findOne({ 'facebook.id': profile.id });
        
        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                username: profile.displayName,
                email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
                avatar: profile.photos?.[0]?.value,
                facebook: {
                    id: profile.id,
                    token: accessToken
                }
            });
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 
            $or: [
                { 'google.id': profile.id },
                { email: profile.emails[0].value }
            ]
        });
        
        if (!user) {
            // Tạo username ngắn hơn
            const shortId = Math.random().toString(36).substring(2, 7); // Tạo 5 ký tự ngẫu nhiên
            const username = `${profile.displayName.substring(0, 13)}_${shortId}`.substring(0, 20);
            
            user = await User.create({
                username: username,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                google: {
                    id: profile.id,
                    token: accessToken
                }
            });
        } else {
            // Nếu user đã tồn tại, cập nhật thông tin Google
            user.google = {
                id: profile.id,
                token: accessToken
            };
            await user.save();
        }
        
        return done(null, user);
    } catch (error) {
        console.error('Google auth error:', error);
        return done(error, null);
    }
}));

module.exports = passport;
