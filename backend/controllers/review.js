import Review from '../models/review.js';
import Product from '../models/product.js';
import { errorHandler } from '../helpers/dbErrorHandler.js';


export const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  console.log('Update Review: Checking if review exists and user is authorized...');
  
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      console.log('Review not found');
      return res.status(404).json({ error: 'Review not found' });
    }

    console.log('Auth user:', req.auth._id);
    console.log('Review user:', review.user);
    if (review.user.toString() !== req.auth._id.toString()) {
      console.log('User not authorized to update this review', { reviewUserId: review.user, authUserId: req.auth._id });
      return res.status(403).json({ error: 'User not authorized to update this review' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();
    console.log('Review updated successfully');
    return res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(400).json({ error: 'Unable to update review' });
  }
};

// Controller to get user review for a product
export const getUserReview = async (req, res) => {
  const { productId, userId } = req.params;
  try {
    const review = await Review.findOne({ product: productId, user: userId });
    if (!review) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }
    res.json(review);
  } catch (error) {
    res.status(400).json({
      error: 'Something went wrong'
    });
  }
};

// Controller to add or update review
export const addOrUpdateReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;
  const userId = req.auth._id;

  try {
    const existingReview = await Review.findOne({ product: productId, user: userId });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      return res.json(existingReview);
    } else {
      const review = new Review({
        user: userId,
        product: productId,
        rating,
        comment
      });
      await review.save();

      const product = await Product.findById(productId);
      product.reviews.push(review._id);
      await product.save();

      return res.status(201).json(review);
    }
  } catch (error) {
    console.error('Error adding or updating review:', error);
    return res.status(400).json({
      error: errorHandler(error)
    });
  }
};

// Controller to get product reviews

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId });
    if (!reviews) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }
    res.json(reviews);
  } catch (error) {
    res.status(400).json({
      error: 'Something went wrong'
    });
  }
};

export const deleteReview = async (req, res) => {
  const { reviewId, productId, userId } = req.params;
  console.log('Request Parameters:', { reviewId, productId, userId });

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      console.log('Review not found');
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user.toString() !== req.auth._id.toString()) {
      console.log('User not authorized to delete this review');
      return res.status(403).json({ error: 'User not authorized to delete this review' });
    }

    await Product.findByIdAndUpdate(productId, { $pull: { reviews: reviewId } });
    await review.deleteOne(); // Correct method to delete the review
    console.log('Review deleted successfully');
    return res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(400).json({ error: 'Unable to delete review' });
  }
};
