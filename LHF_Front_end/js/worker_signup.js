
document.addEventListener('DOMContentLoaded', () => {


    const signupForm = document.getElementById('workerSignupForm');

    if (signupForm) {

        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();


            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const category = document.getElementById('category').value;
            const experience = document.getElementById('experience').value;
            const address = document.getElementById('address').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;




            const nameRegex = /^[a-zA-Z\s]+$/;
            if (!nameRegex.test(name)) {
                Alerts.warning("Name should only contain letters.");
                return;
            }


            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                Alerts.warning("Please enter a valid email address.");
                return;
            }


            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                Alerts.warning("Phone number must be exactly 10 digits.");
                return;
            }


            if (!category) {
                Alerts.warning("Please select a service category.");
                return;
            }


            if (experience === "" || parseInt(experience) < 0) {
                Alerts.warning("Experience should be 0 or more.");
                return;
            }


            if (address.length < 5) {
                Alerts.warning("Please provide a complete address.");
                return;
            }



            const aadharFile = document.getElementById('aadharPhoto').files[0];
            if (!aadharFile) {
                Alerts.warning("Please upload your Aadhar Card photo.");
                return;
            }


            let aadharBase64 = null;
            if (aadharFile) {
                aadharBase64 = await fileToBase64(aadharFile);
            }


            if (password !== confirmPassword) {
                Alerts.warning("Passwords do not match.");
                return;
            }


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

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
            }

            try {

                await AuthAPI.registerWorker(data);
                await Alerts.success("Registration Successful! Login and check your verification status.");


                window.location.href = "worker_login.html";

            } catch (error) {
                console.error("Signup Error:", error);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Register as Worker';
                }
                if (error.message === "Failed to fetch") {
                    Alerts.error("Backend server is offline! Please start main.py.");
                } else {
                    Alerts.error("Registration Failed: " + error.message);
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


async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);


                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedBase64);
            };
        };
        reader.onerror = error => reject(error);
    });
}


