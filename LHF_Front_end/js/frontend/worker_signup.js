// This code handles Worker registration
// It collects name, email, category, experience, and other details.

document.addEventListener('DOMContentLoaded', () => {

    // 1. Get the signup form from HTML
    const signupForm = document.getElementById('workerSignupForm');

    if (signupForm) {
        // This function runs when the 'Register' button is clicked
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Stop page reload

            // 2. Get input values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const category = document.getElementById('category').value;
            const experience = document.getElementById('experience').value;
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

            // D. Category Validation: Ensure a category is selected.
            if (!category) {
                alert("Please select a service category.");
                return;
            }

            // E. Experience Validation: Must be 0 or more.
            if (experience === "" || parseInt(experience) < 0) {
                alert("Experience should be 0 or more.");
                return;
            }

            // F. Address Validation: Ensure address is not empty.
            if (address.length < 5) {
                alert("Please provide a complete address.");
                return;
            }

            // G. Aadhar Photo Validation: Check if photo is uploaded.
            const aadharFile = document.getElementById('aadharPhoto').files[0];
            if (!aadharFile) {
                alert("Please upload your Aadhar Card photo.");
                return;
            }

            let aadharBase64 = null;
            if (aadharFile) {
                // Convert image to Base64 string
                aadharBase64 = await fileToBase64(aadharFile);
            }

            // H. Check if passwords match.
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            // 4. Bundle data into an object
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
                // Send registration request to backend
                await AuthAPI.registerWorker(data);
                alert("Registration Successful! Login and check your verification status.");
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

    // --- MOBILE MENU LOGIC ---
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

// Helper function: Convert image file to a Base64 string
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Read the file
        reader.onload = () => resolve(reader.result); // Resolve with the result
        reader.onerror = error => reject(error);
    });
}

