import formidable from 'formidable';
import _ from 'lodash';
import fs from 'fs';
import Product from '../models/product.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';

// Middleware to find product by ID
// Middleware to find product by ID
export const productById = async (req, res, next, id) => {
    console.log(`Fetching product with id: ${id}`);  // Logging line
    try {
        const product = await Product.findById(id).populate('category').exec();
        if (!product) {
            console.log(`Product not found: ${id}`);  // Logging line
            return res.status(400).json({
                error: 'Product not found'
            });
        }
        req.product = product;
        next();
    } catch (err) {
        console.log(`Error finding product: ${err}`);  // Logging line
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};


// Controller to read a single product
export const read = (req, res) => {
    req.product.photo = undefined; // Remove photo from product data
    return res.json(req.product);
};

// Controller to create a new product
export const create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }

        // Check for all required fields
        const { name, description, price, category, quantity, shipping } = fields;
        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        let product = new Product(fields);

        // Handle file upload
        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }
            try {
                product.photo.data = fs.readFileSync(files.photo.filepath); // Use `filepath` instead of `path`
                product.photo.contentType = files.photo.mimetype; // Use `mimetype` instead of `type`
            } catch (readError) {
                return res.status(400).json({
                    error: 'Error reading file'
                });
            }
        }

        try {
            const result = await product.save(); // Use async/await instead of callback
            res.json(result);
        } catch (saveErr) {
            return res.status(400).json({
                error: errorHandler(saveErr)
            });
        }
    });
};

// Controller to delete a product
// Controller to delete a product
export const remove = async (req, res) => {
    try {
        const product = req.product;
        console.log(`Attempting to delete product with id: ${product._id}`);  // Logging line
        await Product.deleteOne({ _id: product._id });
        res.json({
            message: 'Product deleted successfully'
        });
    } catch (err) {
        console.log(`Error deleting product: ${err}`);  // Logging line
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
};


// Controller to update a product
export const update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }

        let product = req.product;
        product = _.extend(product, fields);

        // Handle file upload
        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }
            try {
                product.photo.data = fs.readFileSync(files.photo.filepath); // Use `filepath` instead of `path`
                product.photo.contentType = files.photo.mimetype; // Use `mimetype` instead of `type`
            } catch (readError) {
                return res.status(400).json({
                    error: 'Error reading file'
                });
            }
        }

        try {
            const result = await product.save(); // Use async/await instead of callback
            res.json(result);
        } catch (saveErr) {
            return res.status(400).json({
                error: errorHandler(saveErr)
            });
        }
    });
};

/**
 * List products based on query parameters
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */
export const list = async (req, res) => {
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    try {
        const products = await Product.find()
                                      .select('-photo')
                                      .populate('category')
                                      .sort([[sortBy, order]])
                                      .limit(limit)
                                      .exec();
        res.json(products);
    } catch (err) {
        return res.status(400).json({
            error: 'Products not found'
        });
    }
};

/**
 * Find products based on the req product category
 * other products that have the same category will be returned
 */
export const listRelated = async (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    try {
        const products = await Product.find({ _id: { $ne: req.product }, category: req.product.category })
                                      .limit(limit)
                                      .populate('category', '_id name')
                                      .exec();
        res.json(products);
    } catch (err) {
        return res.status(400).json({
            error: 'Products not found'
        });
    }
};

// Get all unique categories
export const listCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category', {}).exec();
        res.json(categories);
    } catch (err) {
        return res.status(400).json({
            error: 'Categories not found'
        });
    }
};

/**
 * List products by search
 * show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkboxes and radio buttons
 * make api request and show the products to users based on what they want
 */
export const listBySearch = async (req, res) => {
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === 'price') {
                // gte - greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    try {
        const data = await Product.find(findArgs)
                                  .select('-photo')
                                  .populate('category')
                                  .sort([[sortBy, order]])
                                  .skip(skip)
                                  .limit(limit)
                                  .exec();
        res.json({
            size: data.length,
            data
        });
    } catch (err) {
        return res.status(400).json({
            error: 'Products not found'
        });
    }
};

// Middleware to retrieve product photo
export const photo = (req, res, next) => {
    if (req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
};

// List products by search term
export const listSearch = async (req, res) => {
    const query = {};
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: 'i' };
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }
        try {
            const products = await Product.find(query).select('-photo').exec();
            res.json(products);
        } catch (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
    }
};

// Middleware to decrease product quantity after a successful order
export const decreaseQuantity = async (req, res, next) => {
    let bulkOps = req.body.order.products.map(item => {
        return {
            updateOne: {
                filter: { _id: item._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } }
            }
        };
    });

    try {
        await Product.bulkWrite(bulkOps, {});
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Could not update product'
        });
    }
};
