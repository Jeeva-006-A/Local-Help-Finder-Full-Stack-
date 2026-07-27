

class AdminAPI {


    static async login(username, password) {

        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
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


    static async getAllWorkers() {

        const response = await fetch(`${API_BASE_URL}/admin/workers/all`, {
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


    static async updateWorkerStatus(workerId, status) {

        const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: status })
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


    static async deleteWorker(workerId) {

        const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}`, {
            method: 'DELETE',
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


        const result = await response.json();
        return result;
    }
}


window.AdminAPI = AdminAPI;

