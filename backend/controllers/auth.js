import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.js';
import {expressjwt} from 'express-jwt';
import { errorHandler } from '../helpers/dbErrorHandler.js';
import braintree from 'braintree';

dotenv.config();

const accessTokenSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
let refreshTokens = []; // In a real application, save these in a database

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// Function to check if the user is authenticated
export const isAuthenticated = () => {
    if (typeof window == 'undefined') {
        return false;
    }

    if (localStorage.getItem('jwt')) {
        return JSON.parse(localStorage.getItem('jwt'));
    } else {
        return false;
    }
};

// Generate access token
export const generateAccessToken = (user) => {
    return jwt.sign(user, accessTokenSecret, { expiresIn: '15m' });
};

// Generate refresh token
export const generateRefreshToken = (user) => {
    const refreshToken = jwt.sign(user, refreshTokenSecret, { expiresIn: '7d' });
    refreshTokens.push(refreshToken);
    return refreshToken;
};

// Sign up a new user
export const signup = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({ user });
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

        const token = generateAccessToken({ _id: user._id });
        const refreshToken = generateRefreshToken({ _id: user._id });

        res.cookie('t', token, { expire: new Date() + 3600000, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('refreshToken', refreshToken, { expire: new Date() + 604800000, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Store the token in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('jwt', JSON.stringify({ token, refreshToken }));
        }

        const { _id, name, email: userEmail, role } = user;
        return res.json({ token, refreshToken, user: { _id, email: userEmail, name, role } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: errorHandler(err) || 'Internal server error' });
    }
};

// Sign out the user
export const signout = (req, res) => {
    res.clearCookie('t');
    res.clearCookie('refreshToken');
    res.json({ message: 'Signout success' });
};

// Middleware to require sign in
export const requireSignin = expressjwt({
    secret: accessTokenSecret,
    algorithms: ['HS256'],
    userProperty: 'auth'
});

// Middleware to check if the user is authenticated
export const isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!user) {
        return res.status(403).json({
            error: 'Access denied'
        });
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
