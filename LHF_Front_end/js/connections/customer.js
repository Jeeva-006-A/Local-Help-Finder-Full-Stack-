
class CustomerAPI {

    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server Error: ${response.status}`);
        }

        if (!response.ok) throw new Error(data.detail || "Customer operation failed");
        return data;
    }

    static async getProfile(customerId) {
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
        return await this.handleResponse(response);
    }

    static async updateProfile(customerId, data) {
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }
}

window.CustomerAPI = CustomerAPI;

