
// This class manages tasks for the worker profile
class WorkerAPI {

    // Help function to check for server's answer
    static async handleResponse(response) {
        // Read type of response
        const contentType = response.headers.get("content-type");
        let data;

        // If returned content is JSON, read it
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Otherwise, read it as text and show an error
            const text = await response.text();
            throw new Error(`Server Error: ${response.status}`);
        }

        // If something went wrong, throw an error
        if (!response.ok) throw new Error(data.detail || "Worker operation failed");
        
        // Return cleaned data
        return data;
    }

    // Function to fetch worker details using their ID
    static async getProfile(workerId) {
        // Fetch details from specifically the worker's own endpoint
        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`);
        return await this.handleResponse(response);
    }

    // Function to update the profile for a worker
    static async updateProfile(workerId, data) {
        // Use PUT to update the details of an already existing worker profile
        const response = await fetch(`${API_BASE_URL}/workers/${workerId}`, {
            method: 'PUT', // PUT means update
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }

    // Function to get new incoming jobs for a specific worker
    static async getIncomingJobs(workerId) {
        // Fetch new job requests from worker-jobs endpoint
        const response = await fetch(`${API_BASE_URL}/workers/worker/${workerId}`);
        return await this.handleResponse(response);
    }
}

// Make WorkerAPI available globally
window.WorkerAPI = WorkerAPI;

