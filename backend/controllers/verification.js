import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const verifyEmail = async (req, res) => {
    const { token } = req.body;

    console.log('Received token for verification:', token);

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findOne({ email: decoded.email, verificationToken: token });
        console.log('User found:', user);

        if (!user) {
            console.error('User not found or token mismatch');
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        user.isVerified = true; // Ensure the user is marked as verified
        user.verificationToken = undefined; // Clear the verification token
        user.resetPasswordToken = undefined; // Clear the reset password token
        user.resetPasswordExpires = undefined; // Clear the reset password expiration
        await user.save();

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};
