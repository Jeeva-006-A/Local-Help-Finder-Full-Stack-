// This file handles fetching and updating Customer profile data via API.

class CustomerAPI {

    // 1. Helper function to check the backend response
    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        // Check if data is in JSON format
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server Error: ${response.status}`);
        }

        // Get error details if request is not successful
        if (!response.ok) throw new Error(data.detail || "Customer operation failed");
        return data;
    }

    // 2. Fetch the Customer profile data (Get profile)
    static async getProfile(customerId) {
        // Send a GET request to the API address
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
        return await this.handleResponse(response);
    }

    // 3. Update Customer profile details (Update profile)
    static async updateProfile(customerId, data) {
        // Send updated data using the PUT method
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }
}

// Save to the window object for global access
window.CustomerAPI = CustomerAPI;

