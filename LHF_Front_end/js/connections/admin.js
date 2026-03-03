// This file handles Admin operations (Handles Admin API calls)
// It includes Admin login, fetching workers list, and updating worker status.

class AdminAPI {

    // 1. Helper function to handle and check responses
    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        // Check if the response from the backend is JSON data
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Get error details from text if not JSON
            const text = await response.text();
            throw new Error(`Server Error: ${response.status}`);
        }

        // Throw an error if the response is not successful
        if (!response.ok) {
            const errorMsg = data.detail ? data.detail : "Request failed";
            throw new Error(errorMsg);
        }
        return data; // Return data if request is successful
    }

    // 2. Admin Login
    static async login(username, password) {
        // Send a POST request to the /admin/login URL
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await this.handleResponse(response);
    }

    // 3. Get all workers' details
    static async getAllWorkers() {
        const response = await fetch(`${API_BASE_URL}/admin/workers/all`);
        return await this.handleResponse(response);
    }

    // 4. Update worker status (e.g., verified or pending)
    static async updateWorkerStatus(workerId, status) {
        const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return await this.handleResponse(response);
    }
}

// Save to window object for global access
window.AdminAPI = AdminAPI;

