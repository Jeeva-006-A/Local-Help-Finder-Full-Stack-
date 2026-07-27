

class WorkerAPI {


    static async getProfile(workerId) {

        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`, {
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


    static async updateProfile(workerId, data) {

        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`, {
            method: 'PUT',
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


    static async getIncomingJobs(workerId) {

        const response = await fetch(`${API_BASE_URL}/workers/worker/${workerId}`, {
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

    static async getStats(workerId) {
        const response = await fetch(`${API_BASE_URL}/workers/${workerId}/stats`, {
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

    static async updateAvailability(workerId, isOnline) {
        const response = await fetch(`${API_BASE_URL}/workers/${workerId}/availability`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ is_online: isOnline })
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

        return await response.json();
    }
}


window.WorkerAPI = WorkerAPI;

