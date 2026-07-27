
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {

        loginForm.addEventListener('submit', async (event) => {

            event.preventDefault();

            const identifier = document.getElementById('identifier').value.trim();
            const password = document.getElementById('password').value;

            if (!identifier || !password) {
                Alerts.warning("Email and Password are required!");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(identifier)) {
            }

            console.log("Login started for:", identifier);

            try {
                try {
                    const result = await AuthAPI.loginCustomer(identifier, password);

                    localStorage.setItem('user_id', result.customer_id);
                    localStorage.setItem('user_name', result.name);
                    localStorage.setItem('user_type', 'customer');
                    localStorage.setItem('token', result.access_token);

                    await Alerts.success("Customer Login Successful!");

                    window.location.href = "customer_dashboard.html";
                    return;

                } catch (customerError) {

                    const isInvalidUser = customerError.message &&
                        (customerError.message.includes("401") || customerError.message.includes("Invalid"));

                    if (isInvalidUser) {
                        console.log("Customer login failed, checking for Admin...");
                        const adminResult = await AdminAPI.login(identifier, password);

                        localStorage.setItem('admin_user', adminResult.username);
                        localStorage.setItem('user_type', 'admin');
                        localStorage.setItem('token', adminResult.access_token);

                        await Alerts.success("Admin Login Successful!");
                        window.location.href = "admin_dashboard.html";
                        return;
                    } else {
                        throw customerError;
                    }
                }
            } catch (error) {
                console.error("Login Error details:", error);

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


