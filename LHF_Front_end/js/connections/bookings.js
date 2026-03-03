// This file handles service booking logic (Handles Bookings API calls)
// It includes logic for creating bookings and updating booking status.

class BookingsAPI {

    // 1. Helper function to check backend responses
    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        // Check if data is in JSON format
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server error: ${response.status}`);
        }

        // Show detailed error message if request fails
        if (!response.ok) throw new Error(data.detail || "Booking operation failed");
        return data;
    }

    // 2. Create a new booking
    static async create(customerId, data) {
        // Use fetch to send booking data to the backend /bookings/ URL
        const response = await fetch(`${API_BASE_URL}/bookings/?customer_id=${customerId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }

    // 3. Get all bookings for a specific customer
    static async getForCustomer(customerId) {
        const response = await fetch(`${API_BASE_URL}/bookings/customer/${customerId}`);
        return await this.handleResponse(response);
    }

    // 4. Get bookings for a specific worker
    static async getForWorker(workerId) {
        const response = await fetch(`${API_BASE_URL}/bookings/worker/${workerId}`);
        return await this.handleResponse(response);
    }

    // 5. Update booking status (e.g., Pending -> Accepted -> Completed)
    static async updateStatus(bookingId, status, workerId = null) {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, worker_id: workerId })
        });
        return await this.handleResponse(response);
    }
}

// Set globally to use anywhere in the browser
window.BookingsAPI = BookingsAPI;

