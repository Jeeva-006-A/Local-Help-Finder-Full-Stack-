class AdminAPI {
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

    static async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await this.handleResponse(response);
    }

    static async getPendingWorkers() {
        const response = await fetch(`${API_BASE_URL}/admin/workers/pending`);
        return await this.handleResponse(response);
    }

    static async updateWorkerStatus(workerId, status) {
        const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return await this.handleResponse(response);
    }
}

window.AdminAPI = AdminAPI;
