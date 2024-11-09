import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "./apiAdmin";


const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [success, setSuccess] = useState('');  // State to manage success message

    const { user, token } = isAuthenticated();

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            if (data.error) {
                console.error(data.error);
            } else {
                setProducts(data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const destroy = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product permanently?")) {
            console.log(`Deleting product with id: ${productId}`); // Debugging line
            try {
                const data = await deleteProduct(productId, user._id, token);
                if (data.error) {
                    console.error(data.error);
                    setSuccess('');  // Clear success message on error
                } else {
                    setSuccess(`Product deleted successfully: ${productId}`);  // Set success message
                    loadProducts();
                }
            } catch (error) {
                console.error('Error in destroy function:', error);
                setSuccess('');  // Clear success message on error
            }
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const goBack = () => (
        <div className="mt-5">
            <Link to="/admin/dashboard" className="text-warning">
                Back to Dashboard
            </Link>
        </div>
    );
    return (
        <Layout
            title="Manage Products"
            description="Perform CRUD on products"
            className="container-fluid"
        >
            <div className="row">
                <div className="col-12">
                    <h2 className="text-center">Total {products.length} products</h2>
                    <hr />
                    {success && <div className="alert alert-success">{success}</div>}
                    <ul className="list-group">
                        {products.map((p, i) => (
                            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                                <strong>{p.name}</strong>
                                <Link to={`/admin/product/update/${p._id}`}>
                                    <span className="badge badge-warning badge-pill">Update</span>
                                </Link>
                                <span 
                                    onClick={() => destroy(p._id)} 
                                    className="badge badge-danger badge-pill button-like">
                                    Delete
                                </span>
                            </li>
                        ))}
                    </ul>
                    <br />
                </div>
            </div>
            {goBack()}
        </Layout>
    );
};

export default ManageProducts;
