class AuthAPI {
    static async loginCustomer(email, password) {
        const response = await fetch(`${API_BASE_URL}/customers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Login failed");
        }
        return await response.json();
    }

    static async registerCustomer(data) {
        const response = await fetch(`${API_BASE_URL}/customers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Registration failed");
        }
        return await response.json();
    }

    static async loginWorker(email, password) {
        const response = await fetch(`${API_BASE_URL}/workers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Login failed");
        }
        return await response.json();
    }

    static async registerWorker(data) {
        const response = await fetch(`${API_BASE_URL}/workers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Registration failed");
        }
        return await response.json();
    }
}

window.AuthAPI = AuthAPI;
