import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { getProducts } from './apiCore';
import Card from './Card';
import Search from './Search';

const Home = () => {
    const [productsBySell, setProductsBySell] = useState([]);
    const [productsByArrival, setProductsByArrival] = useState([]);
    const [error, setError] = useState(false);

    const loadProductsBySell = () => {
        getProducts('sold').then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setProductsBySell(data);
            }
        }).catch(err => setError('Failed to load products by sell'));
    };

    const loadProductsByArrival = () => {
        getProducts('createdAt').then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setProductsByArrival(data);
            }
        }).catch(err => setError('Failed to load products by arrival'));
    };

    useEffect(() => {
        loadProductsByArrival();
        loadProductsBySell();
    }, []);

    return (
        <Layout
            title="FullStack React Node MongoDB Ecommerce App"
            description="Node React E-commerce App"
            className="container-fluid"
        >
            <Search />
            {error && <h2 className="text-danger">{error}</h2>}
            <h2 className="mb-4">New Arrivals</h2>
            <div className="row">
                {productsByArrival.map((product, i) => (
                    <div key={i} className="col-4 mb-3">
                        <Card product={product} />
                        {/* {product.reviews && product.reviews.length > 0 ? (
                            <p>Average Rating: {(product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length).toFixed(1)} stars</p>
                        ) : (
                            <p>Average Rating: No ratings yet</p>
                        )} */}
                    </div>
                ))}
            </div>

            <h2 className="mb-4">Best Sellers</h2>
            <div className="row">
                {productsBySell.map((product, i) => (
                    <div key={i} className="col-4 mb-3">
                        <Card product={product} />
                        {/* {product.reviews && product.reviews.length > 0 ? (
                            <p>Average Rating: {(product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length).toFixed(1)} stars</p>
                        ) : (
                            <p>Average Rating: No ratings yet</p>
                        )} */}
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default Home;
