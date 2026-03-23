
// Class to handle admin related tasks
class AdminAPI {

    // Helper function to handle the server's answer
    static async handleResponse(response) {
        // Read the type of data sent back
        const contentType = response.headers.get("content-type");
        let data;

        // If the data is JSON, read it
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // If not JSON, it must be an error, so read it as text
            const text = await response.text();
            throw new Error(`Server Error: ${response.status}`);
        }

        // If something went wrong, throw an error with the details
        if (!response.ok) {
            const errorMsg = data.detail ? data.detail : "Request failed";
            throw new Error(errorMsg);
        }
        
        // Return the clean data
        return data;
    }

    // Function for admin login
    static async login(username, password) {
        // Send admin username and password to the server
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST', // POST means we are sending data
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });
        return await this.handleResponse(response);
    }

    // Function to get all workers from the database
    static async getAllWorkers() {
        // Fetch all workers using the admin URL
        const response = await fetch(`${API_BASE_URL}/admin/workers/all`);
        return await this.handleResponse(response);
    }

    // Function to change a worker's status (verify or reject)
    static async updateWorkerStatus(workerId, status) {
        // Update the status using the worker ID
        const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}/status`, {
            method: 'PUT', // PUT means we are updating data
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });
        return await this.handleResponse(response);
    }

    // Function to delete a worker from the database
    static async deleteWorker(workerId) {
        // Send a DELETE request to remove the worker
        const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}`, {
            method: 'DELETE' // DELETE means we are removing data
        });
        return await this.handleResponse(response);
    }
}

// Export AdminAPI so it can be used everywhere
window.AdminAPI = AdminAPI;

