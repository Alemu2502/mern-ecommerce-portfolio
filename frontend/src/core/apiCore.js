import { API } from "../config";
import queryString from "query-string";

// Function to handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Error: ${errorData}`);
    throw new Error('Network response was not ok');
  }
  return response.json();
};

// Function to make authenticated API requests
const fetchWithToken = async (url, options, token) => {
  if (!token) {
    throw new Error('No token available');
  }
  const authHeader = { Authorization: `Bearer ${token}` };
  options.headers = { ...options.headers, ...authHeader };
  return await fetch(url, options);
};

// Function to add a review
export const addReview = async (productId, review, token) => {
  try {
    const response = await fetchWithToken(`${API}/review/${productId}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    }, token);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error adding review:', error);
  }
};

// Function to get product reviews
export const getProductReviews = async (productId) => {
  try {
    const response = await fetch(`${API}/reviews/${productId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting product reviews:', error);
  }
};

// Function to get products
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

// Function to get categories
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

// Function to get filtered products
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

// Function to list products
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

// Function to read product details
export const read = async (productId) => {
  try {
    const response = await fetch(`${API}/product/${productId}`, {
      method: "GET"
    });
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};

// Function to list related products
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

// Function to get Braintree client token
export const getBraintreeClientToken = async (userId, token) => {
  try {
    const response = await fetchWithToken(`${API}/braintree/getToken/${userId}`, {
      method: "GET",
      headers: { Accept: "application/json", "Content-Type": "application/json" }
    }, token);
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};

// Function to process payment
export const processPayment = async (userId, token, paymentData) => {
  try {
    const response = await fetchWithToken(`${API}/braintree/payment/${userId}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(paymentData)
    }, token);
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};

// Function to create an order
export const createOrder = async (userId, token, createOrderData) => {
  try {
    const response = await fetchWithToken(`${API}/order/create/${userId}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ order: createOrderData })
    }, token);
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};

// Function to get product details including reviews
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

// Function to get reviews
export const getReviews = async (productId) => {
  try {
    const response = await fetch(`${API}/reviews/${productId}`, {
      method: 'GET'
    });
    return await handleResponse(response);
  } catch (err) {
    console.error(err);
  }
};
