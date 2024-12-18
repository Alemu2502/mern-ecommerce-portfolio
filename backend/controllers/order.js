import { Order, CartItem } from '../models/order.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file for security
dotenv.config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware to find an order by ID
export const orderById = async (req, res, next, id) => {
    try {
        const order = await Order.findById(id)
                                  .populate('products.product', 'name price')
                                  .exec();
        if (!order) {
            return res.status(400).json({
                error: 'Order does not exist'
            });
        }
        req.order = order;
        next();
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};

// Create a new order and send email alert to admin
export const create = async (req, res) => {
    console.log('CREATE ORDER: ', req.body);
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    try {
        const data = await order.save();
        
        // Prepare email data to send to the admin
        const emailData = {
            from: `"Your Company" <${process.env.EMAIL_USER}>`, // Sender address
            to: process.env.ADMIN_EMAIL, // Admin's email from environment variables
            subject: `A new order is received`, // Subject line
            html: `
                <p>Customer name: ${req.profile.name}</p>
                <p>Total products: ${order.products.length}</p>
                <p>Total cost: ${order.amount}</p>
                <p>Login to dashboard to view the order in detail.</p>
            `
        };

        await transporter.sendMail(emailData);
        res.json(data);
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(400).json({
            error: errorHandler(error)
        });
    }
};

// List all orders sorted by creation date
export const listOrders = async (req, res) => {
    try {
        const orders = await Order.find()
                                  .populate('user', '_id name address')
                                  .sort('-created')
                                  .exec();
        res.json(orders);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};

// Get status values for orders
export const getStatusValues = (req, res) => {
    res.json(Order.schema.path('status').enumValues);
};

// Update the status of an order
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.updateOne(
            { _id: req.body.orderId },
            { $set: { status: req.body.status } }
        ).exec();
        res.json(order);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};
