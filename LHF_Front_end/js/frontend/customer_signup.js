document.addEventListener('DOMContentLoaded', () => {
    // Signup Logic
    const signupForm = document.getElementById('customerSignupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            const data = {
                full_name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                password: password
            };

            try {
                await AuthAPI.registerCustomer(data);
                alert("Registration Successful! Please login.");
                window.location.href = "../pages/customer_login.html";
            } catch (error) {
                console.error("Error:", error);
                if (error.message === "Failed to fetch") {
                    alert("Unable to connect to the server. Please ensure the backend is running.");
                } else {
                    alert("Registration Failed: " + error.message);
                }
            }
        });
    }
});
