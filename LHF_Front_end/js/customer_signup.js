
document.addEventListener('DOMContentLoaded', () => {


    const signupForm = document.getElementById('customerSignupForm');

    if (signupForm) {

        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();


            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;


            const nameRegex = /^[a-zA-Z\s]+$/;
            if (!nameRegex.test(name)) {
                alert("Name should only contain letters.");
                return;
            }


            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }


            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                alert("Phone number must be exactly 10 digits.");
                return;
            }


            if (address.length < 5) {
                alert("Please provide a complete address.");
                return;
            }


            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }


            const data = {
                full_name: name,
                email: email,
                phone: phone,
                address: address,
                password: password
            };

            try {

                await AuthAPI.registerCustomer(data);
                alert("Registration Successful! You can now login.");


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


