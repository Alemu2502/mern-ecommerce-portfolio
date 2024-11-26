import React, { useState, useEffect } from 'react';
import Layout from '../core/Layout';
import { isAuthenticated } from '../auth'; // Ensure you import the authentication utility
import { Link } from 'react-router-dom';
import { getProduct, getReviews } from './apiCore';

const ViewProduct = ({ match }) => {
    const [product, setProduct] = useState({});
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(false);

    const { user, token } = isAuthenticated(); // Get user and token from authentication

    const loadSingleProduct = productId => {
        getProduct(productId).then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setProduct(data);
                loadReviews(productId);
            }
        });
    };

    const loadReviews = productId => {
        getReviews(productId).then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setReviews(data);
            }
        });
    };

    useEffect(() => {
        const productId = match.params.productId;
        loadSingleProduct(productId);
    }, [match.params.productId]);

    const goBack = () => (
        <div className="mt-5">
            <Link to="/admin/dashboard" className="text-warning">
                Back to Dashboard
            </Link>
        </div>
    );

    return (
        <Layout
            title={product && product.name}
            description={product && product.description && product.description.substring(0, 100)}
            className="container-fluid"
        >
            <div className="row">
                <div className="col-8">
                    {error && <h2 className="text-danger">{error}</h2>}
                    {product && product.description && (
                        <div>
                            <h2>{product.name}</h2>
                            <p>{product.description}</p>
                            <h3>${product.price}</h3>
                        </div>
                    )}
                    {reviews && reviews.length > 0 && (
                        <div>
                            <h4>Product Reviews</h4>
                            <ul className="list-group">
                                {reviews.map((review, i) => (
                                    <li key={i} className="list-group-item">
                                        <strong>{review.rating} Stars</strong>
                                        <p>{review.comment}</p>
                                        <p>By {review.user.name}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="col-4">
                    <h4>Related products</h4>
                    {/* Render related products here */}
                </div>
            </div>
            {goBack()}
        </Layout>
    );
};

export default ViewProduct;
