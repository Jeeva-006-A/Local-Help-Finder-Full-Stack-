const workerId = localStorage.getItem('user_id');
const userType = localStorage.getItem('user_type');
const workerCategory = localStorage.getItem('worker_category');

if (!workerId || userType !== 'worker') {
    window.location.href = '../pages/worker_login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadIncomingJobs();
    loadHistory();

    // Category UI Setup
    const categoryData = {
        plumber: { icon: "fas fa-faucet", name: "PLUMBER", type: "Plumber" },
        electrician: { icon: "fas fa-bolt", name: "ELECTRICIAN", type: "Electrician" },
        mechanic: { icon: "fas fa-wrench", name: "MECHANIC", type: "Mechanic" }
    };

    if (workerCategory && categoryData[workerCategory.toLowerCase()]) {
        const cat = categoryData[workerCategory.toLowerCase()];
        const iconEl = document.getElementById("categoryIcon");
        if (iconEl) iconEl.innerHTML = `<i class="${cat.icon}"></i>`;

        const nameEl = document.getElementById("categoryName");
        if (nameEl) nameEl.textContent = cat.name;

        const typeEl = document.getElementById("categoryType");
        if (typeEl) typeEl.textContent = cat.type;
    }
});

async function loadProfile() {
    try {
        const data = await WorkerAPI.getProfile(workerId);

        const viewWName = document.getElementById('viewWName');
        const viewWPhone = document.getElementById('viewWPhone');
        const viewWAddress = document.getElementById('viewWAddress');
        const profileCategory = document.getElementById('profileCategory');

        if (viewWName) viewWName.innerText = data.full_name;
        if (viewWPhone) viewWPhone.innerText = data.phone;
        if (viewWAddress) viewWAddress.innerText = data.address;
        if (profileCategory) profileCategory.innerText = data.category;

        // Fill edit inputs
        const editWName = document.getElementById('editWName');
        const editWPhone = document.getElementById('editWPhone');
        const editWAddress = document.getElementById('editWAddress');

        if (editWName) editWName.value = data.full_name;
        if (editWPhone) editWPhone.value = data.phone;
        if (editWAddress) editWAddress.value = data.address;
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

async function loadIncomingJobs() {
    try {
        const jobs = await WorkerAPI.getIncomingJobs(workerId);
        renderIncomingJobs(jobs);
    } catch (error) {
        console.error("Error loading jobs:", error);
    }
}

function renderIncomingJobs(jobs) {
    const containerId = `${workerCategory}Jobs`; // e.g. "PlumberJobs" or "plumberJobs"
    // Note: The HTML usually has camelCase or lowercase logic. workerCategory is likely "Plumber" (from login response if Title Case) or "plumber".
    // I need to be careful with case sensitivity. I'll try to find the container case-insensitively or just assume user data matches HTML.
    // The previous code used `${workerCategory}Jobs`.

    let container = document.getElementById(containerId);
    // If not found, try lowercase
    if (!container && workerCategory) {
        container = document.getElementById(`${workerCategory.toLowerCase()}Jobs`);
    }

    if (container) {
        container.style.display = 'block';
        // Clear hardcoded cards
        const cards = container.querySelectorAll('.booking-card');
        cards.forEach(c => c.remove());

        const newRequests = document.getElementById('newRequests');
        if (newRequests) newRequests.innerText = jobs.length;

        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'booking-card pending-card';
            card.innerHTML = `
                <div class="booking-header">
                    <h4><i class="fas fa-tools"></i> ${job.service ? job.service.toUpperCase() : 'SERVICE'} Request</h4>
                    <span class="badge badge-new"><i class="fas fa-bell"></i> New</span>
                </div>
                <div class="booking-body">
                    <p><strong>Problem:</strong> ${job.problem}</p>
                    <p><strong>Address:</strong> ${job.address}</p>
                    <p><strong>Date:</strong> ${job.date} ${job.time}</p>
                    <div class="booking-actions">
                        <button class="btn btn-accept btn-small" onclick="acceptJob(${job.booking_id})">
                             <i class="fas fa-check-circle"></i> Accept
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

async function acceptJob(bookingId) {
    if (!confirm("Accept this job?")) return;

    try {
        await BookingsAPI.updateStatus(bookingId, 'accepted', parseInt(workerId));
        alert("Job accepted!");
        loadIncomingJobs();
        loadHistory();
    } catch (error) {
        console.error("Error accepting job:", error);
        alert("Error: " + error.message);
    }
}


async function completeJob(bookingId) {
    if (!confirm("Are you sure you want to mark this job as completed?")) return;

    try {
        await BookingsAPI.updateStatus(bookingId, 'completed', parseInt(workerId));
        alert("Job completed!");
        loadHistory();
    } catch (error) {
        console.error("Error completing job:", error);
        alert("Error: " + error.message);
    }
}

async function loadHistory() {
    try {
        const bookings = await BookingsAPI.getForWorker(workerId);
        const historyList = document.getElementById('historyList');
        const historySection = document.getElementById('jobHistory');

        if (historyList) historyList.innerHTML = '';

        const acceptedCount = document.getElementById('acceptedJobs');
        const completedCount = document.getElementById('completedJobs');
        const totalCount = document.getElementById('totalJobs');

        if (acceptedCount) acceptedCount.innerText = bookings.filter(b => b.status === 'accepted').length;
        if (completedCount) completedCount.innerText = bookings.filter(b => b.status === 'completed').length;
        if (totalCount) totalCount.innerText = bookings.length;

        if (bookings.length > 0 && historySection) {
            historySection.style.display = 'block';
        }

        if (historyList) {
            bookings.forEach(b => {
                const card = document.createElement('div');
                card.className = 'booking-card accepted-card';
                card.innerHTML = `
                   <div class="booking-header">
                      <h4>${b.service}</h4>
                      <span class="badge badge-accepted">${b.status}</span>
                   </div>
                   <div class="booking-body">
                      <p><strong>Customer:</strong> ${b.customer ? b.customer.name : 'N/A'}</p>
                      <p><strong>Phone:</strong> ${b.customer ? b.customer.phone : 'N/A'}</p>
                      <p><strong>Address:</strong> ${b.address}</p>
                      <p><strong>Problem:</strong> ${b.problem}</p>
                      ${b.status === 'accepted' ? `
                      <div class="booking-actions" style="margin-top: 10px;">
                          <button class="btn btn-primary btn-small" onclick="completeJob(${b.booking_id})">
                               <i class="fas fa-check-double"></i> Complete Job
                          </button>
                      </div>` : ''}
                   </div>
                `;
                historyList.appendChild(card);
            });
        }
    } catch (e) {
        console.error("Error loading history:", e);
    }
}

// UI & Profile Functions

function toggleProfile() {
    const sidebar = document.getElementById("profileSidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar) sidebar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
}

function enableWorkerEdit() {
    document.getElementById("viewWName").style.display = "none";
    document.getElementById("viewWPhone").style.display = "none";
    document.getElementById("viewWAddress").style.display = "none";

    document.getElementById("editWName").style.display = "block";
    document.getElementById("editWPhone").style.display = "block";
    document.getElementById("editWAddress").style.display = "block";

    document.querySelector(".profile-save-btn").style.display = "block";
}

async function saveWorkerProfile() {
    const data = {
        full_name: document.getElementById('editWName').value,
        phone: document.getElementById('editWPhone').value,
        address: document.getElementById('editWAddress').value
    };

    try {
        await WorkerAPI.updateProfile(workerId, data);
        alert("Profile updated!");
        location.reload();
    } catch (e) {
        console.error(e);
        alert("Update failed: " + e.message);
    }
}

async function declineBooking(bookingId) {
    if (!confirm("Decline this job?")) return;
    // UI behavior only for now as discussed in previous analysis
    alert("Job declined (UI only).");
    loadIncomingJobs();
}

// Make functions available globally used by onclick
window.acceptJob = acceptJob;
window.toggleProfile = toggleProfile;
window.enableWorkerEdit = enableWorkerEdit;
window.saveWorkerProfile = saveWorkerProfile;
window.saveWorkerProfile = saveWorkerProfile;
window.declineBooking = declineBooking;
window.completeJob = completeJob;
