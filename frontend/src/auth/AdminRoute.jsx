import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './index';

const AdminRoute = ({ component: Component, ...rest }) => {
    const location = useLocation();

    return isAuthenticated() && isAuthenticated().user.role === 1 ? (
        <Component {...rest} />
    ) : (
        <Navigate
            to="/signin"
            state={{ from: location }}
        />
    );
};

export default AdminRoute;
