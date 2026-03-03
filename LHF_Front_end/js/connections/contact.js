// This file handles sending contact messages to the backend server.

class ContactAPI {

    // 1. Helper function to check the backend response
    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        // Check if data is in JSON format
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server connection error: ${response.status}`);
        }

        // Get error details if request is not successful
        if (!response.ok) throw new Error(data.detail || "Failed to send message");
        return data;
    }

    // 2. Send the message to the backend /contact/ URL
    static async sendMessage(data) {
        // Use Fetch to send a POST request
        const response = await fetch(`${API_BASE_URL}/contact/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) // Convert JavaScript object to JSON string
        });
        return await this.handleResponse(response);
    }
}

// Set as a global variable in the window object
window.ContactAPI = ContactAPI;

