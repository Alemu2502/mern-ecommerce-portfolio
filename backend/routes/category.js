import express from 'express';
const router = express.Router();

import { create, categoryById, read, update, remove, list } from '../controllers/category.js';
import { requireSignin, isAuth, isAdmin } from '../controllers/auth.js';
import { userById } from '../controllers/user.js';

// Route to get a category by ID
router.get('/category/:categoryId', read);

// Route to create a new category (requires admin privileges)
router.post('/category/create/:userId', requireSignin, isAuth, isAdmin, create);

// Route to update a category by ID (requires admin privileges)
router.put('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, update);

// Route to delete a category by ID (requires admin privileges)
router.delete('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, remove);

// Route to list all categories
router.get('/categories', list);

// Middleware to extract category by ID
router.param('categoryId', categoryById);

// Middleware to extract user by ID
router.param('userId', userById);

export default router;
