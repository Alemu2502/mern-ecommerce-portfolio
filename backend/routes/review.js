import express from 'express';
import { addReview, getProductReviews} from '../controllers/review.js';
import { requireSignin } from '../controllers/auth.js';

const router = express.Router();

router.post('/review/:productId', addReview);
router.get('/reviews/:productId', getProductReviews);
router.post('/review/:productId', requireSignin, addReview); 

export default router;
