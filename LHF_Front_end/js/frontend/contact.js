document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            try {
                await ContactAPI.sendMessage(data);
                alert("Message sent successfully. We will contact you soon.");
                contactForm.reset();
            } catch (error) {
                console.error("Error sending message:", error);
                alert("Failed to send message: " + error.message);
            }
        });
    }
});
