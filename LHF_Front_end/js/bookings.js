

class BookingsAPI {


    static async create(customerId, data) {

        const response = await fetch(`${API_BASE_URL}/bookings/?customer_id=${customerId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });


        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                window.location.href = '../../index.html';
                throw new Error("Unauthorized - Please log in again");
            }
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const result = await response.json();
        return result;
    }


    static async getForCustomer(customerId) {

        const response = await fetch(`${API_BASE_URL}/bookings/customer/${customerId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });


        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                window.location.href = '../../index.html';
                throw new Error("Unauthorized - Please log in again");
            }
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        return data;
    }


    static async getForWorker(workerId) {

        const response = await fetch(`${API_BASE_URL}/bookings/worker/${workerId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });


        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                window.location.href = '../../index.html';
                throw new Error("Unauthorized - Please log in again");
            }
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        return data;
    }


    static async updateStatus(bookingId, status, workerId = null, details = {}) {

        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: status, worker_id: workerId, ...details })
        });


        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                window.location.href = '../../index.html';
                throw new Error("Unauthorized - Please log in again");
            }
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const result = await response.json();
        return result;
    }

    static async cancelBooking(bookingId, cancellationReason) {

        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ cancellation_reason: cancellationReason })
        });


        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                window.location.href = '../../index.html';
                throw new Error("Unauthorized - Please log in again");
            }
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const result = await response.json();
        return result;
    }
}


window.BookingsAPI = BookingsAPI;

