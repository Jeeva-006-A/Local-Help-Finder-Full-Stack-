// Detect if we are running locally or on a deployed server
const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : window.location.origin + "/api";

window.API_BASE_URL = API_BASE_URL;
