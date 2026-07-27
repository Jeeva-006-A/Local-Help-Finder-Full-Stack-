

class CustomerAPI {


    static async getProfile(customerId) {

        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
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


    static async updateProfile(customerId, data) {

        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
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
}


window.CustomerAPI = CustomerAPI;

