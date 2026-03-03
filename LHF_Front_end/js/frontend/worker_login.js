// This code handles Worker login (Electrician/Plumber).

document.addEventListener('DOMContentLoaded', () => {

    // 1. Get the login form from HTML
    const loginForm = document.getElementById('workerLoginForm');

    if (loginForm) {
        // This function runs when the form is submitted
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Stop page reload

            // Get email and password values from input fields
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // --- VALIDATION LOGIC ---
            // A. Email Validation: Check for a valid email format.
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            // B. Password Validation: Check if the password field is empty
            if (!password) {
                alert("Password is required.");
                return;
            }

            try {
                // Try to login as a worker using AuthAPI
                const result = await AuthAPI.loginWorker(email, password);

                // Save worker details in local storage if login is successful
                localStorage.setItem('user_id', result.worker_id);
                localStorage.setItem('user_name', result.name);
                localStorage.setItem('user_type', 'worker');
                localStorage.setItem('worker_category', result.category);
                localStorage.setItem('worker_status', result.status);

                alert("Worker Login Successful!");
                // Redirect to worker dashboard
                window.location.href = "worker_dashboard.html";

            } catch (error) {
                console.error("Login Error:", error);

                // Show alert if the server is offline
                if (error.message === "Failed to fetch") {
                    alert("Backend server is offline! Please start main.py.");
                } else {
                    alert("Login failed: " + error.message);
                }
            }
        });
    }

    // --- MOBILE MENU LOGIC ---
    // Controls the mobile menu toggle
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

