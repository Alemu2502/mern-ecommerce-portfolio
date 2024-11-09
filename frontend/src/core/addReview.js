import React, { useState } from 'react';
import { addReview } from './apiCore';
import { isAuthenticated } from '../auth';

const AddReview = ({ productId }) => {
    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState('');
    const auth = isAuthenticated();
    const token = auth ? auth.token : '';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (token) {
            addReview(productId, { rating, comment }, token).then((data) => {
                if (data && data.error) {
                    console.log(data.error);
                } else {
                    console.log('Review submitted successfully');
                }
            });
        } else {
            console.log('No token available');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Rating</label>
            <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min="1"
                max="5"
            />
            <label>Comment</label>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Submit Review</button>
        </form>
    );
};

export default AddReview;
