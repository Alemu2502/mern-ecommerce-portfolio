import React, { useState, useEffect } from 'react';
import { addReview, getUserReview, updateReview, deleteReview } from './apiCore';
import StarRating from './StarRating';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';

const ReviewForm = ({ productId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { user, token } = isAuthenticated();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [reviewId, setReviewId] = useState('');
  const [hasCheckedReview, setHasCheckedReview] = useState(false);

  useEffect(() => {
    const checkReviewExists = async () => {
      if (user && token && !hasCheckedReview) {
        try {
          // Only call the API if the user hasn't already reviewed this product
          const data = await getUserReview(productId, user._id, token);
          
          // If review exists, set the values
          if (data && !data.error) {
            setRating(data.rating);
            setComment(data.comment);
            setReviewId(data._id);
          } else {
            console.log('No review found for this product by the user');
          }
        } catch (err) {
          // We do not call the API if no review exists, so handle it gracefully
          if (err.message !== 'Review not found') {
            console.error('Error fetching user review:', err);
          }
        } finally {
          setHasCheckedReview(true); // Avoid calling again
        }
      }
    };

    // Only check for review if the user and token are present
    if (user && token && !hasCheckedReview) {
      checkReviewExists();
    }
  }, [productId, user, token, hasCheckedReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('Please sign in first to leave a review.');
      setIsError(true);
      return;
    }
    if (rating === 0) {
      setMessage('Please select a star rating.');
      setIsError(true);
      return;
    }

    const review = { rating, comment };
    try {
      let response;
      if (reviewId) {
        // If the review already exists, update it
        response = await updateReview(reviewId, review, token);
      } else {
        // If no review exists, create a new one
        response = await addReview(productId, user._id, review, token);
        if (!response.error) {
          setReviewId(response._id); // Save the review ID for future updates or deletes
        }
      }

      if (!response.error) {
        onReviewSubmit();
        setMessage(reviewId ? 'Your review has been updated successfully!' : 'Thank you for your review!');
        setIsError(false);
      } else {
        setMessage('Failed to submit review. Please try again.');
        setIsError(true);
      }
    } catch (err) {
      setMessage('Error submitting review. Please try again.');
      setIsError(true);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteReview(reviewId, productId, user._id, token);
      if (!response.error) {
        onReviewSubmit();
        setRating(0);
        setComment('');
        setReviewId('');
        setMessage('Your review has been deleted.');
        setIsError(false);
      } else {
        setMessage('Failed to delete review. Please try again.');
        setIsError(true);
      }
    } catch (err) {
      setMessage('Error deleting review. Please try again.');
      setIsError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <p style={{ color: isError ? 'red' : 'green' }}>
          {message} {message === 'Please sign in first to leave a review.' && <Link to="/signin">Sign in</Link>}
        </p>
      )}
      <label htmlFor="rating">Rating</label><br />
      <div style={{ marginBottom: '10px' }}>
        <StarRating
          count={5}
          value={rating}
          size={24}
          color="#ffd700"
          edit={true}
          onChange={setRating}
        />
      </div><br />
      <label htmlFor="comment">Comment</label>
      <textarea
        id="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comment"
        style={{ marginTop: '10px', width: '100%', padding: '10px' }}
        required
      />
      <button type="submit" style={{ marginTop: '10px' }}>{reviewId ? 'Update Review' : 'Submit Review'}</button>
      {reviewId && <button type="button" onClick={handleDelete} style={{ marginTop: '10px' }}>Delete Review</button>}
    </form>
  );
};

export default ReviewForm;
