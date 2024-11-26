import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import { errorHandler } from '../helpers/dbErrorHandler.js';
import braintree from 'braintree';
import dotenv from 'dotenv';
import { sendEmail } from './mailer.js';

dotenv.config(); // Load environment variables

// Initialize Braintree gateway
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox, // Use braintree.Environment.Sandbox for testing
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// Sign up a new user
export const signup = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        user.salt = undefined;
        user.hashed_password = undefined;

        // Create email verification token
        const emailToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const verificationUrl = `${process.env.CLIENT_URL}/email-verification/${emailToken}`;

        // Send verification email
        const emailHtml = `
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verificationUrl}">Verify Email</a>
        `;
        await sendEmail(user.email, 'Email Verification', emailHtml);

        res.json({ message: 'Signup successful! Please check your email for verification instructions.' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: errorHandler(err) || 'Email is taken' });
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

        if (!user.authenticate(password)) {
            return res.status(401).json({ error: 'Email and password don\'t match' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('t', token, { expire: new Date() + 3600000, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        const { _id, name, email: userEmail, role } = user;
        return res.json({ token, user: { _id, email: userEmail, name, role } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: errorHandler(err) || 'Internal server error' });
    }
};

// Sign out the user
export const signout = (req, res) => {
    res.clearCookie('t');
    res.json({ message: 'Signout success' });
};

// Middleware to require signin
export const requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'], // Specify the algorithm to avoid deprecation warnings
    userProperty: 'auth'
});

// Middleware to check if the user is authenticated
export const isAuth = (req, res, next) => {
    const user = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!user) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({ error: 'Admin resource! Access denied' });
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
