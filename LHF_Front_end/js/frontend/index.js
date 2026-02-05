document.addEventListener('DOMContentLoaded', () => {
    // Customer Login Handler
    const customerLoginForm = document.getElementById('customerLoginForm');
    if (customerLoginForm) {
        customerLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('customerEmail').value;
            const password = document.getElementById('customerPassword').value;

            try {
                const data = await AuthAPI.loginCustomer(email, password);

                localStorage.setItem('user_id', data.customer_id);
                localStorage.setItem('user_type', 'customer');
                localStorage.setItem('user_name', data.full_name);
                localStorage.setItem('user_phone', data.phone);

                alert("Login Successful!");
                window.location.href = './LHF_Front_end/pages/customer_dashboard.html';
            } catch (error) {
                console.error("Login Result:", error);
                alert("Login failed: " + error.message);
            }
        });
    }

    // Worker Login Handler
    const workerLoginForm = document.getElementById('workerLoginForm');
    if (workerLoginForm) {
        workerLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('workerEmail').value;
            const password = document.getElementById('workerPassword').value;

            try {
                const data = await AuthAPI.loginWorker(email, password);

                localStorage.setItem('user_id', data.worker_id);
                localStorage.setItem('user_type', 'worker');
                localStorage.setItem('user_name', data.full_name);
                localStorage.setItem('user_phone', data.phone);

                alert("Login Successful!");
                window.location.href = './LHF_Front_end/pages/worker_dashboard.html';
            } catch (error) {
                console.error("Login Result:", error);
                alert("Login failed: " + error.message);
            }
        });
    }
});
