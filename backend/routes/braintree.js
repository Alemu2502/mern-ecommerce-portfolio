import express from 'express';
const router = express.Router();

import { requireSignin, isAuth } from '../controllers/auth.js';
import { userById } from '../controllers/user.js';
import { generateToken, processPayment } from '../controllers/braintree.js';

// Route to get Braintree token
router.get('/braintree/getToken/:userId', requireSignin, isAuth, generateToken);

// Route to process Braintree payment
router.post('/braintree/payment/:userId', requireSignin, isAuth, processPayment);

// Param middleware to extract user by ID
router.param('userId', userById);

export default router;
