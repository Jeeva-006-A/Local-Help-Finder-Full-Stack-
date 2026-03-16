
document.addEventListener('DOMContentLoaded', () => {

    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();


            const nameRegex = /^[a-zA-Z\s]+$/;
            if (!nameRegex.test(name)) {
                alert("Name should only contain letters.");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                alert("Phone number must be exactly 10 digits.");
                return;
            }

            if (!subject || !message) {
                alert("Subject and Message are required.");
                return;
            }

            const data = {
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: message
            };

            try {
                await ContactAPI.sendMessage(data);

                alert("Message sent! We will contact you soon.");

                contactForm.reset();

            } catch (error) {
                console.error("Message error:", error);
                alert("Failed to send message: " + error.message);
            }
        });
    }
});

