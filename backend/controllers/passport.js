import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/api/auth/google/callback',
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (token, tokenSecret, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0]?.value || `${profile.id}@gmail.com`, // Use GitHub ID as a fallback email if not available
                password: 'default-password' // Set a default password for OAuth users
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        console.error('Error in Google Strategy', err);
        return done(err, false);
    }
}));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/api/auth/github/callback'
}, async (token, tokenSecret, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
            user = new User({
                githubId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0]?.value || `${profile.id}@github.com`, // Use GitHub ID as a fallback email if not available
                password: 'default-password' // Set a default password for OAuth users
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        console.error('Error in GitHub Strategy', err);
        return done(err, false);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
