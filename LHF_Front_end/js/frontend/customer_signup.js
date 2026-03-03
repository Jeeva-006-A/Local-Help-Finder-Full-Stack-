// This code handles Customer registration
// It collects name, email, phone, and address from the form.

document.addEventListener('DOMContentLoaded', () => {

    // 1. Get the signup form from HTML
    const signupForm = document.getElementById('customerSignupForm');

    if (signupForm) {
        // This function runs when the 'Register' button is clicked
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Stop page reload

            // 2. Get input values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // --- VALIDATION LOGIC ---

            // A. Name Validation: Only letters (a-z, A-Z) and spaces allowed.
            // Numbers or special characters are not allowed.
            const nameRegex = /^[a-zA-Z\s]+$/;
            if (!nameRegex.test(name)) {
                alert("Name should only contain letters.");
                return;
            }

            // B. Email Validation: Check for a valid email format.
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            // C. Phone Validation: Check if it is exactly 10 digits.
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                alert("Phone number must be exactly 10 digits.");
                return;
            }

            // D. Address Validation: Ensure address is provided.
            if (address.length < 5) {
                alert("Please provide a complete address.");
                return;
            }

            // E. Check if passwords match.
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            // 3. Bundle data into an object
            const data = {
                full_name: name,
                email: email,
                phone: phone,
                address: address,
                password: password
            };

            try {
                // Send registration request to backend (Call AuthAPI)
                await AuthAPI.registerCustomer(data);
                alert("Registration Successful! You can now login.");

                // Redirect to login page
                window.location.href = "customer_login.html";

            } catch (error) {
                console.error("Signup Error details:", error);

                // Show alert if the server is offline
                if (error.message === "Failed to fetch") {
                    alert("Backend server is offline! Please start main.py.");
                } else {
                    alert("Registration Failed: " + error.message);
                }
            }
        });
    }

    // --- MOBILE MENU LOGIC ---
    // Controls the mobile menu buttons
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

