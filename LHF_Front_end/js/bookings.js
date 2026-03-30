

class BookingsAPI {


    static async create(customerId, data) {

        const response = await fetch(`${API_BASE_URL}/bookings/?customer_id=${customerId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const result = await response.json();
        return result;
    }


    static async getForCustomer(customerId) {

        const response = await fetch(`${API_BASE_URL}/bookings/customer/${customerId}`);


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        return data;
    }


    static async getForWorker(workerId) {

        const response = await fetch(`${API_BASE_URL}/bookings/worker/${workerId}`);


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        return data;
    }


    static async updateStatus(bookingId, status, workerId = null) {

        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status, worker_id: workerId })
        });


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const result = await response.json();
        return result;
    }
}


window.BookingsAPI = BookingsAPI;

