import React, { useReducer, useEffect, useCallback } from 'react';
import Layout from '../core/Layout';
import { isAuthenticated } from '../auth';
import { createProduct, getCategories } from './apiAdmin';
import { Link } from 'react-router-dom';

const initialState = {
    name: '',
    description: '',
    price: '',
    categories: [],
    category: '',
    shipping: '',
    quantity: '',
    photo: '',
    author: '', // Added author field
    loading: false,
    error: '',
    createdProduct: '',
    formData: new FormData()
};

const productReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'SET_CATEGORIES':
            return { ...state, categories: action.categories, formData: new FormData() };
        case 'SET_LOADING':
            return { ...state, loading: true, error: '', createdProduct: '' };
        case 'SET_ERROR':
            return { ...state, error: action.error, loading: false };
        case 'SET_SUCCESS':
            return { ...state, ...initialState, createdProduct: action.createdProduct };
        default:
            return state;
    }
};

const AddProduct = () => {
    const [state, dispatch] = useReducer(productReducer, initialState);
    const { user, token } = isAuthenticated();

    const init = useCallback(() => {
        getCategories().then(data => {
            if (data.error) {
                dispatch({ type: 'SET_ERROR', error: data.error });
            } else {
                dispatch({ type: 'SET_CATEGORIES', categories: data });
            }
        });
    }, []);

    useEffect(() => {
        init();
    }, [init]);

    const handleChange = name => event => {
        const value = name === 'photo' ? event.target.files[0] : event.target.value;
        state.formData.set(name, value);
        dispatch({ type: 'SET_FIELD', field: name, value });
    };

    const clickSubmit = async (event) => {
        event.preventDefault();
        dispatch({ type: 'SET_LOADING' });

        try {
            const data = await createProduct(user._id, token, state.formData);
            if (data && data.error) {
                dispatch({ type: 'SET_ERROR', error: data.error });
            } else {
                dispatch({ type: 'SET_SUCCESS', createdProduct: data ? data.name : '' });
            }
        } catch (err) {
            dispatch({ type: 'SET_ERROR', error: 'Failed to create product' });
            console.error('Failed to create product', err);
        }
    };

    const newPostForm = () => (
        <form className="mb-3" onSubmit={clickSubmit}>
            <h4>Post Photo</h4>
            <div className="form-group">
                <label className="btn btn-secondary">
                    <input onChange={handleChange('photo')} type="file" name="photo" accept="image/*" aria-label="Upload Photo" />
                </label>
            </div>

            <div className="form-group">
                <label className="text-muted">Name</label>
                <input onChange={handleChange('name')} type="text" className="form-control" value={state.name} aria-label="Product Name" required />
            </div>

            <div className="form-group">
                <label className="text-muted">Description</label>
                <textarea onChange={handleChange('description')} className="form-control" value={state.description} aria-label="Product Description" required />
            </div>

            <div className="form-group">
                <label className="text-muted">Price</label>
                <input onChange={handleChange('price')} type="number" className="form-control" value={state.price} aria-label="Product Price" required />
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="text-muted">Author</label> {/* Adjusted Author spacing */}
                <input onChange={handleChange('author')} type="text" className="form-control" value={state.author} aria-label="Author Name" required />
            </div>

            <div className="form-group">
                <label className="text-muted">Category</label>
                <select onChange={handleChange('category')} className="form-control" value={state.category} aria-label="Product Category" required>
                    <option value="" disabled>Please select</option>
                    {state.categories.map((c, i) => (
                        <option key={i} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="text-muted">Shipping</label>
                <select onChange={handleChange('shipping')} className="form-control" value={state.shipping} aria-label="Product Shipping" required>
                    <option value="" disabled>Please select</option>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                </select>
            </div>

            <div className="form-group">
                <label className="text-muted">Quantity</label>
                <input onChange={handleChange('quantity')} type="number" className="form-control" value={state.quantity} aria-label="Product Quantity" required />
            </div>

            <button className="btn btn-outline-primary">Create Product</button>
        </form>
    );

    const showError = () => (
        <div className="alert alert-danger" style={{ display: state.error ? '' : 'none' }}>
            {state.error}
        </div>
    );

    const showSuccess = () => (
        <div className="alert alert-info" style={{ display: state.createdProduct ? '' : 'none' }}>
            <h2>{`${state.createdProduct}`} is created!</h2>
        </div>
    );

    const showLoading = () =>
        state.loading && (
            <div className="alert alert-success">
                <h2>Loading...</h2>
            </div>
        );

    const goBack = () => (
        <div className="mt-5">
            <Link to="/admin/dashboard" className="text-warning">
                Back to Dashboard
            </Link>
        </div>
    );

    return (
        <Layout title="Add a new product" description={`G'day ${user.name}, ready to add a new product?`}>
            <div className="row">
                <div className="col-md-8 offset-md-2">
                    {showLoading()}
                    {showSuccess()}
                    {showError()}
                    {newPostForm()}
                    {goBack()}
                </div>
            </div>
        </Layout>
    );
};

export default AddProduct;
