import React, { useState, useEffect } from 'react';
import Layout from '../core/Layout';
import { isAuthenticated } from '../auth';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCategory, updateCategory } from './apiAdmin';

const UpdateCategory = () => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { user, token } = isAuthenticated();
    const { categoryId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            try {
                const data = await getCategory(categoryId, token);
                if (data.error) {
                    setError(data.error);
                } else {
                    setName(data.name);
                }
            } catch (error) {
                setError('Error loading category');
                console.error('Error loading category:', error);
            }
        };

        init();
    }, [categoryId, token]);

    const handleChange = (event) => {
        setError('');
        setName(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        try {
            const data = await updateCategory(categoryId, user._id, token, { name });
            if (data.error) {
                setError(data.error);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/admin/categories');
                }, 2000);
            }
        } catch (error) {
            setError('Error updating category');
            console.error('Error updating category:', error);
        }
    };

    const updateCategoryForm = () => (
        <form className="mb-5" onSubmit={handleSubmit}>
            <h4>Update Category</h4>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={name}
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
        </form>
    );

    const showError = () => (
        error && <div className="alert alert-danger">{error}</div>
    );

    const showSuccess = () => (
        success && <div className="alert alert-success">Category updated successfully</div>
    );

    return (
        <Layout
            title={`Hi ${user.name}`}
            description={`Update Category`}
            className="container-fluid"
        >
            <div className="row">
                <div className="col-md-8 offset-md-2">
                    {showError()}
                    {showSuccess()}
                    {updateCategoryForm()}
                    <Link to="/admin/categories" className="btn btn-info mt-5">
                        Back to Categories
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default UpdateCategory;
