document.addEventListener('DOMContentLoaded', () => {
    // Login Logic
    const loginForm = document.getElementById('customerLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const result = await AuthAPI.loginCustomer(email, password);

                localStorage.setItem('user_id', result.customer_id);
                localStorage.setItem('user_name', result.name);
                localStorage.setItem('user_type', 'customer');

                alert("Login Successful!");
                window.location.href = "customer_dashboard.html";
            } catch (error) {
                console.error("Error:", error);
                if (error.message === "Failed to fetch") {
                    alert("Unable to connect to the server. Please ensure the backend is running.");
                } else {
                    alert("Login Failed: " + error.message);
                }
            }
        });
    }

    // Hamburger Menu Logic
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
