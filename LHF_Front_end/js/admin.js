

class AdminAPI {


    static async login(username, password) {

        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        return data;
    }


    static async getAllWorkers() {

        const response = await fetch(`${API_BASE_URL}/admin/workers/all`);


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        return data;
    }


    static async updateWorkerStatus(workerId, status) {

        const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const result = await response.json();
        return result;
    }


    static async deleteWorker(workerId) {

        const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}`, {
            method: 'DELETE'
        });


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const result = await response.json();
        return result;
    }
}


window.AdminAPI = AdminAPI;

