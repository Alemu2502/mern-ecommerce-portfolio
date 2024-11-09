import express from 'express';
const router = express.Router();

import { requireSignin, isAuth, isAdmin } from '../controllers/auth.js';
import { userById, addOrderToUserHistory } from '../controllers/user.js';
import {
    create,
    listOrders,
    getStatusValues,
    orderById,
    updateOrderStatus
} from '../controllers/order.js';
import { decreaseQuantity } from '../controllers/product.js';

// Route to create a new order
router.post(
    '/order/create/:userId',
    requireSignin,
    isAuth,
    addOrderToUserHistory,
    decreaseQuantity,
    create
);

// Route to list all orders
router.get('/order/list/:userId', requireSignin, isAuth, isAdmin, listOrders);

// Route to get order status values
router.get(
    '/order/status-values/:userId',
    requireSignin,
    isAuth,
    isAdmin,
    getStatusValues
);

// Route to update order status
router.put(
    '/order/:orderId/status/:userId',
    requireSignin,
    isAuth,
    isAdmin,
    updateOrderStatus
);

// Middleware to extract user by ID
router.param('userId', userById);

// Middleware to extract order by ID
router.param('orderId', orderById);

export default router;
