import React from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

const ReviewList = ({ reviews }) => {
    return (
        <div className="review-list">
            {reviews.map(review => (
                <div key={review._id} className="review-item">
                    <StarRating rating={review.rating} />
                    <p>{review.comment}</p>
                    <small>By {review.user.name} on {new Date(review.createdAt).toLocaleDateString()}</small>
                </div>
            ))}
        </div>
    );
};

ReviewList.propTypes = {
    reviews: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            rating: PropTypes.number.isRequired,
            comment: PropTypes.string.isRequired,
            user: PropTypes.shape({
                name: PropTypes.string.isRequired
            }).isRequired,
            createdAt: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default ReviewList;
