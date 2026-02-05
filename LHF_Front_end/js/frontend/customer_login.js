document.addEventListener('DOMContentLoaded', () => {
    // Login Logic
    const loginForm = document.getElementById('customerLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const result = await AuthAPI.loginCustomer(email, password);

                localStorage.setItem('user_id', result.customer_id);
                localStorage.setItem('user_name', result.name);
                localStorage.setItem('user_type', 'customer');

                alert("Login Successful!");
                window.location.href = "../pages/customer_dashboard.html";
            } catch (error) {
                console.error("Error:", error);
                if (error.message === "Failed to fetch") {
                    alert("Unable to connect to the server. Please ensure the backend is running.");
                } else {
                    alert("Login Failed: " + error.message);
                }
            }
        });
    }
});
