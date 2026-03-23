
// Get the logged-in customer's ID and type from the browser's memory
const customerId = localStorage.getItem('user_id');
const userType = localStorage.getItem('user_type');

// Security check: If the user is not logged in as a customer, send them back to the login page
if (!customerId || userType !== 'customer') {
    window.location.href = 'customer_login.html';
}

// This code runs as soon as the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadProfile(); // Load the user's name, email, etc.
    loadBookings(); // Load all the bookings this user has made

    // Setup the form for booking new services
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', bookService); // Run bookService function when form is submitted
    }

    // --- DATE RESTRICTION LOGIC ---
    // This part prevents users from accidentally picking a date that has already passed
    const dateInput = document.getElementById("date");
    if (dateInput) {
        // Get today's local date in the correct format (Year-Month-Day)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        // Set the minimum date allowed in the input field to "today"
        dateInput.min = today;
    }
});

// Function to fetch and display the customer's profile info from the server
async function loadProfile() {
    try {
        // Call the API to get the profile data
        const data = await CustomerAPI.getProfile(customerId);

        // Find the HTML elements where we want to show the profile details
        const viewName = document.getElementById('viewName');
        const viewEmail = document.getElementById('viewEmail');
        const viewPhone = document.getElementById('viewPhone');
        const viewAddress = document.getElementById('viewAddress');

        // Put the server data into those HTML elements
        if (viewName) viewName.innerText = data.full_name;
        if (viewEmail) viewEmail.innerText = data.email;
        if (viewPhone) viewPhone.innerText = data.phone;
        if (viewAddress) viewAddress.innerText = data.address;

        // Also fill in the inputs in the "Edit Profile" section
        const editName = document.getElementById('editName');
        const editPhone = document.getElementById('editPhone');
        const editAddress = document.getElementById('editAddress');
        if (editName) editName.value = data.full_name;
        if (editPhone) editPhone.value = data.phone;
        if (editAddress) editAddress.value = data.address;

    } catch (error) {
        // Log an error if the profile fails to load
        console.error("Error loading profile:", error);
    }
}

// Function to load all the bookings the customer has made
async function loadBookings() {
    const container = document.getElementById('bookings-container');
    if (!container) return;

    try {
        // Fetch bookings from the server
        const bookings = await BookingsAPI.getForCustomer(customerId);
        // Show the bookings on the screen
        renderBookings(bookings);
    } catch (error) {
        console.error("Error loading bookings:", error);
        container.innerHTML = '<p style="text-align: center; color: red;">Error loading bookings.</p>';
    }
}

// Function to create the HTML cards for each booking and add them to the page
function renderBookings(bookings) {
    const container = document.getElementById('bookings-container');
    if (!container) return;

    // Remove any cancelled bookings and sort them so the newest is at the top
    const displayBookings = bookings.sort((a, b) => b.booking_id - a.booking_id).filter(b => b.status !== 'cancelled');

    // If there are no bookings to show, let the user know
    if (displayBookings.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; margin-top: 20px;">No active bookings.</p>';
        updateStats(bookings);
        return;
    }

    // Update the "Jobs Completed" count at the top
    updateStats(bookings);
    // Clear any old message from the container
    container.innerHTML = '';

    // Create a card (a box) for each booking
    displayBookings.forEach(booking => {
        const card = document.createElement('div');
        // Add special styling if the booking was already accepted by a worker
        card.className = `booking-card ${booking.status === 'accepted' ? 'accepted-card' : ''}`;

        // Decide what text to show in the status badge
        const statusText = booking.status === 'completed' ? 'Job Completed' :
            (booking.status === 'accepted' ? 'Accepted' : booking.status.toUpperCase());
        let statusBadge = `<span class="badge badge-${booking.status}">${statusText}</span>`;

        // Fill the card with HTML content including the service name, problem, date, and actions
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
        // Add the finished card to the page
        container.appendChild(card);
    });
}

// Function to update the number of completed jobs shown on the dashboard
function updateStats(bookings) {
    const completedCount = bookings.filter(b => b.status === "completed").length;
    const completedEl = document.getElementById("completedCount");
    if (completedEl) completedEl.innerText = completedCount;
}

// Function to handle the "Book Now" form submission
async function bookService(e) {
    // Prevent the default browser behavior (page refresh)
    e.preventDefault();
    // Get all the values the user typed into the booking form
    const service = document.getElementById('service').value;
    const problem = document.getElementById('problem').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('bookingPhone').value;
    const photoInput = document.getElementById('problemPhoto');

    // --- DATE VALIDATION ---
    // Ensure the user didn't somehow bypass the HTML date picker and select a past date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    if (date < today) {
        alert("Please select today's date or a future date.");
        return;
    }

    // Convert the selected photo file into a base64 string that the server can store
    let photoBase64 = null;
    if (photoInput && photoInput.files.length > 0) {
        const file = photoInput.files[0];
        photoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    // Bundle all the booking data into one object
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
        // Send the booking request to the server
        await BookingsAPI.create(customerId, bookingData);
        alert("Booking request sent successfully!");
        // Clear the form fields after successful booking
        e.target.reset();
        // Refresh the list of bookings on the page
        loadBookings();
    } catch (error) {
        // Show an error message if the booking failed
        alert("Booking failed: " + error.message);
    }
}

// Function to cancel an existing booking
async function cancelBooking(bookingId) {
    // Confirm with the user before actually cancelling
    if (!confirm("Are you sure you want to cancel?")) return;

    try {
        // Tell the server to change the status to 'cancelled'
        await BookingsAPI.updateStatus(bookingId, 'cancelled', null);
        alert("Booking cancelled.");
        // Refresh the list
        loadBookings();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Function for the customer to confirm a job was completed by the worker
async function completeBooking(bookingId, workerId) {
    // Confirm before marking as done
    if (!confirm("Confirm that the job is done?")) return;

    try {
        // Tell the server the job is 'completed'
        await BookingsAPI.updateStatus(bookingId, 'completed', workerId);
        alert("Job completed!");
        // Refresh the list
        loadBookings();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Functions to open and close the profile sidebar menu
function toggleProfile() {
    document.getElementById("profileSidebar")?.classList.toggle("active");
    document.getElementById("overlay")?.classList.toggle("active");
}

// Enable the input fields in the profile sidebar for editing
function enableEdit() {
    // Hide the static text views
    ["viewName", "viewPhone", "viewAddress"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    // Show the editable input fields
    ["editName", "editPhone", "editAddress"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "block";
    });
    // Show the "Save Changes" button
    const saveBtn = document.querySelector(".profile-save-btn");
    if (saveBtn) saveBtn.style.display = "block";
}

// Function to save the updated profile back to the server
async function saveProfile() {
    // Get the values from the input fields
    const fullName = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();

    // Make sure no fields are left empty
    if (!fullName || !phone || !address) {
        alert("Please fill all fields!");
        return;
    }

    // Basic validation: the name should only have letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName)) {
        alert("Name should only contain letters!");
        return;
    }

    // Basic validation: the phone number must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        alert("Phone number must be exactly 10 digits!");
        return;
    }

    // Prepare the update object
    const data = {
        full_name: fullName,
        phone: phone,
        address: address
    };

    try {
        // Update the profile via the API
        await CustomerAPI.updateProfile(customerId, data);
        alert("Profile updated successfully!");
        // Refresh the page to show the new details
        location.reload();
    } catch (error) {
        alert("Update failed: " + error.message);
    }
}

// Log out by clearing storage and returning to the home page
function logout() {
    localStorage.clear();
    window.location.href = '../../index.html';
}

// Export these functions so they can be triggered by buttons in the HTML file
window.toggleProfile = toggleProfile;
window.enableEdit = enableEdit;
window.saveProfile = saveProfile;
window.bookService = bookService;
window.cancelBooking = cancelBooking;
window.completeBooking = completeBooking;
window.logout = logout;
