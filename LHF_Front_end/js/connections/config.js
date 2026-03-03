// This file handles the backend server configuration.
// It automatically detects where the backend is running.

// 1. Detect environment: Are we running locally (localhost) or online (deployed)?
const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"           // Local server address
    : window.location.origin + "/api";  // Production server address

// 2. Set as a global variable so other JS files can use it.
window.API_BASE_URL = API_BASE_URL;

