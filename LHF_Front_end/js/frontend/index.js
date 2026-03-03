// This core JS file handles the login forms on the Home page.
// It includes step-by-step comments for beginners to understand easily.

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CUSTOMER LOGIN SECTION ---
    const customerLoginForm = document.getElementById('customerLoginForm');

    if (customerLoginForm) {
        // This function runs when the customer login form is submitted
        customerLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent page reload

            // Get values from input fields
            const identifier = document.getElementById('customerEmail').value;
            const password = document.getElementById('customerPassword').value;

            try {
                // A: Try to login as a Customer
                try {
                    const data = await AuthAPI.loginCustomer(identifier, password);

                    // Save customer data in browser memory (localStorage) if login is successful
                    localStorage.setItem('user_id', data.customer_id);
                    localStorage.setItem('user_type', 'customer');
                    localStorage.setItem('user_name', data.full_name);
                    localStorage.setItem('user_phone', data.phone);

                    alert("Customer Login Successful!");
                    // Redirect to the Dashboard page
                    window.location.href = './LHF_Front_end/pages/customer_dashboard.html';
                } catch (customerError) {
                    // B: If not a customer, check if it's an Admin
                    const isInvalid = customerError.message &&
                        (customerError.message.includes("401") || customerError.message.includes("Invalid"));

                    if (isInvalid) {
                        const adminResult = await AdminAPI.login(identifier, password);

                        // Admin details save panu
                        localStorage.setItem('admin_user', adminResult.username);
                        localStorage.setItem('user_type', 'admin');

                        alert("Admin Login Successful!");
                        window.location.href = './LHF_Front_end/pages/admin_dashboard.html';
                    } else {
                        throw customerError; // Throw error if it's something else
                    }
                }
            } catch (error) {
                console.error("Login Error:", error);
                alert("Login failed: " + error.message);
            }
        });
    }

    // --- 2. WORKER LOGIN SECTION ---
    const workerLoginForm = document.getElementById('workerLoginForm');

    if (workerLoginForm) {
        // Worker login logic
        workerLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('workerEmail').value;
            const password = document.getElementById('workerPassword').value;

            try {
                const data = await AuthAPI.loginWorker(email, password);

                // Save worker data to localStorage
                localStorage.setItem('user_id', data.worker_id);
                localStorage.setItem('user_type', 'worker');
                localStorage.setItem('user_name', data.full_name);
                localStorage.setItem('user_phone', data.phone);

                alert("Worker Login Successful!");
                window.location.href = './LHF_Front_end/pages/worker_dashboard.html';
            } catch (error) {
                console.error("Worker Login Error:", error);
                alert("Login failed: " + error.message);
            }
        });
    }

    // --- 3. MOBILE MENU (Hamburger) ---
    // Controls the mobile menu buttons
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('nav-overlay');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            // Toggle the menu on and off
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            if (navOverlay) navOverlay.classList.toggle('active');
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            // Close the menu if clicked outside
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }
});


