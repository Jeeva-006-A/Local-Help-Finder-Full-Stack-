
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('workerLoginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                Alerts.warning("Please enter a valid email address.");
                return;
            }

            if (!password) {
                Alerts.warning("Password is required.");
                return;
            }

            try {
                const result = await AuthAPI.loginWorker(email, password);

                localStorage.setItem('user_id', result.worker_id);
                localStorage.setItem('user_name', result.name);
                localStorage.setItem('user_type', 'worker');
                localStorage.setItem('worker_category', result.category);
                localStorage.setItem('worker_status', result.status);
                localStorage.setItem('token', result.access_token);

                await Alerts.success("Worker Login Successful!");
                window.location.href = "worker_dashboard.html";

            } catch (error) {
                console.error("Login Error:", error);

                if (error.message === "Failed to fetch") {
                    Alerts.error("Backend server is offline! Please start main.py.");
                } else {
                    Alerts.error("Login failed: " + error.message);
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

