
class AdminAPI {

    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server Error: ${response.status}`);
        }

        if (!response.ok) {
            const errorMsg = data.detail ? data.detail : "Request failed";
            throw new Error(errorMsg);
        }
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

    static async getAllWorkers() {
        const response = await fetch(`${API_BASE_URL}/admin/workers/all`);
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

