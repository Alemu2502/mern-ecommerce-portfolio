// src/utils/debounce.js
export const debounce = (func, delay) => {
    let debounceTimer;
    return (...args) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(...args), delay);
    };
};
