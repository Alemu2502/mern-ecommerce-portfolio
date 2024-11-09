import React, { useEffect, useState } from 'react';
import { getProductReviews } from './apiCore';

const Reviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (productId) {
            console.log(`Fetching reviews for product ID: ${productId}`);
            getProductReviews(productId).then((data) => {
                if (data && data.error) {
                    console.log(data.error);
                } else {
                    setReviews(data);
                }
            }).catch(error => {
                console.error('Error fetching reviews:', error);
            });
        } else {
            console.log('Product ID is undefined');
        }
    }, [productId]);

    return (
        <div>
            <h2>Reviews</h2>
            {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                    <div key={review._id}>
                        <strong>{review.user.name}</strong>
                        <div>{review.rating} stars</div>
                        <p>{review.comment}</p>
                    </div>
                ))
            ) : (
                <div>No reviews yet</div>
            )}
        </div>
    );
};

export default Reviews;
