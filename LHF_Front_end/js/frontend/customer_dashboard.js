// This file handles all logic for the Customer Dashboard
// It includes booking services and updating profiles.

// 1. Get Customer ID from local storage
const customerId = localStorage.getItem('user_id');
const userType = localStorage.getItem('user_type');

// Redirect to login page if user is not logged in as a customer
if (!customerId || userType !== 'customer') {
    window.location.href = 'customer_login.html';
}

// Run these functions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();  // Load profile data
    loadBookings(); // Load previous bookings

    // Call 'bookService' function when the booking form is submitted
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', bookService);
    }

    // Set minimum date for the date input to 'today'
    const dateInput = document.getElementById("date");
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.min = today;
    }
});

// --- FUNCTIONS ---

// A. Loads User profile
async function loadProfile() {
    try {
        const data = await CustomerAPI.getProfile(customerId);

        // Display details in HTML elements
        const viewName = document.getElementById('viewName');
        const viewEmail = document.getElementById('viewEmail');
        const viewPhone = document.getElementById('viewPhone');
        const viewAddress = document.getElementById('viewAddress');

        if (viewName) viewName.innerText = data.full_name;
        if (viewEmail) viewEmail.innerText = data.email;
        if (viewPhone) viewPhone.innerText = data.phone;
        if (viewAddress) viewAddress.innerText = data.address;

        // Fill input fields for edit mode
        const editName = document.getElementById('editName');
        const editPhone = document.getElementById('editPhone');
        const editAddress = document.getElementById('editAddress');
        if (editName) editName.value = data.full_name;
        if (editPhone) editPhone.value = data.phone;
        if (editAddress) editAddress.value = data.address;

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// Helper function to convert file to Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// B. Books a new service
async function bookService(event) {
    event.preventDefault(); // Stop page refresh

    if (!customerId) {
        alert("Please login first.");
        return;
    }

    // Get data from form inputs
    const service = document.getElementById('service').value;
    const problem = document.getElementById('problem').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('bookingPhone')?.value || localStorage.getItem('user_phone');
    const photoInput = document.getElementById('problemPhoto');

    // --- VALIDATION LOGIC ---
    // A. Check if required fields are empty
    if (!service || !problem || !date || !time || !address) {
        alert("Please fill all required fields - including address");
        return;
    }

    // B. Problem description length check: Ensure it is not too short
    if (problem.length < 10) {
        alert("Please describe the problem in more detail (min 10 characters)");
        return;
    }

    // C. Phone Validation: Check if it is exactly 10 digits.
    const phoneRegex = /^\d{10}$/;
    if (phone && !phoneRegex.test(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return;
    }

    // D. Photo handling
    let problemPhotoBase64 = null;
    if (photoInput && photoInput.files.length > 0) {
        try {
            problemPhotoBase64 = await toBase64(photoInput.files[0]);
        } catch (error) {
            console.error("Error converting photo to base64:", error);
        }
    }

    const data = {
        service: service,
        problem: problem,
        date: date,
        time: time,
        address: address,
        phone: phone,
        problem_photo: problemPhotoBase64
    };

    // Disable button to show loading effect
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Booking in progress...";
    }

    try {
        await BookingsAPI.create(customerId, data);
        alert("Service booked successfully! 🎉");
        document.querySelector('.booking-form')?.reset();
        loadBookings(); // Refresh the list
    } catch (error) {
        console.error("An error occurred during booking:", error);
        alert("Booking failed: " + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Book Service Now";
        }
    }
}

// C. Fetch and display bookings
async function loadBookings() {
    try {
        const bookings = await BookingsAPI.getForCustomer(customerId);
        renderBookings(bookings); // Render in the UI
    } catch (error) {
        console.error("Error loading bookings:", error);
    }
}

// Display bookings as cards in the UI
function renderBookings(bookings) {
    const container = document.getElementById('bookings-container');
    if (!container) return;

    container.innerHTML = ''; // Clear container first

    // Filter out cancelled bookings
    const displayBookings = bookings.sort((a, b) => b.booking_id - a.booking_id).filter(b => b.status !== 'cancelled');

    if (displayBookings.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; margin-top: 20px;">No active bookings.</p>';
        updateStats(bookings);
        return;
    }

    updateStats(bookings);

    displayBookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = `booking-card ${booking.status === 'accepted' ? 'accepted-card' : ''}`;

        // Status badge logic
        let statusBadge = `<span class="badge badge-${booking.status}">${booking.status.toUpperCase()}</span>`;

        // Card content creation
        card.innerHTML = `
            <div class="booking-header">
                <h4><i class="fas fa-wrench"></i> ${booking.service.toUpperCase()}</h4>
                ${statusBadge}
            </div>
            <div class="booking-body">
                <p><strong>Problem:</strong> ${booking.problem}</p>
                ${booking.problem_photo ? `
                    <div class="problem-photo-container" style="margin: 10px 0;">
                        <img src="${booking.problem_photo}" alt="Problem Photo" style="max-width: 100%; border-radius: 8px; border: 1px solid #ddd; cursor: pointer;" onclick="window.open('${booking.problem_photo}', '_blank')">
                    </div>
                ` : ''}
                <p><strong>Time:</strong> ${booking.date} at ${booking.time}</p>
                <div class="worker-details" style="${booking.worker ? 'margin-top: 15px; padding-top: 15px; border-top: 1px dashed #cbd5e1;' : ''}">
                    <p><strong>Worker:</strong> ${booking.worker ? booking.worker.name : 'Waiting for worker...'}</p>
                    ${booking.worker ? `
                        <p><strong><i class="fas fa-phone"></i> Phone:</strong> ${booking.worker.phone}</p>
                        <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${booking.worker.address}</p>
                    ` : ''}
                </div>
            </div>
            <div class="booking-actions">
                ${booking.status === 'pending' ? `<button onclick="cancelBooking(${booking.booking_id})" class="btn-cancel">Cancel</button>` : ''}
                ${booking.status === 'accepted' ? `<button onclick="completeBooking(${booking.booking_id}, ${booking.worker?.id})" class="btn-complete"><i class="fas fa-check-circle"></i> Mark as Done</button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// Update stats counts
function updateStats(bookings) {
    const completedCount = bookings.filter(b => b.status === "completed").length;
    const completedEl = document.getElementById("completedCount");
    if (completedEl) completedEl.innerText = completedCount;
}

// Cancel Booking logic
async function cancelBooking(bookingId) {
    if (!confirm("Are you sure you want to cancel?")) return;

    try {
        await BookingsAPI.updateStatus(bookingId, 'cancelled', null);
        alert("Booking cancelled.");
        loadBookings();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Complete Booking logic
async function completeBooking(bookingId, workerId) {
    if (!confirm("Confirm that the job is done?")) return;

    try {
        await BookingsAPI.updateStatus(bookingId, 'completed', workerId);
        alert("Job completed! ✅");
        loadBookings();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Profile update Logic
async function saveProfile() {
    const fullName = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();

    // --- VALIDATION LOGIC ---

    // A. Name Validation: Only letters (a-z, A-Z) and spaces allowed. 
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName)) {
        alert("Name should only contain letters!");
        return;
    }

    // B. Phone Validation: Check if it is exactly 10 digits.
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        alert("Phone number must be exactly 10 digits!");
        return;
    }

    const data = {
        full_name: fullName,
        phone: phone,
        address: address
    };

    try {
        await CustomerAPI.updateProfile(customerId, data);
        alert("Profile updated successfully!");
        location.reload(); // Refresh page to update details
    } catch (error) {
        alert("Update failed: " + error.message);
    }
}

// UI features toggle
function toggleProfile() {
    document.getElementById("profileSidebar")?.classList.toggle("active");
    document.getElementById("overlay")?.classList.toggle("active");
}

function enableEdit() {
    // Hide text, show inputs
    ["viewName", "viewPhone", "viewAddress"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    ["editName", "editPhone", "editAddress"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "block";
    });
    const saveBtn = document.querySelector(".profile-save-btn");
    if (saveBtn) saveBtn.style.display = "block";
}

// Global Exports - For other components to use
window.toggleProfile = toggleProfile;
window.enableEdit = enableEdit;
window.saveProfile = saveProfile;
window.bookService = bookService;
window.cancelBooking = cancelBooking;
window.completeBooking = completeBooking;

