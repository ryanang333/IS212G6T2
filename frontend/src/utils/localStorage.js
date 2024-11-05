/**
 * Save details in local storage.
 * Iterates over an object and saves each key-value pair in local storage.
 *
 * @param {Object} details - An object containing key-value pairs to be saved in local storage.
 */
export const saveInStorage = (details) => {
    for (let key of Object.keys(details)){
        localStorage.setItem(key, details[key]);
    }
}

/**
 * Retrieve a value from local storage by key.
 *
 * @param {string} key - The key whose value is to be retrieved from local storage.
 * @returns {string|null} - The value associated with the key, or null if the key doesn't exist.
 */
export const getInStorage = (key) => {
    return localStorage.getItem(key);
}

/**
 * Check if the user is authenticated.
 * The user is considered authenticated if a 'staff_id' is present in local storage.
 *
 * @returns {boolean} - Returns true if 'staff_id' exists in local storage, otherwise false.
 */
export const isAuthenticated = () => {
    return localStorage.getItem("staff_id") !== null;
};
export const getUserRole = () => {
    const role = localStorage.getItem('role');
    return role ? parseInt(role, 10) : null;
}