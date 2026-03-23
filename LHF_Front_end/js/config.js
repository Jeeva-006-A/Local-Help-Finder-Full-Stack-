
// This variable decides where the app should look for the server (API)
// It checks if you are running it on your own computer or online
const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000" // If on your computer, use this local address
    : window.location.origin + "/api"; // If on a website, use the website's own API link

// Make this variable available across all your JavaScript files
window.API_BASE_URL = API_BASE_URL;

