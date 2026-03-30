

class WorkerAPI {


    static async getProfile(workerId) {

        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`);


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        return data;
    }


    static async updateProfile(workerId, data) {

        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`, {
            method: 'PUT',
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


    static async getIncomingJobs(workerId) {

        const response = await fetch(`${API_BASE_URL}/workers/worker/${workerId}`);


        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        return data;
    }
}


window.WorkerAPI = WorkerAPI;

