class ContactAPI {
    static async sendMessage(data) {
        const response = await fetch(`${API_BASE_URL}/contact/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to send message");
        }
        return await response.json();
    }
}

window.ContactAPI = ContactAPI;
