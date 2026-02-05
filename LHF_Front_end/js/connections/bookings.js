class BookingsAPI {
    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server Error: ${response.status} - ${response.statusText}`);
        }
        if (!response.ok) throw new Error(data.detail || "Request failed");
        return data;
    }

    static async create(customerId, data) {
        const response = await fetch(`${API_BASE_URL}/bookings/?customer_id=${customerId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }

    static async getForCustomer(customerId) {
        const response = await fetch(`${API_BASE_URL}/bookings/customer/${customerId}`);
        return await this.handleResponse(response);
    }

    static async getForWorker(workerId) {
        const response = await fetch(`${API_BASE_URL}/bookings/worker/${workerId}`);
        return await this.handleResponse(response);
    }

    static async updateStatus(bookingId, status, workerId = null) {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, worker_id: workerId })
        });
        return await this.handleResponse(response);
    }
}

window.BookingsAPI = BookingsAPI;
