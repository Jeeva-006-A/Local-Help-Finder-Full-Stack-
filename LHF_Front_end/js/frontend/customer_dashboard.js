const customerId = localStorage.getItem('user_id');
const userType = localStorage.getItem('user_type');

if (!customerId || userType !== 'customer') {
    window.location.href = '../pages/customer_login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadBookings();

    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', bookService);
    }

    // Set min date to today
    const dateInput = document.getElementById("date");
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.min = today;
    }
});

async function loadProfile() {
    try {
        const data = await CustomerAPI.getProfile(customerId);

        // View Mode
        const viewName = document.getElementById('viewName');
        const viewEmail = document.getElementById('viewEmail');
        const viewPhone = document.getElementById('viewPhone');
        const viewAddress = document.getElementById('viewAddress');
        if (viewName) viewName.innerText = data.full_name;
        if (viewEmail) viewEmail.innerText = data.email;
        if (viewPhone) viewPhone.innerText = data.phone;
        if (viewAddress) viewAddress.innerText = data.address;

        // Edit Mode inputs
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

async function bookService(event) {
    event.preventDefault();

    if (!customerId) {
        alert("Please login first.");
        return;
    }

    // Try to get phone from booking form first, else fallback
    const phoneInput = document.getElementById('bookingPhone');
    let phoneVal = phoneInput ? phoneInput.value : '';
    if (!phoneVal) {
        phoneVal = localStorage.getItem('user_phone') || document.getElementById('viewPhone').innerText;
    }

    const data = {
        service: document.getElementById('service').value,
        problem: document.getElementById('problem').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        address: document.getElementById('address').value,
        phone: phoneVal
    };

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Booking...";
    }

    try {
        await BookingsAPI.create(customerId, data);
        alert("Service booked successfully!");
        const form = document.querySelector('.booking-form');
        if (form) form.reset();
        loadBookings();
    } catch (error) {
        console.error("Error booking service:", error);
        alert("Booking failed: " + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Book Service";
        }
    }
}

async function loadBookings() {
    try {
        const bookings = await BookingsAPI.getForCustomer(customerId);
        renderBookings(bookings);
    } catch (error) {
        console.error("Error loading bookings:", error);
    }
}

function renderBookings(bookings) {
    const container = document.getElementById('bookings-container');

    if (!container) return;

    container.innerHTML = '';

    if (bookings.length === 0) {
        container.innerHTML = '<p id="no-bookings-msg" style="text-align: center; color: #666; margin-top: 20px;">No bookings found.</p>';
        updateStats(bookings);
        return;
    }

    updateStats(bookings);

    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = `booking-card ${booking.status === 'accepted' ? 'accepted-card' : ''}`;

        let statusBadge = '';
        if (booking.status === 'pending') {
            statusBadge = `<span class="badge badge-pending"><i class="fas fa-hourglass-half"></i> Pending</span>`;
        } else if (booking.status === 'accepted') {
            statusBadge = `<span class="badge badge-accepted"><i class="fas fa-check-circle"></i> Accepted</span>`;
        } else if (booking.status === 'completed') {
            statusBadge = `<span class="badge badge-accepted" style="background-color: #4CAF50;">Completed</span>`;
        } else if (booking.status === 'cancelled') {
            statusBadge = `<span class="badge badge-pending" style="background-color: #f44336; color: white;">Cancelled</span>`;
        }

        let workerInfo = '';
        if (booking.worker) {
            workerInfo = `<p><strong>Worker:</strong> ${booking.worker.name}</p>
                          <p><strong>Worker Phone:</strong> ${booking.worker.phone}</p>`;
        } else {
            workerInfo = `<p><strong>Status:</strong> Waiting for worker...</p>`;
        }

        // Add Cancel button if pending
        let actionButtons = '';
        if (booking.status === 'pending') {
            actionButtons = `<div class="booking-actions">
                <button class="btn btn-outline btn-small" onclick="cancelBooking(${booking.booking_id})">
                  <i class="fas fa-times"></i> Cancel Booking
                </button>
              </div>`;
        }

        card.innerHTML = `
            <div class="booking-header">
                <h4><i class="fas fa-wrench"></i> ${booking.service ? booking.service.toUpperCase() : 'SERVICE'} Service</h4>
                ${statusBadge}
            </div>
            <div class="booking-body">
                <p><strong>Problem:</strong> ${booking.problem}</p>
                <p><strong>Scheduled:</strong> ${booking.date} at ${booking.time}</p>
                 <p><strong>Address:</strong> ${booking.address}</p>
                ${workerInfo}
                ${actionButtons}
            </div>
        `;
        container.appendChild(card);
    });
}



function updateStats(bookings) {
    const completedCount = bookings.filter(b => b.status === "completed").length;
    const completedEl = document.getElementById("completedCount");
    if (completedEl) completedEl.innerText = completedCount;
}

// Add Cancel Implementation
async function cancelBooking(bookingId) {
    if (!confirm("Are you sure you want to cancel?")) return;

    try {
        await BookingsAPI.updateStatus(bookingId, 'cancelled', null);
        alert("Booking cancelled.");
        loadBookings();
    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
}

// UI Functions & Profile Update
function toggleProfile() {
    const sidebar = document.getElementById("profileSidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar) sidebar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
}

function enableEdit() {
    const viewName = document.getElementById("viewName");
    const viewPhone = document.getElementById("viewPhone");
    const viewAddress = document.getElementById("viewAddress");
    const editName = document.getElementById("editName");
    const editPhone = document.getElementById("editPhone");
    const editAddress = document.getElementById("editAddress");
    const saveBtn = document.querySelector(".profile-save-btn");

    if (viewName) viewName.style.display = "none";
    if (viewPhone) viewPhone.style.display = "none";
    if (viewAddress) viewAddress.style.display = "none";

    if (editName) editName.style.display = "block";
    if (editPhone) editPhone.style.display = "block";
    if (editAddress) editAddress.style.display = "block";

    if (saveBtn) saveBtn.style.display = "block";
}

async function saveProfile() {
    const data = {
        full_name: document.getElementById('editName').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value
    };

    try {
        await CustomerAPI.updateProfile(customerId, data);
        alert("Profile updated!");
        location.reload();
    } catch (error) {
        console.error(error);
        alert("Update failed: " + error.message);
    }
}

// Global Exports
window.toggleProfile = toggleProfile;
window.enableEdit = enableEdit;
window.saveProfile = saveProfile;
window.bookService = bookService;
window.cancelBooking = cancelBooking;
