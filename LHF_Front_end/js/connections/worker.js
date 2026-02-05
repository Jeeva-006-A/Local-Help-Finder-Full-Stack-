class WorkerAPI {
    static async getProfile(workerId) {
        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`);
        if (!response.ok) throw new Error("Failed to load profile");
        return await response.json();
    }

    static async updateProfile(workerId, data) {
        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to update profile");
        return await response.json();
    }

    static async getIncomingJobs(workerId) {
        const response = await fetch(`${API_BASE_URL}/workers/worker/${workerId}`);
        if (!response.ok) throw new Error("Failed to load incoming jobs");
        return await response.json();
    }
}

window.WorkerAPI = WorkerAPI;
