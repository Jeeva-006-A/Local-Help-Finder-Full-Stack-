// This file handles Worker profile and job-related API calls.

class WorkerAPI {

    // 1. Helper function to check the backend response
    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        // Check if data is in JSON format
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server Error: ${response.status}`);
        }

        // Show backend error response if request fails
        if (!response.ok) throw new Error(data.detail || "Worker operation failed");
        return data;
    }

    // 2. Fetch Worker profile details (Get profile)
    static async getProfile(workerId) {
        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`);
        return await this.handleResponse(response);
    }

    // 3. Update Worker profile (Update profile)
    static async updateProfile(workerId, data) {
        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) // Convert object to JSON string
        });
        return await this.handleResponse(response);
    }

    // 4. Fetch new jobs (Incoming Jobs)
    static async getIncomingJobs(workerId) {
        // Send request to the backend /workers/worker/{id} URL
        const response = await fetch(`${API_BASE_URL}/workers/worker/${workerId}`);
        return await this.handleResponse(response);
    }
}

// Save to the global window scope
window.WorkerAPI = WorkerAPI;

