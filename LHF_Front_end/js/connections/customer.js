class CustomerAPI {
    static async getProfile(customerId) {
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
        if (!response.ok) throw new Error("Failed to load profile");
        return await response.json();
    }

    static async updateProfile(customerId, data) {
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to update profile");
        return await response.json();
    }
}

window.CustomerAPI = CustomerAPI;
