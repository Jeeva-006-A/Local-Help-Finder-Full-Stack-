

let workerId = localStorage.getItem('user_id');
let userType = localStorage.getItem('user_type');
let workerCategory = localStorage.getItem('worker_category');


if (!workerId || userType !== 'worker') {
    window.location.href = 'worker_login.html';
}


let currentFilter = 'all';


document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadStats();
    loadIncomingJobs();
    loadHistory();

    const availabilityToggle = document.getElementById('availabilityToggle');
    if (availabilityToggle) {
        availabilityToggle.addEventListener('change', updateAvailability);
    }


    const workerStatus = localStorage.getItem('worker_status');
    if (workerStatus === 'pending') {
        const category = (workerCategory || '').toLowerCase();
        const jobsContainer = document.getElementById(`${category}-jobs-container`);
        if (jobsContainer) {
            document.getElementById(`${category}Jobs`).style.display = 'block';
            jobsContainer.innerHTML = `
                <div class="card" style="border: 2px dashed #ff9800; background: rgba(255, 152, 0, 0.05); padding: 30px; text-align: center; border-radius: 12px;">
                    <i class="fas fa-user-clock" style="font-size: 3rem; color: #ff9800; margin-bottom: 15px;"></i>
                    <h3 style="color: #ff9800;">Account Under Verification</h3>
                    <p style="color: #666;">Your professional profile is currently being reviewed by our admin team. You will be able to accept job requests once your account is verified.</p>
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

async function loadStats() {
    try {
        const stats = await WorkerAPI.getStats(workerId);
        updateAvailabilityUI(stats.is_online);
        
        const earningsEl = document.getElementById('todayEarnings');
        if (earningsEl) earningsEl.innerText = `₹${stats.today_earnings}`;
        
        const totalJobsEl = document.getElementById('totalJobs');
        if (totalJobsEl) totalJobsEl.innerText = stats.total_jobs_completed;
        
        const newRequestsEl = document.getElementById('newRequests');
        if (newRequestsEl) newRequestsEl.innerText = stats.pending_requests;
        
        const acceptedJobsEl = document.getElementById('acceptedJobs');
        if (acceptedJobsEl) acceptedJobsEl.innerText = stats.accepted_jobs;
        
        const completedJobsEl = document.getElementById('completedJobs');
        if (completedJobsEl) completedJobsEl.innerText = stats.completed_jobs;
    } catch (error) {
        console.error("Stats load error:", error);
    }
}

function updateAvailabilityUI(isOnline) {
    const onlineStatusEl = document.getElementById('onlineStatus');
    if (onlineStatusEl) {
        onlineStatusEl.innerText = isOnline ? 'Online' : 'Offline';
        onlineStatusEl.style.color = isOnline ? 'var(--success)' : 'var(--danger)';
    }

    const availabilityToggle = document.getElementById('availabilityToggle');
    if (availabilityToggle) {
        availabilityToggle.checked = isOnline;
    }
}

async function updateAvailability(event) {
    const availabilityToggle = event.currentTarget;
    const isOnline = availabilityToggle.checked;

    updateAvailabilityUI(isOnline);
    availabilityToggle.disabled = true;

    try {
        const worker = await WorkerAPI.updateAvailability(workerId, isOnline);
        updateAvailabilityUI(worker.is_online);
        loadIncomingJobs();
        loadStats();
    } catch (error) {
        updateAvailabilityUI(!isOnline);
        Alerts.error("Availability update failed: " + error.message);
    } finally {
        availabilityToggle.disabled = false;
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
        if (data.category && data.category !== workerCategory) {
            workerCategory = data.category;
            localStorage.setItem('worker_category', data.category);
            setupCategoryUI();
        }

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
    if (!workerCategory) return;
    const category = workerCategory.toLowerCase();
    const section = document.getElementById(`${category}Jobs`);
    const container = document.getElementById(`${category}-jobs-container`);

    if (!section || !container) return;


    section.style.display = 'block';

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
                <div class="booking-actions" style="margin-top: 20px; display: flex; gap: 10px;">
                    <button class="btn btn-accept" style="flex: 1;" onclick="acceptJob(this, ${job.booking_id})">Accept Job</button>
                    <button class="btn btn-decline" style="flex: 1;" onclick="rejectJob(this, ${job.booking_id})">Reject</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}


async function acceptJob(btn, bookingId) {
    if (!await Alerts.confirm("Are you sure you want to accept this job?")) return;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Accepting...';

    try {

        await BookingsAPI.updateStatus(bookingId, 'accepted', parseInt(workerId));
        Alerts.success("Job accepted successfully!");

        await loadIncomingJobs();
        await loadHistory();
    } catch (error) {
        Alerts.error("Error: " + error.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}


async function rejectJob(btn, bookingId) {
    const { value: rejectionReason } = await Swal.fire({
        title: 'Reject Booking',
        text: 'Please provide a reason for rejecting this booking.',
        input: 'textarea',
        inputPlaceholder: 'Enter rejection reason',
        inputAttributes: { 'aria-label': 'Rejection reason' },
        showCancelButton: true,
        confirmButtonText: 'Reject Booking',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        inputValidator: (value) => {
            if (!value || !value.trim()) {
                return 'Rejection reason is required.';
            }
        }
    });

    if (rejectionReason === undefined) return;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Rejecting...';

    try {
        await BookingsAPI.updateStatus(bookingId, 'rejected', parseInt(workerId), {
            rejection_reason: rejectionReason.trim()
        });
        Alerts.success("Booking rejected.");

        await loadIncomingJobs();
        await loadHistory();
    } catch (error) {
        Alerts.error("Error: " + error.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}


async function updateJobProgress(btn, bookingId, status, message) {
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Updating...';

    try {
        await BookingsAPI.updateStatus(bookingId, status, parseInt(workerId));
        Alerts.success(message);

        await loadHistory();
    } catch (error) {
        Alerts.error("Error: " + error.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}


async function completeJob(btn, bookingId) {
    const { value: price } = await Swal.fire({
        title: 'Complete Service',
        text: 'Enter the final service price.',
        input: 'number',
        inputAttributes: {
            min: '0.01',
            step: '0.01',
            inputmode: 'decimal',
            'aria-label': 'Service price'
        },
        showCancelButton: true,
        confirmButtonText: 'Complete Service',
        confirmButtonColor: Alerts.getPrimaryColor(),
        cancelButtonColor: '#64748b',
        inputValidator: (value) => {
            const numericPrice = Number(value);
            if (!value || !Number.isFinite(numericPrice) || numericPrice <= 0) {
                return 'Enter a positive service price.';
            }
        }
    });

    if (price === undefined) return;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Completing...';

    try {

        await BookingsAPI.updateStatus(bookingId, 'completed', parseInt(workerId), {
            price: Number(price)
        });
        Alerts.success("Job completed! Good job.");

        await loadHistory();
    } catch (error) {
        Alerts.error("Error: " + error.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}


function formatBookingStatus(status) {
    const statusLabels = {
        accepted: 'Accepted',
        on_the_way: 'On The Way',
        service_started: 'Service Started',
        completed: 'Job Completed',
        rejected: 'Rejected'
    };

    return statusLabels[status] || status.toUpperCase();
}


function getBookingAction(booking) {
    if (booking.status === 'accepted') {
        return `<button class="btn btn-accept" onclick="updateJobProgress(this, ${booking.booking_id}, 'on_the_way', 'Marked as on the way!')">On The Way</button>`;
    }

    if (booking.status === 'on_the_way') {
        return `<button class="btn btn-accept" onclick="updateJobProgress(this, ${booking.booking_id}, 'service_started', 'Service started!')">Start Service</button>`;
    }

    if (booking.status === 'service_started') {
        return `<button class="btn btn-accept" onclick="completeJob(this, ${booking.booking_id})">Complete Service</button>`;
    }

    return '';
}


async function loadHistory() {
    try {

        const bookings = await BookingsAPI.getForWorker(workerId);
        const historyList = document.getElementById('historyList');
        const historySection = document.getElementById('jobHistory');

        if (historyList) historyList.innerHTML = '';

        // Removed manual stat setting, loadStats handles it.
        await loadStats();


        document.querySelectorAll('.stat-card').forEach(c => c.style.borderColor = 'var(--border)');
        if (currentFilter === 'all') document.getElementById('totalJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';
        if (currentFilter === 'accepted') document.getElementById('acceptedJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';
        if (currentFilter === 'completed') document.getElementById('completedJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';


        const filteredBookings = currentFilter === 'all'
            ? bookings
            : bookings.filter(b => currentFilter === 'accepted'
                ? ['accepted', 'on_the_way', 'service_started'].includes(b.status)
                : b.status === currentFilter);


        if (filteredBookings.length > 0) {
            historySection.style.display = 'block';


            filteredBookings.sort((a, b) => b.booking_id - a.booking_id).forEach(b => {
                const card = document.createElement('div');
                card.className = `booking-card ${b.status}-card`;
                card.innerHTML = `
                   <div class="booking-header">
                      <h4>${b.service.toUpperCase()}</h4>
                      <span class="badge badge-${b.status}">${formatBookingStatus(b.status)}</span>
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
                   ${b.status === 'rejected' ? `<p><strong>Rejection Reason:</strong> ${b.rejection_reason || '---'}</p>` : ''}
                   ${b.status === 'completed' ? `<p><strong>Service Price:</strong> ₹${b.price ?? '---'}</p>` : ''}
                   ${getBookingAction(b) ? `<div class="booking-actions" style="margin-top: 20px;">${getBookingAction(b)}</div>` : ''}

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
        Alerts.warning("Name should only contain letters.");
        return;
    }


    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        Alerts.warning("Phone number must be exactly 10 digits.");
        return;
    }


    const data = {
        full_name: fullName,
        phone: phone,
        address: address
    };

    try {

        await WorkerAPI.updateProfile(workerId, data);
        await Alerts.success("Profile updated!");

        location.reload();
    } catch (e) {
        Alerts.error("Update failed: " + e.message);
    }
}


function logout() {
    localStorage.clear();
    window.location.href = '../../index.html';
}


window.acceptJob = acceptJob;
window.rejectJob = rejectJob;
window.updateJobProgress = updateJobProgress;
window.toggleProfile = toggleProfile;
window.enableWorkerEdit = enableWorkerEdit;
window.saveWorkerProfile = saveWorkerProfile;
window.completeJob = completeJob;
window.logout = logout;
