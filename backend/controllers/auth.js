import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.js';
import { expressjwt } from 'express-jwt';
import { errorHandler } from '../helpers/dbErrorHandler.js';
import { sendEmail, transporter } from './mailer.js';
import crypto from 'crypto';


dotenv.config();

const accessTokenSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const emailVerificationSecret = process.env.EMAIL_VERIFICATION_SECRET;
let refreshTokens = [];

export const generateAccessToken = (user) => {
    return jwt.sign(user, accessTokenSecret, { expiresIn: '15m' });
};

export const generateRefreshToken = (user) => {
    const refreshToken = jwt.sign(user, refreshTokenSecret, { expiresIn: '7d' });
    refreshTokens.push(refreshToken);
    return refreshToken;
};

// Sign up a new user with email verification
export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate password length
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
        const existsEmail = await User.findOne({ email });
        if (existsEmail) {
            return res.status(422).json({ error: 'Email already exists. Please sign in.' });
        }

        const verificationToken = jwt.sign({ email }, process.env.EMAIL_VERIFICATION_SECRET, { expiresIn: '24h' });

        const user = new User({ name, email, password, verificationToken });
        await user.save();

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

        const emailHtml = `
            <h2>Please verify your email</h2>
            <p>Click <a href="${verificationUrl}">here</a> to verify your email. This link will expire in 24 hours.</p>
        `;

        await transporter.sendMail({
            to: email,
            from:`"Alemu Molla" <${process.env.EMAIL_FROM}>`, // Ensure this is correctly set
            subject: 'Email Verification',
            html: emailHtml
        });

        res.status(201).json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error registering user. Please try again.' });
    }
};

// Sign in an existing user

export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User with that email does not exist. Please signup' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ error: 'Please verify your email to sign in.' });
        }

        if (!user.authenticate(password)) {
            return res.status(401).json({ error: 'Email and password don\'t match' });
        }

        const token = generateAccessToken({ _id: user._id });
        const refreshToken = generateRefreshToken({ _id: user._id });

        res.cookie('t', token, { expire: new Date() + 3600000, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('refreshToken', refreshToken, { expire: new Date() + 604800000, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        if (typeof window !== 'undefined') {
            localStorage.setItem('jwt', JSON.stringify({ token, refreshToken }));
        }

        const { _id, name, email: userEmail, role } = user;
        return res.json({ token, refreshToken, user: { _id, email: userEmail, name, role } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Sign out the user
export const signout = (req, res) => {
    res.clearCookie('t');
    res.clearCookie('refreshToken');
    res.json({ message: 'Signout success' });
};

// Middleware to require signin
export const requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'], // Specify the algorithm used
    userProperty: 'auth'
});

export const isAuth = (req, res, next) => {
    console.log('Auth Middleware: Checking if user is authenticated...');
    console.log('Request auth:', req.auth);
    console.log('Request profile:', req.profile);

    let user = req.profile && req.auth && req.profile._id.toString() === req.auth._id.toString();
    if (!user) {
        console.log('Authorization failed: User not authenticated or authorized.');
        return res.status(403).json({
            error: 'Access denied'
        });
    }
    next();
};

export const isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: 'Admin resource! Access denied'
        });
    }
    next();
};

// Generate Braintree token
export const generateToken = async (req, res) => {
    try {
        const response = await gateway.clientToken.generate({});
        res.send(response);
    } catch (err) {
        console.error('Braintree token generation error:', err);
        res.status(500).json({ error: errorHandler(err) || 'Error generating token' });
    }
};

// Process Braintree payment
export const processPayment = async (req, res) => {
    const { paymentMethodNonce, amount } = req.body;

    try {
        const result = await gateway.transaction.sale({
            amount,
            paymentMethodNonce,
            options: { submitForSettlement: true }
        });

        if (result.success) {
            res.json(result);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Braintree payment error:', error);
        res.status(500).json({ error: errorHandler(error) || error.message });
    }
};

// Handle refresh token
export const refreshAccessToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ error: "Refresh token required" });
    }

    if (!refreshTokens.includes(token)) {
        return res.status(403).json({ error: "Invalid refresh token" });
    }

    jwt.verify(token, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken({ _id: user._id });
        res.json({ accessToken: newAccessToken });
    });
};


// Forgot Password - Request Reset Token
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User with that email does not exist.' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ error: 'Please verify your email to request a password reset.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        console.log('Generated reset token:', token); // Debug statement

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();
        console.log('User after saving:', user); // Debug statement

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

        const emailHtml = `
            <h2>Password Reset Request</h2>
            <p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>
        `;

        await sendEmail(user.email, 'Password Reset', emailHtml);
        res.json({ message: 'Password reset email sent. Please check your inbox.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error sending password reset email.' });
    }
};


// Reset Password

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        console.log('Received token:', token); // Debug statement
        console.log('Found user:', user); // Debug statement

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        // Update password and clear the reset token fields
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        const updatedUser = await user.save();
        console.log('Updated user:', updatedUser); // Debug statement

        res.json({ message: 'Password has been reset successfully.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error resetting password.' });
    }
};



