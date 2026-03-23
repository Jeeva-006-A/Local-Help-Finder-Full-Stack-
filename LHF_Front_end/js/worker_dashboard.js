
// Get the logged-in worker's ID, type, and job category (like plumber) from browser memory
const workerId = localStorage.getItem('user_id');
const userType = localStorage.getItem('user_type');
const workerCategory = localStorage.getItem('worker_category');

// Security check: If not logged in as a worker, send them back to the login page
if (!workerId || userType !== 'worker') {
    window.location.href = 'worker_login.html';
}

// This variable remembers which filter is selected for job history (all, accepted, or completed)
let currentFilter = 'all';

// This code runs when the website finishes loading
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();      // Fetch and show the worker's name and details
    loadIncomingJobs(); // Fetch new job requests specifically for this type of worker
    loadHistory();      // Fetch the history of jobs this worker has worked on

    // Check if the account is still pending verification by the admin
    const workerStatus = localStorage.getItem('worker_status');
    if (workerStatus === 'pending') {
        const jobsContainer = document.getElementById('incoming-jobs');
        if (jobsContainer) {
            // Show a warning message if the account is not verified yet
            jobsContainer.innerHTML = `
                <div class="card" style="border: 1px solid #ff9800; background: rgba(255, 152, 0, 0.1); padding: 20px; text-align: center;">
                    <h3 style="color: #ff9800;">Account Under Verification</h3>
                    <p>Please wait while the admin verifies your details.</p>
                </div>
            `;
        }
    }

    // Connect the "Statistics" cards (Total, Accepted, Completed) to the filter function
    const totalCard = document.getElementById('totalJobs')?.closest('.stat-card');
    const acceptedCard = document.getElementById('acceptedJobs')?.closest('.stat-card');
    const completedCard = document.getElementById('completedJobs')?.closest('.stat-card');

    // When a card is clicked, change the filter and reload the history list
    if (totalCard) totalCard.onclick = () => { currentFilter = 'all'; loadHistory(); };
    if (acceptedCard) acceptedCard.onclick = () => { currentFilter = 'accepted'; loadHistory(); };
    if (completedCard) completedCard.onclick = () => { currentFilter = 'completed'; loadHistory(); };

    // Show the correct icon and category name (like PLUMBER) at the top
    setupCategoryUI();
});

// Function to set up the top UI based on the worker's job type (Plumber, Electrician, or Mechanic)
function setupCategoryUI() {
    // Define icons and names for each category
    const categoryData = {
        plumber: { icon: "fas fa-faucet", name: "PLUMBER" },
        electrician: { icon: "fas fa-bolt", name: "ELECTRICIAN" },
        mechanic: { icon: "fas fa-wrench", name: "MECHANIC" }
    };

    // If we have a valid category, put the correct text and icon into the HTML
    if (workerCategory && categoryData[workerCategory.toLowerCase()]) {
        const cat = categoryData[workerCategory.toLowerCase()];
        const iconEl = document.getElementById("categoryIcon");
        if (iconEl) iconEl.innerHTML = `<i class="${cat.icon}"></i>`;

        const nameEl = document.getElementById("categoryName");
        if (nameEl) nameEl.textContent = cat.name;
    }
}

// Function to fetch the worker's own details from the server
async function loadProfile() {
    try {
        const data = await WorkerAPI.getProfile(workerId);

        // Put the server data into the display elements on the profile sidebar
        document.getElementById('viewWName').innerText = data.full_name;
        document.getElementById('viewWEmail').innerText = data.email;
        document.getElementById('viewWPhone').innerText = data.phone;
        document.getElementById('viewWAddress').innerText = data.address;
        document.getElementById('profileCategory').innerText = data.category;
        document.getElementById('viewWExperience').innerText = data.experience + " Years";

        // Show the verification status (verified or pending) as a badge
        const statusEl = document.getElementById('viewWStatus');
        if (statusEl) {
            statusEl.innerText = data.status.toUpperCase();
            statusEl.className = `badge badge-${data.status}`;
        }

        // Pre-fill the "Edit Profile" form with current values
        document.getElementById('editWName').value = data.full_name;
        document.getElementById('editWPhone').value = data.phone;
        document.getElementById('editWAddress').value = data.address;

    } catch (error) {
        console.error("Profile load error:", error);
    }
}

// Function to load any new job requests that haven't been accepted by anyone yet
async function loadIncomingJobs() {
    try {
        const jobs = await WorkerAPI.getIncomingJobs(workerId);
        // Show these jobs on the screen
        renderIncomingJobs(jobs);
    } catch (error) {
        console.error("Jobs load error:", error);
    }
}

// Function to create HTML cards for every new incoming job request
function renderIncomingJobs(jobs) {
    // Find the correct container based on the worker type (e.g., plumberJobs container)
    let container = document.getElementById(`${workerCategory.toLowerCase()}Jobs`);
    if (!container) return;

    // Make sure the container is visible
    container.style.display = 'block';

    // Update the "New Requests" count at the top
    const newRequestsCount = document.getElementById('newRequests');
    if (newRequestsCount) newRequestsCount.innerText = jobs.length;

    // Clear any old job cards before showing the fresh ones
    const existingCards = container.querySelectorAll('.booking-card');
    existingCards.forEach(c => c.remove());

    // Loop through each job and create a card with an 'Accept' button
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
        // Add the card to our container
        container.appendChild(card);
    });
}

// Function to accept a job request
async function acceptJob(bookingId) {
    // Ask the worker to confirm before accepting
    if (!confirm("Are you sure you want to accept this job?")) return;

    try {
        // Tell the server to change status to 'accepted' and assign it to this worker
        await BookingsAPI.updateStatus(bookingId, 'accepted', parseInt(workerId));
        alert("Job accepted successfully!");
        // Refresh the new jobs list and the history list
        loadIncomingJobs();
        loadHistory();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Function to mark an accepted job as completed
async function completeJob(bookingId) {
    if (!confirm("Confirm that the job is completed?")) return;

    try {
        // Tell the server the job is now 'completed'
        await BookingsAPI.updateStatus(bookingId, 'completed', parseInt(workerId));
        alert("Job completed! Good job.");
        // Refresh the history list
        loadHistory();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Function to load and filter the worker's job history
async function loadHistory() {
    try {
        // Fetch all jobs associated with this worker
        const bookings = await BookingsAPI.getForWorker(workerId);
        const historyList = document.getElementById('historyList');
        const historySection = document.getElementById('jobHistory');

        // Clear the current list
        if (historyList) historyList.innerHTML = '';

        // Update the numbers in the stat cards
        document.getElementById('acceptedJobs').innerText = bookings.filter(b => b.status === 'accepted').length;
        document.getElementById('completedJobs').innerText = bookings.filter(b => b.status === 'completed').length;
        document.getElementById('totalJobs').innerText = bookings.length;

        // Highlight the selected card with a border color
        document.querySelectorAll('.stat-card').forEach(c => c.style.borderColor = 'var(--border)');
        if (currentFilter === 'all') document.getElementById('totalJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';
        if (currentFilter === 'accepted') document.getElementById('acceptedJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';
        if (currentFilter === 'completed') document.getElementById('completedJobs').closest('.stat-card').style.borderColor = 'var(--brand-color)';

        // Filter the jobs based on what the user clicked (All, Accepted, or Completed)
        const filteredBookings = currentFilter === 'all'
            ? bookings
            : bookings.filter(b => b.status === currentFilter);

        // If we found jobs for the filter, show them
        if (filteredBookings.length > 0) {
            historySection.style.display = 'block';

            // Loop through each filtered job and show its card
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
                // Add the card to history
                historyList.appendChild(card);
            });
        } else {
            // If no jobs match the current filter, show a simple message
            if (currentFilter !== 'all') {
                historySection.style.display = 'block';
                historyList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No ${currentFilter} jobs found.</p>`;
            } else {
                // If there's absolutely no history at all, hide the whole section
                historySection.style.display = 'none';
            }
        }
    } catch (e) {
        console.error("History load error:", e);
    }
}

// Profile sidebar functions to open and close the menu
function toggleProfile() {
    document.getElementById("profileSidebar")?.classList.toggle("active");
    document.getElementById("overlay")?.classList.toggle("active");
}

// Enable the input fields so the worker can edit their profile info
function enableWorkerEdit() {
    // Hide static text, show input boxes
    ["viewWName", "viewWPhone", "viewWAddress"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });
    ["editWName", "editWPhone", "editWAddress"].forEach(id => {
        document.getElementById(id).style.display = "block";
    });
    // Finally show the 'Save' button
    document.querySelector(".profile-save-btn").style.display = "block";
}

// Save the updated profile values back to the server
async function saveWorkerProfile() {
    // Fetch values from inputs
    const fullName = document.getElementById('editWName').value.trim();
    const phone = document.getElementById('editWPhone').value.trim();
    const address = document.getElementById('editWAddress').value.trim();

    // Small validation: full name must only have letters
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName)) {
        alert("Name should only contain letters.");
        return;
    }

    // Small validation: phone number must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return;
    }

    // Bundle the data for update
    const data = {
        full_name: fullName,
        phone: phone,
        address: address
    };

    try {
        // Send updated data to server
        await WorkerAPI.updateProfile(workerId, data);
        alert("Profile updated!");
        // Refresh the page to show clean status
        location.reload();
    } catch (e) {
        alert("Update failed: " + e.message);
    }
}

// Logout the worker by clearing saved data
function logout() {
    localStorage.clear();
    window.location.href = '../../index.html';
}

// Export functions to the global window so they can be triggered from HTML buttons
window.acceptJob = acceptJob;
window.toggleProfile = toggleProfile;
window.enableWorkerEdit = enableWorkerEdit;
window.saveWorkerProfile = saveWorkerProfile;
window.completeJob = completeJob;
window.logout = logout;
