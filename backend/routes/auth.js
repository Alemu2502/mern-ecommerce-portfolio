import express from 'express';
const router = express.Router();
import { verifyEmail } from '../controllers/verification.js';
import { signup, signin, signout, forgotPassword, resetPassword } from '../controllers/auth.js';
import { userSignupValidator } from '../validator/index.js';

// Route for user signup with validation
router.post('/signup', userSignupValidator, signup);

// Route for user signin
router.post('/signin', signin);

// Route for user signout
router.get('/signout', signout);

// Route for email verification
router.post('/verify-email', verifyEmail);
// Route for forgot password 
router.post('/forgot-password', forgotPassword); 
// Route for reset password 
router.post('/reset-password', resetPassword);

export default router;
