import React, { useState, useEffect, useCallback } from 'react';
import { getReviews } from './apiCore';
import StarRating from './StarRating';

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(false);

  const loadReviews = useCallback(() => {
    getReviews(productId).then(data => {
      if (data.error) {
        setError(data.error);
      } else {
        setReviews(data);
      }
    });
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div>
      {error && <h2 className="text-danger">{error}</h2>}
      {reviews.length === 0 && <p>No reviews yet.</p>}
      {reviews.map((review, index) => (
        <div key={index} className="mb-4">
          <h5>{review.user.name}</h5>
          <StarRating count={5} value={review.rating} size={24} edit={false} /><br /><br />
          <p>{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default Reviews;
