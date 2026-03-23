
// Class to handle customer profile details
class CustomerAPI {

    // Helper function to handle response from server
    static async handleResponse(response) {
        // Read type of content back
        const contentType = response.headers.get("content-type");
        let data;

        // If data is JSON, read it
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Otherwise, read as text and catch error
            const text = await response.text();
            throw new Error(`Server Error: ${response.status}`);
        }

        // Catch and throw error if not ok
        if (!response.ok) throw new Error(data.detail || "Customer operation failed");
        
        // Return successful data
        return data;
    }

    // Function to get profile details using customer ID
    static async getProfile(customerId) {
        // Fetch details from customer profile endpoint
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
        return await this.handleResponse(response);
    }

    // Function to update profile details for a customer
    static async updateProfile(customerId, data) {
        // Put the data sent back to customer endpoint
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: 'PUT', // Use PUT to update existing details
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) // Convert to JSON string
        });
        return await this.handleResponse(response);
    }
}

// Export class to be used globally
window.CustomerAPI = CustomerAPI;

