// This file handles sending messages from the Contact Us page

document.addEventListener('DOMContentLoaded', () => {

    // 1. Get the Contact Form from HTML
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        // This function runs when the 'Send Message' button is clicked
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent page reload

            // 2. Collect input values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            // --- VALIDATION LOGIC ---

            // A. Name Validation: Only letters (a-z, A-Z) and spaces allowed.
            const nameRegex = /^[a-zA-Z\s]+$/;
            if (!nameRegex.test(name)) {
                alert("Name should only contain letters.");
                return;
            }

            // B. Email Validation: Check for a valid email address.
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            // C. Phone Validation: Check if it is exactly 10 digits.
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                alert("Phone number must be exactly 10 digits.");
                return;
            }

            // D. Subject & Message Validation: Ensure fields are not empty.
            if (!subject || !message) {
                alert("Subject and Message are required.");
                return;
            }

            // 3. Bundle data into an object
            const data = {
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: message
            };

            try {
                // Send message to backend using ContactAPI
                await ContactAPI.sendMessage(data);

                alert("Message sent! We will contact you soon.");

                // Reset the form
                contactForm.reset();

            } catch (error) {
                console.error("Message error:", error);
                alert("Failed to send message: " + error.message);
            }
        });
    }
});

