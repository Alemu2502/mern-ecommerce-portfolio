import User from '../models/user.js';
import { Order } from '../models/order.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';

// Middleware to find user by ID
export const userById = async (req, res, next, id) => {
    try {
        const user = await User.findById(id).exec();
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        req.profile = user;
        next();
    } catch (err) {
        return res.status(400).json({ error: errorHandler(err) });
    }
};

// Controller to read user profile
export const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
};

// Controller to update user profile
export const update = async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await User.findById(req.profile._id).exec();
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        } else {
            user.name = name;
        }
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password should be at least 6 characters long' });
            } else {
                user.password = password; // Schema handles hashing
            }
        }
        const updatedUser = await user.save();
        updatedUser.hashed_password = undefined;
        updatedUser.salt = undefined;
        res.json(updatedUser);
    } catch (err) {
        console.log('USER UPDATE ERROR', err);
        return res.status(400).json({ error: 'User update failed' });
    }
};

// Middleware to add order to user purchase history
export const addOrderToUserHistory = async (req, res, next) => {
    let history = req.body.order.products.map(item => ({
        _id: item._id,
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.count,
        transaction_id: req.body.order.transaction_id,
        amount: req.body.order.amount
    }));

    try {
        await User.findOneAndUpdate(
            { _id: req.profile._id },
            { $push: { history: history } },
            { new: true }
        ).exec();
        next();
    } catch (error) {
        return res.status(400).json({ error: 'Could not update user purchase history' });
    }
};

// Controller to get user purchase history
export const purchaseHistory = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.profile._id })
                                  .populate('user', '_id name')
                                  .sort('-created')
                                  .exec();
        res.json(orders);
    } catch (err) {
        return res.status(400).json({ error: errorHandler(err) });
    }
};
