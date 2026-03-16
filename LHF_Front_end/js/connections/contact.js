
class ContactAPI {

    static async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server connection error: ${response.status}`);
        }

        if (!response.ok) throw new Error(data.detail || "Failed to send message");
        return data;
    }

    static async sendMessage(data) {
        const response = await fetch(`${API_BASE_URL}/contact/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }
}

window.ContactAPI = ContactAPI;

