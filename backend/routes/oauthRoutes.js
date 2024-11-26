import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signin' }), (req, res) => {
    res.redirect('/'); // Redirect to the homepage or a specific route after successful authentication
});

// GitHub OAuth Routes
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/signin' }), (req, res) => {
    res.redirect('/'); // Redirect to the homepage or a specific route after successful authentication
});

// Logout Route
router.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

export default router;
