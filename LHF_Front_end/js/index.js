
// Wait for the website to finish loading before running this code
document.addEventListener('DOMContentLoaded', () => {

    // Look for the customer login form on the current page
    const customerLoginForm = document.getElementById('customerLoginForm');

    // Only run this code if the customer login form is actually on the page
    if (customerLoginForm) {
        // Run this function when the user clicks the "Submit" or "Login" button
        customerLoginForm.addEventListener('submit', async (event) => {
            // Stop the page from reloading (standard for forms in JS)
            event.preventDefault();

            // Get the email and password the user typed into the form
            const identifier = document.getElementById('customerEmail').value;
            const password = document.getElementById('customerPassword').value;

            try {
                try {
                    // Try to log in as a customer
                    const data = await AuthAPI.loginCustomer(identifier, password);

                    // Successfully logged in! Save user details in the browser's memory
                    localStorage.setItem('user_id', data.customer_id);
                    localStorage.setItem('user_type', 'customer');
                    localStorage.setItem('user_name', data.full_name);
                    localStorage.setItem('user_phone', data.phone);

                    alert("Customer Login Successful!");
                    // Go to the customer dashboard page
                    window.location.href = './LHF_Front_end/pages/customer_dashboard.html';
                } catch (customerError) {
                    // If customer login fails, check if the error is because of "Invalid credentials"
                    const isInvalid = customerError.message &&
                        (customerError.message.includes("401") || customerError.message.includes("Invalid"));

                    if (isInvalid) {
                        // If it might be an admin, try to log in as an admin instead
                        const adminResult = await AdminAPI.login(identifier, password);

                        // If admin login works, save admin details
                        localStorage.setItem('admin_user', adminResult.username);
                        localStorage.setItem('user_type', 'admin');

                        alert("Admin Login Successful!");
                        // Go to the admin dashboard
                        window.location.href = './LHF_Front_end/pages/admin_dashboard.html';
                    } else {
                        // If it's a different error, stop here and tell the user
                        throw customerError;
                    }
                }
            } catch (error) {
                // Show an error message if both customer and admin login fail
                console.error("Login Error:", error);
                alert("Login failed: " + error.message);
            }
        });
    }

    // Look for the worker login form on the page
    const workerLoginForm = document.getElementById('workerLoginForm');

    if (workerLoginForm) {
        // Run this when the worker submits their login form
        workerLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get the worker's email and password from the form inputs
            const email = document.getElementById('workerEmail').value;
            const password = document.getElementById('workerPassword').value;

            try {
                // Attempt to log in as a worker
                const data = await AuthAPI.loginWorker(email, password);

                // Save worker details in the browser's memory
                localStorage.setItem('user_id', data.worker_id);
                localStorage.setItem('user_type', 'worker');
                localStorage.setItem('user_name', data.full_name);
                localStorage.setItem('user_phone', data.phone);

                alert("Worker Login Successful!");
                // Go to the worker dashboard page
                window.location.href = './LHF_Front_end/pages/worker_dashboard.html';
            } catch (error) {
                // Show an error message if worker login fails
                console.error("Worker Login Error:", error);
                alert("Login failed: " + error.message);
            }
        });
    }

    // Code for the mobile menu (the burger menu on phones)
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('nav-overlay');

    if (menuToggle) {
        // Toggle (show/hide) the menu when the menu button is clicked
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            if (navOverlay) navOverlay.classList.toggle('active');
        });
    }

    if (navOverlay) {
        // Close the menu if you click anywhere outside of it
        navOverlay.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }
});


