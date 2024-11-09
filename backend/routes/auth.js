import express from 'express';
const router = express.Router();

import { signup, signin, signout, requireSignin } from '../controllers/auth.js';
import { userSignupValidator } from '../validator/index.js';

// Route for user signup with validation
router.post('/signup', userSignupValidator, signup);

// Route for user signin
router.post('/signin', signin);

// Route for user signout
router.get('/signout', signout);

export default router;
