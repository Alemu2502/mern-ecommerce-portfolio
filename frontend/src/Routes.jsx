import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from './user/Signup';
import Signin from './user/Signin';
import Home from './core/Home';
import PrivateRoute from './auth/PrivateRoute';
import Dashboard from './user/UserDashboard';
import AdminRoute from './auth/AdminRoute';
import AdminDashboard from './user/AdminDashboard';
import AddCategory from './admin/AddCategory';
import AddProduct from './admin/AddProduct';
import Shop from './core/Shop';
import Product from './core/Product';
import Cart from './core/Cart';
import Orders from './admin/Orders';
import Profile from './user/Profile';
import ManageProducts from './admin/ManageProducts';
import ManageCategories from './admin/ManageCategories'; // Import ManageCategories
import UpdateProduct from './admin/UpdateProduct';
import UpdateCategory from './admin/UpdateCategory';
import EmailVerification from './user/EmailVerification';
import ForgotPassword from './user/ForgotPassword';
import ResetPassword from './user/ResetPassword';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/user/dashboard" element={<PrivateRoute component={Dashboard} />} />
            <Route path="/admin/dashboard" element={<AdminRoute component={AdminDashboard} />} />
            <Route path="/create/category" element={<AdminRoute component={AddCategory} />} />
            <Route path="/create/product" element={<AdminRoute component={AddProduct} />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin/orders" element={<AdminRoute component={Orders} />} />
            <Route path="/profile/:userId" element={<PrivateRoute component={Profile} />} />
            <Route path="/admin/products" element={<PrivateRoute component={ManageProducts} />} />
            <Route path="/admin/categories" element={<AdminRoute component={ManageCategories} />} /> {/* Add this line */}
            <Route path="/admin/product/update/:productId" element={<AdminRoute component={UpdateProduct} />} />
            <Route path="/admin/category/update/:categoryId" element={<AdminRoute component={UpdateCategory} />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
    );
};

export default AppRoutes;
