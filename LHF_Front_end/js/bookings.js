
// This class manages all booking related tasks
class BookingsAPI {

    // Helper function to check the response from the server
    static async handleResponse(response) {
        // Read the type of content the server responded with
        const contentType = response.headers.get("content-type");
        let data;

        // If the server sent JSON data, parse it
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Otherwise, it must be a server error, so read it as text
            const text = await response.text();
            throw new Error(`Server error: ${response.status}`);
        }

        // If the server's answer is not okay, throw an error with details
        if (!response.ok) throw new Error(data.detail || "Booking operation failed");
        
        // Return the clean data if everything went well
        return data;
    }

    // Function to create a new booking for a customer
    static async create(customerId, data) {
        // Post the new booking data to the server using the customer's ID
        const response = await fetch(`${API_BASE_URL}/bookings/?customer_id=${customerId}`, {
            method: 'POST', // Use POST to send new information
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) // Convert the data object into a JSON string
        });
        return await this.handleResponse(response);
    }

    // Function to get all the bookings for a specific customer
    static async getForCustomer(customerId) {
        // Look up all bookings using the customer ID
        const response = await fetch(`${API_BASE_URL}/bookings/customer/${customerId}`);
        return await this.handleResponse(response);
    }

    // Function to get all the bookings for a specific worker
    static async getForWorker(workerId) {
        // Fetch bookings using the worker ID
        const response = await fetch(`${API_BASE_URL}/bookings/worker/${workerId}`);
        return await this.handleResponse(response);
    }

    // Function to update the status of an existing booking (like marking it finished)
    static async updateStatus(bookingId, status, workerId = null) {
        // Put the updated status for a specific booking ID
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
            method: 'PUT', // Use PUT to update existing information
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status, worker_id: workerId })
        });
        return await this.handleResponse(response);
    }
}

// Export the BookingsAPI class so other parts of the app can use it
window.BookingsAPI = BookingsAPI;

