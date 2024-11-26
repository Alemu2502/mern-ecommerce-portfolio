import { API } from '../config';
import queryString from 'query-string';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    const errorMessage = error.error || 'Unknown error';
    throw new Error(errorMessage);
  }

  return response.json();
};

const fetchWithToken = async (url, options, token) => {
  if (!token) {
    throw new Error('No token available');
  }
  const authHeader = { Authorization: `Bearer ${token}` };
  options.headers = { ...options.headers, ...authHeader };
  const response = await fetch(url, options);
  return await handleResponse(response);
};

export const updateReview = async (reviewId, review, userId, token) => {
  try {
    const response = await fetchWithToken(`${API}/review/${reviewId}/${userId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(review)
    }, token);
    return response;
  } catch (err) {
    return { error: err.message };
  }
};

export const getUserReview = async (productId, userId, token) => {
  try {
    const response = await fetchWithToken(`${API}/review/${productId}/${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }, token);
    return response;
  } catch (err) {
    if (err.message === 'Review not found') {
      return { error: 'Review not found' };
    }
    return { error: err.message };
  }
};


export const deleteReview = async (reviewId, productId, userId, token) => {
  try {
    console.log('Making DELETE request to URL:', `${API}/review/${reviewId}/${productId}/${userId}`);
    const response = await fetchWithToken(`${API}/review/${reviewId}/${productId}/${userId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json'
      }
    }, token);
    return response; 
  } catch (err) {
    console.error('Error deleting review:', err);
    return { error: err.message };
  }
};


export const addReview = async (productId, userId, review, token) => {
  try {
    const response = await fetchWithToken(`${API}/review/${productId}/${userId}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review)
    }, token);
    return await response;
  } catch (err) {
    console.error('Error adding review:', err);
    return { error: err.message };
  }
};

export const getReviews = async (productId) => {
  try {
    const response = await fetch(`${API}/reviews/${productId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return { error: err.message };
  }
};


export const getProductReviews = async (productId) => {
    try {
        const response = await fetch(`${API}/reviews/${productId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            const errorMessage = error.error || 'Unknown error';
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting product reviews:', error.message);
        return { error: error.message };
    }
};

export const getProducts = async (sortBy) => {
  try {
    const response = await fetch(`${API}/products?sortBy=${sortBy}&order=desc&limit=6`, {
      method: "GET"
    });
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${API}/categories`, {
      method: "GET"
    });
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};

export const getFilteredProducts = async (skip, limit, filters = {}) => {
  const data = { limit, skip, filters };
  try {
    const response = await fetch(`${API}/products/by/search`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};

export const list = async (params) => {
  const query = queryString.stringify(params);
  console.log("query", query);
  try {
    const response = await fetch(`${API}/products/search?${query}`, {
      method: "GET"
    });
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};

export const read = async (productId) => { 
  try { 
    const response = await fetch(`${API}/product/${productId}`, { method: 'GET' }); 
    return await handleResponse(response); } catch (err) { console.error(err); 
  return { error: 'Failed to load product' }; } };

export const listRelated = async (productId) => {
  try {
    const response = await fetch(`${API}/products/related/${productId}`, {
      method: "GET"
    });
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};

export const getBraintreeClientToken = async (userId, token) => {
  try {
    const response = await fetchWithToken(`${API}/braintree/getToken/${userId}`, {
      method: "GET",
      headers: { Accept: "application/json", "Content-Type": "application/json" }
    }, token);
    return response; // This will already be parsed
  } catch (err) {
    console.error('Error getting Braintree client token:', err);
    return { error: err.message };
  }
};

export const processPayment = async (userId, token, paymentData) => {
  try {
    const response = await fetchWithToken(`${API}/braintree/payment/${userId}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(paymentData)
    }, token);
    return await handleResponse(response);
  } catch (err) {
    console.error('Error processing payment:', err);
    return { error: err.message };
  }
};

export const createOrder = async (userId, token, createOrderData) => {
  try {
    const response = await fetchWithToken(`${API}/order/create/${userId}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ order: createOrderData })
    }, token);
    return await handleResponse(response);
  } catch (err) {
    console.error('Error creating order:', err);
    return { error: err.message };
  }
};

export const getProduct = async (productId) => {
  try {
    const response = await fetch(`${API}/product/${productId}`, {
      method: 'GET'
    });
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};
