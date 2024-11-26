import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../core/Layout';
import { isAuthenticated } from '../auth';
import { getProduct, getCategories, updateProduct } from './apiAdmin';
import { useNavigate, useParams } from 'react-router-dom'; // Removed 'Link' and 'Navigate'

const UpdateProduct = () => {
    const [values, setValues] = useState({
        name: '',
        description: '',
        price: '',
        author: '',
        category: '',
        shipping: '',
        quantity: '',
        photo: '',
        loading: false,
        error: '',
        createdProduct: '',
        showSuccessModal: false,
        showErrorModal: false,
        formData: new FormData(),
        categories: []
    });

    const { name, description, price, author, category, shipping, quantity, loading, error, createdProduct, showSuccessModal, showErrorModal, formData, categories } = values;
    const { user, token } = isAuthenticated();
    const { productId } = useParams();
    const navigate = useNavigate();

    const initCategories = useCallback(() => {
        getCategories().then(data => {
            if (data.error) {
                setValues(v => ({ ...v, error: data.error }));
            } else {
                setValues(v => ({ ...v, categories: data, formData: new FormData() }));
            }
        });
    }, []);

    const init = useCallback(() => {
        getProduct(productId).then(data => {
            if (data.error) {
                setValues(v => ({ ...v, error: data.error }));
            } else {
                setValues(v => ({
                    ...v,
                    name: data.name || '',
                    description: data.description || '',
                    price: data.price || '',
                    author: data.author || '',
                    category: data.category._id || '',
                    shipping: data.shipping || '',
                    quantity: data.quantity || '',
                    formData: new FormData()
                }));
                initCategories();
            }
        });
    }, [productId, initCategories]);

    useEffect(() => {
        init();
    }, [init]);

    const handleChange = name => event => {
        const value = name === 'photo' ? event.target.files[0] : event.target.value;
        formData.set(name, value);
        setValues({ ...values, [name]: value });
    };

    const clickSubmit = event => {
        event.preventDefault();
        setValues({ ...values, error: '', loading: true });

        updateProduct(productId, user._id, token, formData).then(data => {
            if (data.error) {
                setValues({ ...values, error: data.error, loading: false, showErrorModal: true });
            } else {
                setValues({
                    ...values,
                    name: '',
                    description: '',
                    photo: '',
                    price: '',
                    author: '',
                    quantity: '',
                    loading: false,
                    createdProduct: data.name,
                    showSuccessModal: true
                });
                setTimeout(() => {
                    navigate('/admin/products');
                }, 2000);
            }
        });
    };

    const newPostForm = () => (
        <form className="mb-3" onSubmit={clickSubmit}>
            <h4 className="text-primary">Post Photo</h4>
            <div className="form-group">
                <label className="btn btn-outline-info">
                    <input onChange={handleChange('photo')} type="file" name="photo" accept="image/*" />
                </label>
            </div>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input onChange={handleChange('name')} type="text" className="form-control" value={name} />
            </div>
            <div className="form-group">
                <label className="text-muted">Description</label>
                <textarea onChange={handleChange('description')} className="form-control" value={description} />
            </div>
            <div className="form-group">
                <label className="text-muted">Price</label>
                <input onChange={handleChange('price')} type="number" className="form-control" value={price} />
            </div>
            <div className="form-group">
                <label className="text-muted">Author</label>
                <input onChange={handleChange('author')} type="text" className="form-control" value={author} aria-label="Author Name" required />
            </div>
            <div className="form-group">
                <label className="text-muted">Category</label>
                <select onChange={handleChange('category')} className="form-control" value={category}>
                    <option value="">Please select</option>
                    {categories && categories.map((c, i) => (
                        <option key={i} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="text-muted">Shipping</label>
                <select onChange={handleChange('shipping')} className="form-control" value={shipping}>
                    <option value="">Please select</option>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                </select>
            </div>
            <div className="form-group">
                <label className="text-muted">Quantity</label>
                <input onChange={handleChange('quantity')} type="number" className="form-control" value={quantity} />
            </div>
            <button className="btn btn-outline-primary">Update Product</button>
        </form>
    );

    const showErrorModalContent = () => (
        <div className="modal" style={{ display: showErrorModal ? 'block' : 'none' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Error</h5>
                        <button type="button" className="btn-close" onClick={() => setValues({ ...values, showErrorModal: false })}></button>
                    </div>
                    <div className="modal-body">
                        <p>{error}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setValues({ ...values, showErrorModal: false })}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const showSuccessModalContent = () => (
        <div className="modal" style={{ display: showSuccessModal ? 'block' : 'none' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Success</h5>
                        <button type="button" className="btn-close" onClick={() => setValues({ ...values, showSuccessModal: false })}></button>
                    </div>
                    <div className="modal-body">
                        <p>{`${createdProduct}`} has been updated successfully!</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setValues({ ...values, showSuccessModal: false })}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const showLoading = () => loading && (
        <div className="alert alert-warning">
            <h2>Loading...</h2>
        </div>
    );

    return (
        <Layout title="Update a product" description={`G'day ${user.name}, ready to update a product?`} className="container-fluid">
            <div className="row">
                <div className="col-md-8 offset-md-2">
                    {showLoading()}
                    {showErrorModalContent()}
                    {showSuccessModalContent()}
                    {newPostForm()}
                </div>
            </div>
        </Layout>
    );
};

export default UpdateProduct;
