export const saveInStorage = (details) => {
    for (let key of Object.keys(details)){
        localStorage.setItem(key, details[key]);
    }
}

export const getInStorage = (key) => {
    return localStorage.getItem(key);
}

export const isAuthenticated = () => {
    return localStorage.getItem("staff_id") !== null;
}