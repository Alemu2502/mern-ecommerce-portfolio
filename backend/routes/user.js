import express from 'express';
const router = express.Router();

import { requireSignin, isAuth, isAdmin } from '../controllers/auth.js';
import { userById, read, update, purchaseHistory } from '../controllers/user.js';

// Route for secret endpoint (for testing purposes)
router.get('/secret', requireSignin, (req, res) => {
    res.json({
        user: 'got here yay'
    });
});

// Route to read user profile
router.get('/user/:userId', requireSignin, isAuth, read);

// Route to update user profile
router.put('/user/:userId', requireSignin, isAuth, update);

// Route to get purchase history of the user
router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory);

// Middleware to extract user by ID
router.param('userId', userById);

export default router;
