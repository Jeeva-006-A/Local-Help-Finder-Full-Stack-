

const workerId = localStorage.getItem('user_id');
const userType = localStorage.getItem('user_type');
const workerCategory = localStorage.getItem('worker_category');


if (!workerId || userType !== 'worker') {
    window.location.href = 'worker_login.html';
}


let currentFilter = 'all';


document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadIncomingJobs();
    loadHistory();


    const workerStatus = localStorage.getItem('worker_status');
    if (workerStatus === 'pending') {
        const jobsContainer = document.getElementById('incoming-jobs');
        if (jobsContainer) {

            jobsContainer.innerHTML = `
                <div class="card" style="border: 1px solid #ff9800; background: rgba(255, 152, 0, 0.1); padding: 20px; text-align: center;">
                    <h3 style="color: #ff9800;">Account Under Verification</h3>
                    <p>Please wait while the admin verifies your details.</p>
                </div>
            `;
        }
    }


    const totalCard = document.getElementById('totalJobs')?.closest('.stat-card');
    const acceptedCard = document.getElementById('acceptedJobs')?.closest('.stat-card');
    const completedCard = document.getElementById('completedJobs')?.closest('.stat-card');


    if (totalCard) totalCard.onclick = () => { currentFilter = 'all'; loadHistory(); };
    if (acceptedCard) acceptedCard.onclick = () => { currentFilter = 'accepted'; loadHistory(); };
    if (completedCard) completedCard.onclick = () => { currentFilter = 'completed'; loadHistory(); };


    setupCategoryUI();
});


function setupCategoryUI() {

    const categoryData = {
        plumber: { icon: "fas fa-faucet", name: "PLUMBER", type: "Plumber" },
        electrician: { icon: "fas fa-bolt", name: "ELECTRICIAN", type: "Electrician" },
        mechanic: { icon: "fas fa-wrench", name: "MECHANIC", type: "Mechanic" }
    };


    const currentCategory = workerCategory ? workerCategory.toLowerCase() : "";
    if (currentCategory && categoryData[currentCategory]) {
        const cat = categoryData[currentCategory];


        const iconEl = document.getElementById("categoryIcon");
        if (iconEl) iconEl.innerHTML = `<i class="${cat.icon}"></i>`;


        const nameEl = document.getElementById("categoryName");
        if (nameEl) nameEl.textContent = cat.name;


        const typeEl = document.getElementById("categoryType");
        if (typeEl) typeEl.textContent = cat.type;
    }
}


async function loadProfile() {
    try {
        const data = await WorkerAPI.getProfile(workerId);


        document.getElementById('viewWName').innerText = data.full_name;
        document.getElementById('viewWEmail').innerText = data.email;
        document.getElementById('viewWPhone').innerText = data.phone;
        document.getElementById('viewWAddress').innerText = data.address;
        document.getElementById('profileCategory').innerText = data.category;
        document.getElementById('viewWExperience').innerText = data.experience + " Years";


        const statusEl = document.getElementById('viewWStatus');
        if (statusEl) {
            statusEl.innerText = data.status.toUpperCase();
            statusEl.className = `badge badge-${data.status}`;
        }


        document.getElementById('editWName').value = data.full_name;
        document.getElementById('editWPhone').value = data.phone;
        document.getElementById('editWAddress').value = data.address;

    } catch (error) {
        console.error("Profile load error:", error);
    }
}


async function loadIncomingJobs() {
    try {
        const jobs = await WorkerAPI.getIncomingJobs(workerId);

        renderIncomingJobs(jobs);
    } catch (error) {
        console.error("Jobs load error:", error);
    }
}


function renderIncomingJobs(jobs) {

    const category = workerCategory.toLowerCase();
    const section = document.getElementById(`${category}Jobs`);
    const container = document.getElementById(`${category}-jobs-container`);

    if (!section || !container) return;


    section.style.display = 'block';


    const newRequestsCount = document.getElementById('newRequests');
    if (newRequestsCount) newRequestsCount.innerText = jobs.length;


    container.innerHTML = '';


    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <div class="booking-header">
                <h4><i class="fas fa-tools"></i> ${job.service.toUpperCase()} Request</h4>
                <span class="badge badge-new">New</span>
            </div>
            <div class="booking-body">
                <p><strong>Problem:</strong> ${job.problem}</p>
                ${job.problem_photo ? `
                    <div class="problem-photo-container" style="margin: 15px 0; width: 100%; height: 180px; overflow: hidden; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <img src="${job.problem_photo}" alt="Problem Photo" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open('${job.problem_photo}', '_blank')">
                    </div>
                ` : ''}
                <p><i class="fas fa-map-marker-alt"></i> <strong>Address:</strong> ${job.address}</p>
                <p><i class="fas fa-calendar-alt"></i> <strong>Date:</strong> ${job.date} ${job.time}</p>
                <div class="booking-actions" style="margin-top: 20px;">
                    <button class="btn btn-accept" style="width: 100%;" onclick="acceptJob(${job.booking_id})">Accept Job </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}


async function acceptJob(bookingId) {

    if (!confirm("Are you sure you want to accept this job?")) return;

    try {

        await BookingsAPI.updateStatus(bookingId, 'accepted', parseInt(workerId));
        alert("Job accepted successfully!");

        loadIncomingJobs();
        loadHistory();
    } catch (error) {
        alert("Error: " + error.message);
    }
}


async function completeJob(bookingId) {
    if (!confirm("Confirm that the job is completed?")) return;

    try {

        await BookingsAPI.updateStatus(bookingId, 'completed', parseInt(workerId));
        alert("Job completed! Good job.");

        loadHistory();
    } catch (error) {
        alert("Error: " + error.message);
    }
}


async function loadHistory() {
    try {

        const bookings = await BookingsAPI.getForWorker(workerId);
        const historyList = document.getElementById('historyList');
        const historySection = document.getElementById('jobHistory');


        if (historyList) historyList.innerHTML = '';


        document.getElementById('acceptedJobs').innerText = bookings.filter(b => b.status === 'accepted').length;
        document.getElementById('completedJobs').innerText = bookings.filter(b => b.status === 'completed').length;
        document.getElementById('totalJobs').innerText = bookings.length;


        document.querySelectorAll('.stat-card').forEach(c => c.style.borderColor = 'var(--border)');
        if (currentFilter === 'all') document.getElementById('totalJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';
        if (currentFilter === 'accepted') document.getElementById('acceptedJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';
        if (currentFilter === 'completed') document.getElementById('completedJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';


        const filteredBookings = currentFilter === 'all'
            ? bookings
            : bookings.filter(b => b.status === currentFilter);


        if (filteredBookings.length > 0) {
            historySection.style.display = 'block';


            filteredBookings.sort((a, b) => b.booking_id - a.booking_id).forEach(b => {
                const card = document.createElement('div');
                card.className = `booking-card ${b.status}-card`;
                card.innerHTML = `
                   <div class="booking-header">
                      <h4>${b.service.toUpperCase()}</h4>
                      <span class="badge badge-${b.status}">${b.status === 'completed' ? 'Job Completed' : (b.status === 'accepted' ? 'Accepted' : b.status.toUpperCase())}</span>
                   </div>
                   <div class="booking-body">
                      <p><strong><i class="fas fa-user"></i> Customer:</strong> ${b.customer?.name || '---'}</p>
                      <p><strong><i class="fas fa-phone"></i> Phone:</strong> ${b.customer?.phone || '---'}</p>
                      <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${b.address}</p>
                      <p><strong><i class="fas fa-info-circle"></i> Problem:</strong> ${b.problem}</p>
                      ${b.problem_photo ? `
                        <div class="problem-photo-container" style="margin: 15px 0; width: 100%; height: 200px; overflow: hidden; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <img src="${b.problem_photo}" alt="Problem Photo" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.3s;" onclick="window.open('${b.problem_photo}', '_blank')">
                        </div>
                      ` : ''}
                   </div>

                `;

                historyList.appendChild(card);
            });
        } else {

            if (currentFilter !== 'all') {
                historySection.style.display = 'block';
                historyList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No ${currentFilter} jobs found.</p>`;
            } else {

                historySection.style.display = 'none';
            }
        }
    } catch (e) {
        console.error("History load error:", e);
    }
}


function toggleProfile() {
    document.getElementById("profileSidebar")?.classList.toggle("active");
    document.getElementById("overlay")?.classList.toggle("active");
}


function enableWorkerEdit() {

    ["viewWName", "viewWPhone", "viewWAddress"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });
    ["editWName", "editWPhone", "editWAddress"].forEach(id => {
        document.getElementById(id).style.display = "block";
    });

    document.querySelector(".profile-save-btn").style.display = "block";
}


async function saveWorkerProfile() {

    const fullName = document.getElementById('editWName').value.trim();
    const phone = document.getElementById('editWPhone').value.trim();
    const address = document.getElementById('editWAddress').value.trim();


    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName)) {
        alert("Name should only contain letters.");
        return;
    }


    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return;
    }


    const data = {
        full_name: fullName,
        phone: phone,
        address: address
    };

    try {

        await WorkerAPI.updateProfile(workerId, data);
        alert("Profile updated!");

        location.reload();
    } catch (e) {
        alert("Update failed: " + e.message);
    }
}


function logout() {
    localStorage.clear();
    window.location.href = '../../index.html';
}


window.acceptJob = acceptJob;
window.toggleProfile = toggleProfile;
window.enableWorkerEdit = enableWorkerEdit;
window.saveWorkerProfile = saveWorkerProfile;
window.completeJob = completeJob;
window.logout = logout;
