import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getBraintreeClientToken, processPayment, createOrder } from './apiCore';
import { emptyCart } from './cartHelpers';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';
import DropIn from 'braintree-web-drop-in-react';

const Checkout = ({ products, setRun = f => f, run = undefined }) => {
    const [data, setData] = useState({
        loading: false,
        success: false,
        clientToken: null,
        error: '',
        instance: {},
        address: ''
    });

    const instanceRef = useRef();

    const userId = isAuthenticated() && isAuthenticated().user._id;
    const token = isAuthenticated() && isAuthenticated().token;

    const getToken = useCallback(async (userId, token) => {
        try {
            const response = await getBraintreeClientToken(userId, token);
            if (response.error) {
                console.log(response.error);
                setData(data => ({ ...data, error: response.error }));
            } else {
                console.log(response);
                setData(data => ({ ...data, clientToken: response.clientToken }));
            }
        } catch (err) {
            console.error('Error in getToken:', err);
            setData(data => ({ ...data, error: 'Error fetching client token' }));
        }
    }, []);

    useEffect(() => {
        if (userId && token) {
            getToken(userId, token);
        }
    }, [userId, token, getToken]);

    const handleAddress = event => {
        setData({ ...data, address: event.target.value });
    };

    const getTotal = () => {
        return products.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.count * nextValue.price;
        }, 0);
    };

    const showCheckout = () => {
        return isAuthenticated() ? (
            <div>{showDropIn()}</div>
        ) : (
            <Link to="/signin">
                <button className="btn btn-primary">Sign in to checkout</button>
            </Link>
        );
    };

    const buy = async () => {
        setData({ loading: true });
        let nonce;
        try {
            const paymentData = await instanceRef.current.requestPaymentMethod();
            nonce = paymentData.nonce;
            const response = await processPayment(userId, token, {
                paymentMethodNonce: nonce,
                amount: getTotal(products)
            });

            const createOrderData = {
                products: products,
                transaction_id: response.transaction.id,
                amount: response.transaction.amount,
                address: data.address
            };

            await createOrder(userId, token, createOrderData);
            emptyCart(() => {
                setRun(!run);
                console.log('payment success and empty cart');
                setData({
                    loading: false,
                    success: true
                });
            });

        } catch (error) {
            console.log('Error:', error);
            setData({ loading: false, error: error.message });
        }
    };

    const showDropIn = () => (
        <div onBlur={() => setData({ ...data, error: '' })}>
            {data.clientToken !== null && products.length > 0 ? (
                <div>
                    <div className="form-group mb-3">
                        <label className="text-muted">Delivery address:</label>
                        <textarea
                            onChange={handleAddress}
                            className="form-control"
                            value={data.address}
                            placeholder="Type your delivery address here..."
                        />
                    </div>

                    <DropIn
                        options={{
                            authorization: data.clientToken,
                            paypal: {
                                flow: 'vault'
                            }
                        }}
                        onInstance={instance => (instanceRef.current = instance)}
                    />
                    <button onClick={buy} className="btn btn-success btn-block">
                        Pay
                    </button>
                </div>
            ) : null}
        </div>
    );

    const showError = error => (
        <div className="alert alert-danger" style={{ display: error ? '' : 'none' }}>
            {error}
        </div>
    );

    const showSuccess = success => (
        <div className="alert alert-info" style={{ display: success ? '' : 'none' }}>
            Thanks! Your payment was successful!
        </div>
    );

    const showLoading = loading => loading && <h2 className="text-danger">Loading...</h2>;

    return (
        <div>
            <h2>Total: ${getTotal()}</h2>
            {showLoading(data.loading)}
            {showSuccess(data.success)}
            {showError(data.error)}
            {showCheckout()}
        </div>
    );
};

export default Checkout;
