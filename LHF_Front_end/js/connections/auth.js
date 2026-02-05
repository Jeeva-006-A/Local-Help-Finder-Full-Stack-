class AuthAPI {
    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error("Non-JSON response received:", text);
            throw new Error(`Server Error: ${response.status} - ${response.statusText}`);
        }

        if (!response.ok) {
            throw new Error(data.detail || "Request failed");
        }
        return data;
    }

    static async loginCustomer(email, password) {
        const response = await fetch(`${API_BASE_URL}/customers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await this.handleResponse(response);
    }

    static async registerCustomer(data) {
        const response = await fetch(`${API_BASE_URL}/customers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }

    static async loginWorker(email, password) {
        const response = await fetch(`${API_BASE_URL}/workers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await this.handleResponse(response);
    }

    static async registerWorker(data) {
        const response = await fetch(`${API_BASE_URL}/workers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }
}

window.AuthAPI = AuthAPI;
