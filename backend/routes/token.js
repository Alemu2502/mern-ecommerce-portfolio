import express from 'express';
import { authenticateToken } from '../middleware.js';
import { generateToken, processPayment, refreshAccessToken } from './auth.js';

const router = express.Router();

router.get('/braintree/getToken', authenticateToken, generateToken);
router.post('/braintree/processPayment', authenticateToken, processPayment);
router.post('/refresh-token', refreshAccessToken);

export default router;
