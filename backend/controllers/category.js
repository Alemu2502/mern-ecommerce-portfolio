import Category from '../models/category.js';
import Product from '../models/product.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';

export const categoryById = async (req, res, next, id) => {
    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(400).json({
                error: 'Category not found'
            });
        }
        req.category = category;
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Error finding category'
        });
    }
};

export const userById = async (req, res, next, id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile = user;
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Error finding user'
        });
    }
};

// Create a new category
export const create = async (req, res) => {
    const category = new Category(req.body);
    try {
        const data = await category.save();
        res.json({ data });
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};

// Read a category
export const read = (req, res) => {
    return res.json(req.category);
};

// Update a category
export const update = async (req, res) => {
    console.log('req.body', req.body);
    console.log('category update param', req.params.categoryId);

    const category = req.category;
    category.name = req.body.name;
    try {
        const data = await category.save();
        res.json(data);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};

// Remove a category

export const remove = async (req, res) => {
    try {
        const category = req.category;
        if (!category) {
            return res.status(400).json({
                error: 'Category not found'
            });
        }

        await category.deleteOne();
        res.json({
            message: 'Category deleted successfully'
        });
    } catch (err) {
        return res.status(400).json({
            error: 'Failed to delete category'
        });
    }
};

// List all categories
export const list = async (req, res) => {
    try {
        const data = await Category.find().exec();
        res.json(data);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};
