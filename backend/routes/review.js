import express from 'express';
import { addOrUpdateReview, getProductReviews, getUserReview, deleteReview, updateReview } from '../controllers/review.js';
import { requireSignin, isAuth } from '../controllers/auth.js';
import { userById } from '../controllers/user.js';
import { productById } from '../controllers/product.js';

const router = express.Router();

router.post('/review/:productId/:userId', requireSignin, isAuth, addOrUpdateReview);
router.get('/reviews/:productId', getProductReviews);
router.get('/review/:productId/:userId', requireSignin, isAuth, getUserReview);
router.put('/review/:reviewId/:userId', requireSignin, isAuth, updateReview);
router.delete('/review/:reviewId/:productId/:userId', requireSignin, isAuth, deleteReview);

router.param('userId', userById);
router.param('productId', productById);

export default router;
