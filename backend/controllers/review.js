import {Review} from '../models/review.js';
import Product from '../models/product.js';

// Controller to add a review
export const addReview = async (req, res) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    try {
        const review = new Review({
            user: req.auth._id,  // Use req.auth._id to get the authenticated user ID
            product: productId,
            rating,
            comment
        });
        await review.save();

        // Optionally, update the product's average rating
        const product = await Product.findById(productId);
        product.reviews.push(review);
        await product.save();

        res.status(201).json(review);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(400).json({ error: 'Unable to add review' });
    }
};

// Controller to get product reviews
export const getProductReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const reviews = await Review.find({ product: productId }).populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        console.error('Error getting product reviews:', error);
        res.status(400).json({ error: 'Unable to get product reviews' });
    }
};
