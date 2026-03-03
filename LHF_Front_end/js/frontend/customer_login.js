// This code handles Customer login logic.
// It includes steps for customer login and admin login.

document.addEventListener('DOMContentLoaded', () => {

    // 1. Get the login form from HTML
    const loginForm = document.getElementById('loginForm');

    // Run the logic only if the form exists
    if (loginForm) {

        // This function runs when the user clicks 'Login'
        loginForm.addEventListener('submit', async (event) => {

            // Prevent page refresh
            event.preventDefault();

            // 2. Get user input data
            const identifier = document.getElementById('identifier').value.trim();
            const password = document.getElementById('password').value;

            // --- VALIDATION LOGIC ---
            // Check if input fields are empty
            if (!identifier || !password) {
                alert("Email and Password are required!");
                return;
            }

            // Email format check (optional but good for UX)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(identifier)) {
                // Note: Customer might use username too, but current system usually uses email.
                // Keeping it flexible or strict based on your preference.
            }

            console.log("Login started for:", identifier);

            try {
                // STEP A: Try to login as a Customer
                try {
                    const result = await AuthAPI.loginCustomer(identifier, password);

                    // Save customer data in LocalStorage if login is successful
                    localStorage.setItem('user_id', result.customer_id);
                    localStorage.setItem('user_name', result.name);
                    localStorage.setItem('user_type', 'customer');

                    alert("Customer Login Successful!");

                    // Redirect to customer dashboard
                    window.location.href = "customer_dashboard.html";
                    return;

                } catch (customerError) {
                    // STEP B: If not a customer, check if it is an Admin

                    // Try Admin login if customer login fails with an unauthorized error
                    const isInvalidUser = customerError.message &&
                        (customerError.message.includes("401") || customerError.message.includes("Invalid"));

                    if (isInvalidUser) {
                        console.log("Customer login failed, checking for Admin...");
                        const adminResult = await AdminAPI.login(identifier, password);

                        // Save admin details
                        localStorage.setItem('admin_user', adminResult.username);
                        localStorage.setItem('user_type', 'admin');

                        alert("Admin Login Successful!");
                        window.location.href = "admin_dashboard.html";
                        return;
                    } else {
                        // Skip if it is a different error
                        throw customerError;
                    }
                }
            } catch (error) {
                // STEP C: Notify user about errors
                console.error("Login Error details:", error);

                if (error.message === "Failed to fetch") {
                    alert("Backend server is offline! Please start main.py.");
                } else {
                    alert("Login failed: " + error.message);
                }
            }
        });
    }

    // --- SIDEBAR MENU LOGIC (Hamburger Menu for Mobile) ---
    // Handles mobile menu buttons
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('nav-overlay');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            // Toggle 'active' class to open/close menu
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            if (navOverlay) navOverlay.classList.toggle('active');
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            // Close menu when overlay is clicked
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }
});


