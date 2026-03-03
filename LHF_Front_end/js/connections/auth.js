// This file handles API calls to the backend server
// It contains registration and login logic for customers and workers.

class AuthAPI {

    // 1. Helper function to handle and check API responses
    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        // Check if the response from the backend is JSON data
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Get error details from text if not JSON
            const text = await response.text();
            console.error("Server error details:", text);
            throw new Error(`Server Error: ${response.status}`);
        }

        // Throw an error if the response is not successful (status is not OK)
        if (!response.ok) {
            const errorMsg = data.detail ? data.detail : "Request failed";
            throw new Error(errorMsg);
        }
        return data; // Return data if request is successful
    }

    // 2. Customer Login function
    static async loginCustomer(email, password) {
        // Send a request to the backend /customers/login URL
        const response = await fetch(`${API_BASE_URL}/customers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await this.handleResponse(response);
    }

    // 3. Customer Register function
    static async registerCustomer(data) {
        const response = await fetch(`${API_BASE_URL}/customers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }

    // 4. Worker Login function
    static async loginWorker(email, password) {
        const response = await fetch(`${API_BASE_URL}/workers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await this.handleResponse(response);
    }

    // 5. Worker Register function
    static async registerWorker(data) {
        const response = await fetch(`${API_BASE_URL}/workers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }
}

// Expose the class globally via the window object
window.AuthAPI = AuthAPI;

