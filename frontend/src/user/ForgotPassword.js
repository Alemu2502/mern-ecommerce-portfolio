import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../core/Layout';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const handleChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/forgot-password`, { email });
            setMessage(response.data.message);
            setMessageType('success');
        } catch (error) {
            const errorMsg = error.response.data.error;
            if (errorMsg.includes('User with that email does not exist')) {
                setMessage(
                    <span>
                        The email address you entered is not registered. Please <Link to="/signup">sign up</Link> first.
                    </span>
                );
            } else if (errorMsg.includes('verify')) {
                setMessage('Please verify your email to request a password reset.');
            } else {
                setMessage(errorMsg);
            }
            setMessageType('error');
        }
    };

    const renderMessage = () => {
        if (messageType === 'success') {
            return <div className="alert alert-success">{message}</div>;
        }
        if (messageType === 'error') {
            return <div className="alert alert-danger">{message}</div>;
        }
        return null;
    };

    return (
        <Layout title="Forgot Password" description="Reset your password" className="container col-md-8 offset-md-2">
            <h2 className="mt-5 mb-4 text-center">Forgot Password</h2>
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="form-group">
                    <label className="text-muted">Email</label>
                    <input type="email" value={email} onChange={handleChange} required className="form-control" />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Submit</button>
            </form>
            {renderMessage()}
        </Layout>
    );
};

export default ForgotPassword;
