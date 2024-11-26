import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './index';

const PrivateRoute = ({ component: Component, ...rest }) => {
    const location = useLocation();

    return isAuthenticated() ? (
        <Component {...rest} />
    ) : (
        <Navigate
            to="/signin"
            state={{ from: location }}
        />
    );
};

export default PrivateRoute;
