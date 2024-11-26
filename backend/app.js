import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
//import passport from 'passport';
import passport from './controllers/passport.js'; // Import Passport configuration
import { removeUnverifiedUsers } from './controllers/unverifiedUser.js'; // Import the scheduled task

dotenv.config(); // Load environment variables from .env file

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js';
import braintreeRoutes from './routes/braintree.js';
import orderRoutes from './routes/order.js';
import reviewRoutes from './routes/review.js';
import oauthRoutes from './routes/oauthRoutes.js'; // Import OAuth routes

// Initialize the Express application
const app = express();

// Connect to the database
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log('DB Connected'))
    .catch(err => console.error('DB Connection Error:', err));

// Middleware setup
app.use(morgan('dev')); // Logging middleware
app.use(express.json()); // Built-in body parser middleware to handle JSON requests
app.use(cookieParser()); // Cookie parser middleware

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3001', // Allow requests from your frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true // Enable sending cookies
}));

// Session middleware
app.use(session({ secret: 'your_session_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', braintreeRoutes);
app.use('/api', orderRoutes);
app.use('/api', reviewRoutes);
app.use('/api', oauthRoutes); // Add OAuth routes

// Define the port
const port = process.env.PORT || 8000;

removeUnverifiedUsers();

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
