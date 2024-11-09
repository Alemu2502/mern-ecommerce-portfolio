import express from 'express';
const router = express.Router();

import {
    create,
    productById,
    read,
    remove,
    update,
    list,
    listRelated,
    listCategories,
    listBySearch,
    photo,
    listSearch
} from '../controllers/product.js';
import { requireSignin, isAuth, isAdmin } from '../controllers/auth.js';
import { userById } from '../controllers/user.js';

// Route to get a product by ID
router.get('/product/:productId', read);

// Route to create a new product (requires admin privileges)
router.post('/product/create/:userId', requireSignin, isAuth, isAdmin, create);

// Route to delete a product (requires admin privileges)
router.delete('/product/:productId/:userId', requireSignin, isAuth, isAdmin, remove);

// Route to update a product (requires admin privileges)
router.put('/product/:productId/:userId', requireSignin, isAuth, isAdmin, update);

// Route to list all products
router.get('/products', list);

// Route to search for products
router.get('/products/search', listSearch);

// Route to get related products
router.get('/products/related/:productId', listRelated);

// Route to list all categories
router.get('/products/categories', listCategories);

// Route to search for products by specific criteria
router.post('/products/by/search', listBySearch);

// Route to get product photo by ID
router.get('/product/photo/:productId', photo);

// Middleware to extract user by ID
router.param('userId', userById);

// Middleware to extract product by ID
router.param('productId', productById);

export default router;
