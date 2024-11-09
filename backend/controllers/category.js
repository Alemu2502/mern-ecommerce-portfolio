import Category from '../models/category.js';
import Product from '../models/product.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';

// Middleware to find category by ID
export const categoryById = async (req, res, next, id) => {
    try {
        const category = await Category.findById(id).exec();
        if (!category) {
            return res.status(400).json({
                error: 'Category does not exist'
            });
        }
        req.category = category;
        next();
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err)
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
    const category = req.category;
    try {
        const products = await Product.find({ category }).exec();
        if (products.length >= 1) {
            return res.status(400).json({
                message: `Sorry. You can't delete ${category.name}. It has ${products.length} associated products.`
            });
        } else {
            const data = await category.remove();
            res.json({
                message: 'Category deleted'
            });
        }
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err)
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
