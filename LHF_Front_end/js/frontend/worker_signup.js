// This code handles signing up a new Worker
document.addEventListener('DOMContentLoaded', () => {

    // Find the signup form on the page
    const signupForm = document.getElementById('workerSignupForm');

    if (signupForm) {
        // Runs when the worker clicks "Join as Partner"
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Stop the page from reloading

            // Get all the info typed by the worker
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const category = document.getElementById('category').value;
            const experience = document.getElementById('experience').value;
            const address = document.getElementById('address').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // --- CHECKS (Validation) ---

            // Check if name has only letters
            const nameRegex = /^[a-zA-Z\s]+$/;
            if (!nameRegex.test(name)) {
                alert("Name should only contain letters.");
                return;
            }

            // Check if email looks correct
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            // Check if phone number is 10 digits
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                alert("Phone number must be exactly 10 digits.");
                return;
            }

            // Check if service category is selected
            if (!category) {
                alert("Please select a service category.");
                return;
            }

            // Check if experience is typed correctly
            if (experience === "" || parseInt(experience) < 0) {
                alert("Experience should be 0 or more.");
                return;
            }

            // Check if address is not too short
            if (address.length < 5) {
                alert("Please provide a complete address.");
                return;
            }

            // --- PHOTO UPLOAD LOGIC ---
            // Get the ID card photo from the input
            const aadharFile = document.getElementById('aadharPhoto').files[0];
            if (!aadharFile) {
                alert("Please upload your Aadhar Card photo.");
                return;
            }

            // Convert photo to a long text string (Base64) to send it to server
            let aadharBase64 = null;
            if (aadharFile) {
                aadharBase64 = await fileToBase64(aadharFile);
            }

            // Check if passwords match
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            // Group all worker info together
            const data = {
                full_name: name,
                email: email,
                phone: phone,
                category: category,
                experience: parseInt(experience),
                address: address,
                password: password,
                aadhar_photo: aadharBase64
            };

            try {
                // Send the info to the backend to create the account
                await AuthAPI.registerWorker(data);
                alert("Registration Successful! Login and check your verification status.");

                // Redirect to login page
                window.location.href = "worker_login.html";

            } catch (error) {
                console.error("Signup Error:", error);
                if (error.message === "Failed to fetch") {
                    alert("Backend server is offline! Please start main.py.");
                } else {
                    alert("Registration Failed: " + error.message);
                }
            }
        });
    }

    // Handles mobile menu buttons
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

// Helper function to turn a file into computer text (Base64)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


