

document.addEventListener('DOMContentLoaded', () => {


    const customerLoginForm = document.getElementById('customerLoginForm');


    if (customerLoginForm) {

        customerLoginForm.addEventListener('submit', async (event) => {

            event.preventDefault();


            const identifier = document.getElementById('customerEmail').value;
            const password = document.getElementById('customerPassword').value;

            try {
                try {

                    const data = await AuthAPI.loginCustomer(identifier, password);


                    localStorage.setItem('user_id', data.customer_id);
                    localStorage.setItem('user_type', 'customer');
                    localStorage.setItem('user_name', data.name);

                    alert("Customer Login Successful!");

                    window.location.href = './LHF_Front_end/pages/customer_dashboard.html';
                } catch (customerError) {

                    const isInvalid = customerError.message &&
                        (customerError.message.includes("401") || customerError.message.includes("Invalid"));

                    if (isInvalid) {

                        const adminResult = await AdminAPI.login(identifier, password);


                        localStorage.setItem('admin_user', adminResult.username);
                        localStorage.setItem('user_type', 'admin');

                        alert("Admin Login Successful!");

                        window.location.href = './LHF_Front_end/pages/admin_dashboard.html';
                    } else {

                        throw customerError;
                    }
                }
            } catch (error) {

                console.error("Login Error:", error);
                alert("Login failed: " + error.message);
            }
        });
    }


    const workerLoginForm = document.getElementById('workerLoginForm');

    if (workerLoginForm) {

        workerLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();


            const email = document.getElementById('workerEmail').value;
            const password = document.getElementById('workerPassword').value;

            try {

                const data = await AuthAPI.loginWorker(email, password);


                localStorage.setItem('user_id', data.worker_id);
                localStorage.setItem('user_type', 'worker');
                localStorage.setItem('user_name', data.name);
                localStorage.setItem('worker_category', data.category);
                localStorage.setItem('worker_status', data.status);

                alert("Worker Login Successful!");

                window.location.href = './LHF_Front_end/pages/worker_dashboard.html';
            } catch (error) {

                console.error("Worker Login Error:", error);
                alert("Login failed: " + error.message);
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


