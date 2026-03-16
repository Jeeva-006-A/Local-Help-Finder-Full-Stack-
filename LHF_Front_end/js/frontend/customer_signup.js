// This code handles signing up a new Customer
document.addEventListener('DOMContentLoaded', () => {

    // Find the signup form on the page
    const signupForm = document.getElementById('customerSignupForm');

    if (signupForm) {
        // Runs when the user clicks the "Register" button
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Stop the page from reloading

            // Get what the user typed in the boxes
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Check if the name only has letters
            const nameRegex = /^[a-zA-Z\s]+$/;
            if (!nameRegex.test(name)) {
                alert("Name should only contain letters.");
                return;
            }

            // Check if the email looks correct
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            // Check if the phone number is 10 digits
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                alert("Phone number must be exactly 10 digits.");
                return;
            }

            // Check if the address is not too short
            if (address.length < 5) {
                alert("Please provide a complete address.");
                return;
            }

            // Check if the passwords match
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            // Group all the info together
            const data = {
                full_name: name,
                email: email,
                phone: phone,
                address: address,
                password: password
            };

            try {
                // Send the info to the backend to create the account
                await AuthAPI.registerCustomer(data);
                alert("Registration Successful! You can now login.");

                // Take the user to the login page
                window.location.href = "customer_login.html";

            } catch (error) {
                console.error("Signup Error:", error);
                if (error.message === "Failed to fetch") {
                    alert("Server is offline! Please start main.py.");
                } else {
                    alert("Registration Failed: " + error.message);
                }
            }
        });
    }

    // This part handles the menu button on mobile phones
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


