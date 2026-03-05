// This file handles logic for the Worker Dashboard
// Workers can accept jobs and view their history here.

// 1. Get Worker details from local storage
const workerId = localStorage.getItem('user_id');
const userType = localStorage.getItem('user_type');
const workerCategory = localStorage.getItem('worker_category');

// Redirect to worker login page if not logged in
if (!workerId || userType !== 'worker') {
    window.location.href = 'worker_login.html';
}

let currentFilter = 'all';

// Run these tasks when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();       // Load worker profile
    loadIncomingJobs();  // Check for new jobs
    loadHistory();       // Show completed/history jobs

    // Notify worker if the account is still pending admin verification
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

    // --- FILTER CLICKS ---
    const totalCard = document.getElementById('totalJobs')?.closest('.stat-card');
    const acceptedCard = document.getElementById('acceptedJobs')?.closest('.stat-card');
    const completedCard = document.getElementById('completedJobs')?.closest('.stat-card');

    if (totalCard) totalCard.onclick = () => { currentFilter = 'all'; loadHistory(); };
    if (acceptedCard) acceptedCard.onclick = () => { currentFilter = 'accepted'; loadHistory(); };
    if (completedCard) completedCard.onclick = () => { currentFilter = 'completed'; loadHistory(); };

    // Set UI icons/symbols based on Worker Category
    setupCategoryUI();
});

// Function to handle category symbols
function setupCategoryUI() {
    const categoryData = {
        plumber: { icon: "fas fa-faucet", name: "PLUMBER" },
        electrician: { icon: "fas fa-bolt", name: "ELECTRICIAN" },
        mechanic: { icon: "fas fa-wrench", name: "MECHANIC" }
    };

    if (workerCategory && categoryData[workerCategory.toLowerCase()]) {
        const cat = categoryData[workerCategory.toLowerCase()];
        const iconEl = document.getElementById("categoryIcon");
        if (iconEl) iconEl.innerHTML = `<i class="${cat.icon}"></i>`;

        const nameEl = document.getElementById("categoryName");
        if (nameEl) nameEl.textContent = cat.name;
    }
}

// --- CORE FUNCTIONS ---

// A. Load worker profile details
async function loadProfile() {
    try {
        const data = await WorkerAPI.getProfile(workerId);

        // Insert data into HTML elements
        document.getElementById('viewWName').innerText = data.full_name;
        document.getElementById('viewWEmail').innerText = data.email;
        document.getElementById('viewWPhone').innerText = data.phone;
        document.getElementById('viewWAddress').innerText = data.address;
        document.getElementById('profileCategory').innerText = data.category;
        document.getElementById('viewWExperience').innerText = data.experience + " Years";

        // Status badge logic
        const statusEl = document.getElementById('viewWStatus');
        if (statusEl) {
            statusEl.innerText = data.status.toUpperCase();
            statusEl.className = `badge badge-${data.status}`;
        }

        // Fill input fields for editing
        document.getElementById('editWName').value = data.full_name;
        document.getElementById('editWPhone').value = data.phone;
        document.getElementById('editWAddress').value = data.address;

    } catch (error) {
        console.error("Profile load error:", error);
    }
}

// B. Fetch new incoming jobs
async function loadIncomingJobs() {
    try {
        const jobs = await WorkerAPI.getIncomingJobs(workerId);
        renderIncomingJobs(jobs);
    } catch (error) {
        console.error("Jobs load error:", error);
    }
}

// Render job requests as cards in the UI
function renderIncomingJobs(jobs) {
    // Find the container for the specific category
    let container = document.getElementById(`${workerCategory.toLowerCase()}Jobs`);
    if (!container) return;

    container.style.display = 'block';

    // Update the total count of requests
    const newRequestsCount = document.getElementById('newRequests');
    if (newRequestsCount) newRequestsCount.innerText = jobs.length;

    // Clear existing cards and add new ones
    const existingCards = container.querySelectorAll('.booking-card');
    existingCards.forEach(c => c.remove());

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'booking-card pending-card';
        card.innerHTML = `
            <div class="booking-header">
                <h4><i class="fas fa-tools"></i> ${job.service.toUpperCase()} Request</h4>
                <span class="badge badge-new">New</span>
            </div>
            <div class="booking-body">
                <p><strong>Problem:</strong> ${job.problem}</p>
                ${job.problem_photo ? `
                    <div class="problem-photo-container" style="margin: 15px 0; width: 100%; height: 200px; overflow: hidden; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <img src="${job.problem_photo}" alt="Problem Photo" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.3s;" onclick="window.open('${job.problem_photo}', '_blank')">
                    </div>
                ` : ''}
                <p><strong>Address:</strong> ${job.address}</p>
                <p><strong>Date:</strong> ${job.date} ${job.time}</p>
                <div class="booking-actions">
                    <button class="btn btn-accept" onclick="acceptJob(${job.booking_id})">Accept Job </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// C. Logic to accept a job
async function acceptJob(bookingId) {
    if (!confirm("Are you sure you want to accept this job?")) return;

    try {
        // Send status update to API as 'accepted'
        await BookingsAPI.updateStatus(bookingId, 'accepted', parseInt(workerId));
        alert("Job accepted successfully!");
        loadIncomingJobs(); // Refresh job cards
        loadHistory();      // Update history list
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// D. Logic to mark a job as completed
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

// E. Load Job History (completed tasks)
async function loadHistory() {
    try {
        const bookings = await BookingsAPI.getForWorker(workerId);
        const historyList = document.getElementById('historyList');
        const historySection = document.getElementById('jobHistory');

        if (historyList) historyList.innerHTML = '';

        // Update counts
        document.getElementById('acceptedJobs').innerText = bookings.filter(b => b.status === 'accepted').length;
        document.getElementById('completedJobs').innerText = bookings.filter(b => b.status === 'completed').length;
        document.getElementById('totalJobs').innerText = bookings.length;

        // Visual feedback for filter
        document.querySelectorAll('.stat-card').forEach(c => c.style.borderColor = 'var(--border)');
        if (currentFilter === 'all') document.getElementById('totalJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';
        if (currentFilter === 'accepted') document.getElementById('acceptedJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';
        if (currentFilter === 'completed') document.getElementById('completedJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';

        // Filter the list
        const filteredBookings = currentFilter === 'all'
            ? bookings
            : bookings.filter(b => b.status === currentFilter);

        if (filteredBookings.length > 0) {
            historySection.style.display = 'block';

            // Show latest first
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
            // If filtering and no results, show a message or hide section
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

// --- UI HELPERS ---

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

    // --- VALIDATION LOGIC ---

    // A. Name Validation: Only letters (a-z, A-Z) and spaces allowed. 
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName)) {
        alert("Name should only contain letters.");
        return;
    }

    // B. Phone Validation: Check if it is exactly 10 digits.
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

// Global Exports
window.acceptJob = acceptJob;
window.toggleProfile = toggleProfile;
window.enableWorkerEdit = enableWorkerEdit;
window.saveWorkerProfile = saveWorkerProfile;
window.completeJob = completeJob;
