import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../core/Layout';
import { signup } from '../auth';

const Signup = () => {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        error: '',
        success: false
    });

    const { name, email, password, confirmPassword, success, error } = values;

    const handleChange = name => event => {
        setValues({ ...values, error: false, [name]: event.target.value });
    };

    const clickSubmit = event => {
        event.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setValues({ ...values, error: 'All fields are required', success: false });
            return;
        }
        if (password !== confirmPassword) {
            setValues({ ...values, error: 'Passwords do not match', success: false });
            return;
        }
        setValues({ ...values, error: false });
        signup({ name, email, password })
            .then(response => {
                if (response.error) {
                    if (response.error === 'Email already exists. Please sign in.') {
                        setValues({ 
                            ...values, 
                            error: <span>{response.error} Please <Link to="/signin">sign in</Link>.</span>, 
                            success: false 
                        });
                    } else {
                        setValues({ 
                            ...values, 
                            error: response.error, 
                            success: false 
                        });
                    }
                } else {
                    setValues({
                        ...values,
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        error: '',
                        success: true
                    });
                }
            })
            .catch(err => {
                console.log('Error occurred:', err); // Logging error
                setValues({ 
                    ...values, 
                    error: 'Failed to create account. Please try again.', 
                    success: false 
                });
            });
    };

    const signUpForm = () => (
        <form>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input onChange={handleChange('name')} type="text" className="form-control" value={name} required />
            </div>

            <div className="form-group">
                <label className="text-muted">Email</label>
                <input onChange={handleChange('email')} type="email" className="form-control" value={email} required />
            </div>

            <div className="form-group">
                <label className="text-muted">Password</label>
                <input onChange={handleChange('password')} type="password" className="form-control" value={password} required />
            </div>

            <div className="form-group">
                <label className="text-muted">Confirm Password</label>
                <input onChange={handleChange('confirmPassword')} type="password" className="form-control" value={confirmPassword} required />
            </div>

            <button onClick={clickSubmit} className="btn btn-primary">
                Submit
            </button>
            <hr />
            <button onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'} className="btn btn-danger" style={{ backgroundColor: '#DB4437', borderColor: '#DB4437' }}>
                <img src="/images/google-logo.svg" alt="Google Logo" style={{ width: '20px', marginRight: '8px' }} />
                Sign up with Google
            </button>
            <button onClick={() => window.location.href = 'http://localhost:3000/api/auth/github'} className="btn btn-dark" style={{ backgroundColor: '#333', borderColor: '#333' }}>
                <img src="/images/github-logo.svg" alt="GitHub Logo" style={{ width: '20px', marginRight: '8px' }} />
                Sign up with GitHub
            </button>
        </form>
    );

    const showError = () => (
        <div className="alert alert-danger" style={{ display: error ? '' : 'none' }}>
            {error}
        </div>
    );

    const showSuccess = () => (
        <div className="alert alert-success" style={{ display: success ? '' : 'none' }}>
            <h4>Account Created Successfully!</h4>
            <p>
                Please check your inbox to verify your email address. You can now 
                <Link to="/signin" className="alert-link"> sign in</Link> once verified.
            </p>
        </div>
    );

    return (
        <Layout
            title="Signup"
            description="Signup to Node React E-commerce App"
            className="container col-md-8 offset-md-2"
        >
            {showSuccess()}
            {showError()}
            {signUpForm()}
        </Layout>
    );
};

export default Signup;
