import { API } from "../config";

// Function to read user data
export const read = async (userId, token) => {
    try {
        const response = await fetch(`${API}/user/${userId}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (err) {
        console.error(err);
    }
};

// Function to update user data
export const update = async (userId, token, user) => {
    try {
        const response = await fetch(`${API}/user/${userId}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(user)
        });
        return await response.json();
    } catch (err) {
        console.error(err);
    }
};

// Function to update user data in local storage
export const updateUser = (user, next) => {
    if (typeof window !== "undefined") {
        if (localStorage.getItem("jwt")) {
            let auth = JSON.parse(localStorage.getItem("jwt"));
            auth.user = user;
            localStorage.setItem("jwt", JSON.stringify(auth));
            next();
        }
    }
};

// Function to get user's purchase history
export const getPurchaseHistory = async (userId, token) => {
    try {
        const response = await fetch(`${API}/orders/by/user/${userId}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (err) {
        console.error(err);
    }
};
