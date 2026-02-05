document.addEventListener('DOMContentLoaded', () => {
    // Login Logic
    const loginForm = document.getElementById('workerLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const result = await AuthAPI.loginWorker(email, password);

                localStorage.setItem('user_id', result.worker_id);
                localStorage.setItem('user_name', result.name);
                localStorage.setItem('user_type', 'worker');
                localStorage.setItem('worker_category', result.category);

                alert("Login Successful!");
                window.location.href = "../pages/worker_dashboard.html";
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
});
