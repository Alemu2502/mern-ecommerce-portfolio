import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (event) => {
        setNewPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/reset-password`, { resetPasswordToken: token, newPassword });
            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
        } catch (error) {
            setMessage(error.response.data.error);
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>New Password</label>
                    <input type="password" value={newPassword} onChange={handleChange} required />
                </div>
                <button type="submit">Submit</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default ResetPassword;
