import React, { useState, useEffect } from 'react';
import Layout from '../core/Layout';
import { isAuthenticated } from '../auth';
import { Navigate, useParams } from 'react-router-dom'; // Import useParams hook
import { read, update, updateUser } from './apiUser';

const Profile = () => {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        error: false,
        success: false
    });

    const { token } = isAuthenticated();
    const { userId } = useParams(); // Destructure userId from useParams hook
    const { name, email, password, success } = values;

    useEffect(() => {
        const init = (userId, token) => {
            read(userId, token).then(data => {
                if (data.error) {
                    setValues(v => ({ ...v, error: true })); // Use functional update
                } else {
                    setValues(v => ({ ...v, name: data.name, email: data.email })); // Use functional update
                }
            });
        };
        init(userId, token); // Use userId from useParams hook
    }, [userId, token]); // Use userId from useParams hook

    const handleChange = name => e => {
        setValues({ ...values, error: false, [name]: e.target.value });
    };

    const clickSubmit = e => {
        e.preventDefault();
        update(userId, token, { name, email, password }).then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                updateUser(data, () => {
                    setValues({
                        ...values,
                        name: data.name,
                        email: data.email,
                        success: true
                    });
                });
            }
        });
    };

    const redirectUser = success => {
        if (success) {
            return <Navigate to="/cart" />;
        }
    };

    const profileUpdate = (name, email, password) => (
        <form>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input type="text" onChange={handleChange('name')} className="form-control" value={name} />
            </div>
            <div className="form-group">
                <label className="text-muted">Email</label>
                <input type="email" onChange={handleChange('email')} className="form-control" value={email} />
            </div>
            <div className="form-group">
                <label className="text-muted">Password</label>
                <input type="password" onChange={handleChange('password')} className="form-control" value={password} />
            </div>

            <button onClick={clickSubmit} className="btn btn-primary">
                Submit
            </button>
        </form>
    );

    return (
        <Layout title="Profile" description="Update your profile" className="container-fluid">
            <h2 className="mb-4">Profile update</h2>
            {profileUpdate(name, email, password)}
            {redirectUser(success)}
        </Layout>
    );
};

export default Profile;
