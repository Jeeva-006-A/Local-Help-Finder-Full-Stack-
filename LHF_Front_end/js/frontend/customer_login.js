document.addEventListener('DOMContentLoaded', () => {
    // Login Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const identifier = document.getElementById('identifier').value;
            const password = document.getElementById('password').value;

            try {
                // 1. Try Customer Login First
                try {
                    const result = await AuthAPI.loginCustomer(identifier, password);
                    localStorage.setItem('user_id', result.customer_id);
                    localStorage.setItem('user_name', result.name);
                    localStorage.setItem('user_type', 'customer');

                    alert("Customer Login Successful!");
                    window.location.href = "customer_dashboard.html";
                    return;
                } catch (customerError) {
                    // 2. If customer login failed with 401, try Admin Login
                    if (customerError.message && (customerError.message.includes("401") || customerError.message.includes("Invalid"))) {
                        try {
                            const adminResult = await AdminAPI.login(identifier, password);
                            localStorage.setItem('admin_user', adminResult.username);
                            localStorage.setItem('user_type', 'admin');

                            alert("Admin Login Successful!");
                            window.location.href = "admin_dashboard.html";
                            return;
                        } catch (adminError) {
                            throw new Error("Invalid credentials for both Customer and Admin.");
                        }
                    } else {
                        throw customerError;
                    }
                }
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

    // Hamburger Menu Logic
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('nav-overlay');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            if (navOverlay) navOverlay.classList.toggle('active');
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }
});
