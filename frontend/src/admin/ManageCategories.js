import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import { getCategories, deleteCategory } from "./apiAdmin";

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { user, token } = isAuthenticated();

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            if (data.error) {
                setError(data.error);
            } else {
                setCategories(data);
            }
        } catch (error) {
            setError('Error loading categories');
            console.error('Error loading categories:', error);
        }
    };

    const destroy = async (categoryId) => {
        if (window.confirm("Are you sure you want to delete this category permanently?")) {
            try {
                const data = await deleteCategory(categoryId, user._id, token);
                if (data.error) {
                    setError(data.error);
                } else {
                    setMessage(`Category deleted successfully: ${categoryId}`);
                    loadCategories();
                }
            } catch (error) {
                setError('Error deleting category');
                console.error('Error deleting category:', error);
            }
        }
    };

    useEffect(() => {
        loadCategories();
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
            title="Manage Categories"
            description="Perform CRUD on categories"
            className="container-fluid"
        >
            <div className="row">
                <div className="col-12">
                    <h2 className="text-center">Total {categories.length} categories</h2>
                    <hr />
                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    <ul className="list-group">
                        {categories.map((c, i) => (
                            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center w-100">
                                    <strong className="flex-grow-1">{c.name}</strong>
                                    <div className="button-group">
                                        <Link to={`/admin/category/update/${c._id}`} className="btn btn-warning btn-sm mx-2">
                                            Update
                                        </Link>
                                        <button
                                            onClick={() => destroy(c._id)}
                                            className="btn btn-danger btn-sm mx-2"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
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

export default ManageCategories;
