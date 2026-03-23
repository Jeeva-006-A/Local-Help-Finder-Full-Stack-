
// This class handles login and registration for the app
class AuthAPI {

    // This function checks if the server's response is successful
    static async handleResponse(response) {
        // Check what kind of data the server sent back
        const contentType = response.headers.get("content-type");
        let data;

        // If the server sent JSON data, read it
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // If the server sent something else, read it as text and show an error
            const text = await response.text();
            console.error("Server error details:", text);
            throw new Error(`Server Error: ${response.status}`);
        }

        // If the response is not okay (like a 404 or 500 error), throw an error
        if (!response.ok) {
            const errorMsg = data.detail ? data.detail : "Request failed";
            throw new Error(errorMsg);
        }
        
        // If everything is okay, return the data
        return data;
    }

    // Function to log in a customer
    static async loginCustomer(email, password) {
        // Send the email and password to the server
        const response = await fetch(`${API_BASE_URL}/customers/login`, {
            method: 'POST', // Use POST method to send data
            headers: { 'Content-Type': 'application/json' }, // Tell the server we are sending JSON
            body: JSON.stringify({ email: email, password: password }) // Convert the data to a JSON string
        });
        // Handle the response using the helper function above
        return await this.handleResponse(response);
    }

    // Function to register a new customer
    static async registerCustomer(data) {
        // Send the registration data to the server
        const response = await fetch(`${API_BASE_URL}/customers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) // Convert data object to JSON string
        });
        return await this.handleResponse(response);
    }

    // Function to log in a worker
    static async loginWorker(email, password) {
        // Send worker login details to the server
        const response = await fetch(`${API_BASE_URL}/workers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        return await this.handleResponse(response);
    }

    // Function to register a new worker
    static async registerWorker(data) {
        // Send worker registration details to the server
        const response = await fetch(`${API_BASE_URL}/workers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }
}

// Make the AuthAPI class available globally so other files can use it
window.AuthAPI = AuthAPI;

