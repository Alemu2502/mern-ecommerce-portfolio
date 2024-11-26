import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
    const { token } = useParams();
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/verify-email`, { token });
                setMessage(response.data.message);
                setTimeout(() => {
                    navigate('/signin');
                }, 3000); // Redirect after 3 seconds
            } catch (error) {
                setMessage(error.response.data.error);
            }
        };
        verifyEmail();
    }, [token, navigate]);

    return (
        <div>
            <h2>Email Verification</h2>
            <p>{message}</p>
        </div>
    );
};

export default EmailVerification;
