

const customerId = localStorage.getItem('user_id');
const userType = localStorage.getItem('user_type');


if (!customerId || userType !== 'customer') {
    window.location.href = 'customer_login.html';
}


document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadBookings();


    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', bookService);
    }



    const dateInput = document.getElementById("date");
    if (dateInput) {

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        dateInput.min = today;
    }
});


async function loadProfile() {
    try {

        const data = await CustomerAPI.getProfile(customerId);


        const viewName = document.getElementById('viewName');
        const viewEmail = document.getElementById('viewEmail');
        const viewPhone = document.getElementById('viewPhone');
        const viewAddress = document.getElementById('viewAddress');


        if (viewName) viewName.innerText = data.full_name;
        if (viewEmail) viewEmail.innerText = data.email;
        if (viewPhone) viewPhone.innerText = data.phone;
        if (viewAddress) viewAddress.innerText = data.address;


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


async function loadBookings() {
    const container = document.getElementById('bookings-container');
    if (!container) return;

    try {

        const bookings = await BookingsAPI.getForCustomer(customerId);

        renderBookings(bookings);
    } catch (error) {
        console.error("Error loading bookings:", error);
        container.innerHTML = '<p style="text-align: center; color: red;">Error loading bookings.</p>';
    }
}


function renderBookings(bookings) {
    const container = document.getElementById('bookings-container');
    if (!container) return;


    const displayBookings = bookings.sort((a, b) => b.booking_id - a.booking_id).filter(b => b.status !== 'cancelled');


    if (displayBookings.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; margin-top: 20px;">No active bookings.</p>';
        updateStats(bookings);
        return;
    }


    updateStats(bookings);

    container.innerHTML = '';


    displayBookings.forEach(booking => {
        const card = document.createElement('div');

        card.className = `booking-card ${booking.status === 'accepted' ? 'accepted-card' : ''}`;


        const statusText = booking.status === 'completed' ? 'Job Completed' :
            (booking.status === 'accepted' ? 'Accepted' : booking.status.toUpperCase());
        let statusBadge = `<span class="badge badge-${booking.status}">${statusText}</span>`;


        card.innerHTML = `
            <div class="booking-header">
                <h4><i class="fas fa-wrench"></i> ${booking.service.toUpperCase()}</h4>
                ${statusBadge}
            </div>
            <div class="booking-body">
                <p><strong>Problem:</strong> ${booking.problem}</p>
                ${booking.problem_photo ? `
                    <div class="problem-photo-container" style="margin: 15px 0; width: 100%; height: 150px; overflow: hidden; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <img src="${booking.problem_photo}" alt="Problem Photo" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.3s;" onclick="window.open('${booking.problem_photo}', '_blank')">
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


function updateStats(bookings) {
    const completedCount = bookings.filter(b => b.status === "completed").length;
    const completedEl = document.getElementById("completedCount");
    if (completedEl) completedEl.innerText = completedCount;
}


async function bookService(e) {

    e.preventDefault();

    const service = document.getElementById('service').value;
    const problem = document.getElementById('problem').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('bookingPhone').value;
    const photoInput = document.getElementById('problemPhoto');



    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    if (date < today) {
        alert("Please select today's date or a future date.");
        return;
    }


    let photoBase64 = null;
    if (photoInput && photoInput.files.length > 0) {
        const file = photoInput.files[0];
        photoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }


    const bookingData = {
        service: service,
        problem: problem,
        date: date,
        time: time,
        address: address,
        phone: phone,
        problem_photo: photoBase64
    };

    try {

        await BookingsAPI.create(customerId, bookingData);
        alert("Booking request sent successfully!");

        e.target.reset();

        loadBookings();
    } catch (error) {

        alert("Booking failed: " + error.message);
    }
}


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


async function completeBooking(bookingId, workerId) {

    if (!confirm("Confirm that the job is done?")) return;

    try {

        await BookingsAPI.updateStatus(bookingId, 'completed', workerId);
        alert("Job completed!");

        loadBookings();
    } catch (error) {
        alert("Error: " + error.message);
    }
}


function toggleProfile() {
    document.getElementById("profileSidebar")?.classList.toggle("active");
    document.getElementById("overlay")?.classList.toggle("active");
}


function enableEdit() {

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


async function saveProfile() {

    const fullName = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();


    if (!fullName || !phone || !address) {
        alert("Please fill all fields!");
        return;
    }


    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName)) {
        alert("Name should only contain letters!");
        return;
    }


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

        location.reload();
    } catch (error) {
        alert("Update failed: " + error.message);
    }
}


function logout() {
    localStorage.clear();
    window.location.href = '../../index.html';
}


window.toggleProfile = toggleProfile;
window.enableEdit = enableEdit;
window.saveProfile = saveProfile;
window.bookService = bookService;
window.cancelBooking = cancelBooking;
window.completeBooking = completeBooking;
window.logout = logout;
