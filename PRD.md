# Product Requirements Document (PRD) - Local Help Finder

## 1. Project Overview
**Local Help Finder** is a full-stack web application designed to bridge the gap between local service providers (workers) and people in need of household services (customers). The platform allows customers to find verified professionals for tasks like plumbing, electrical work, cleaning, etc., while providing workers a platform to showcase their skills and manage bookings.

---

## 2. Business Objectives
- **Efficiency:** Streamline the process of finding and booking local help.
- **Trust:** Provide a verified network of local professionals.
- **Employment:** Create opportunities for local skilled workers to find consistent work.
- **User Experience:** Offer a modern, premium, and easy-to-use interface for all user types.

---

## 3. Target Audience (Personas)
1. **The Customer:** Homeowners or renters looking for quick, reliable help for home maintenance or repairs.
2. **The Worker:** Skilled professionals (plumbers, electricians, etc.) looking to expand their client base and manage their schedule.
3. **The Admin:** Platform moderators who manage users, verify workers, and oversee system health.

---

## 4. Key Features

### 4.1. Customer Portal
- **Authentication:** Secure Signup and Login.
- **Service Search:** Browse and search for workers based on category and location.
- **Booking Management:** 
    - Book a worker for a specific service.
    - View booking history (Active, Completed, Cancelled).
    - Cancel bookings if necessary.
- **Profile Management:** Update personal details and contact information.
- **Theme:** Clean, modern UI with a **Violet/Indigo** primary color palette.

### 4.2. Worker Portal
- **Authentication:** Professional Signup (including skill selection) and Login.
- **Dashboard:**
    - View total earnings and booking statistics.
    - Track active tasks and upcoming appointments.
- **Job Management:** Accept or manage service requests.
- **Profile Management:** Showcase skills, experience, and contact details.
- **Theme:** Professional UI with an **Emerald/Teal** primary color palette.

### 4.3. Admin Portal
- **Management:** Overview of all customers and workers.
- **System Monitoring:** Track total bookings and platform activity.
- **Support:** Handle contact form submissions from users.
- **Theme:** High-contrast **Dark Slate/Midnight** theme for focus and control.

---

## 5. Technical Requirements

### 5.1. Frontend
- **Core:** HTML5, Vanilla CSS3, JavaScript (ES6+).
- **Architecture:** Modular JS structure (connections, frontend logic, UI components).
- **Responsiveness:** Fully responsive design using Media Queries and Flexbox/Grid.
- **Design System:** Glassmorphism, modern typography (Inter/Outfit), and smooth transitions.

### 5.2. Backend
- **Framework:** FastAPI (Python).
- **Database:** SQLAlchemy ORM with SQLite (for development).
- **Architecture:** RESTful API with routers for Bookings, Customers, Workers, Admins, and Contact.

---

## 6. UX & Design Guidelines
- **Visual Hierarchy:** Use clear headings and primary action buttons.
- **Feedback:** Provide micro-animations for button hovers and form submissions.
- **Consistency:** Maintain uniform spacing, border-radii (glassmorphism), and shadow effects across all portals.
- **Color Coding:**
    - **Customers:** Indigo/Violet
    - **Workers:** Emerald/Teal
    - **Admins:** Dark Slate

---

## 7. Non-Functional Requirements
- **Performance:** Pages should load within 2 seconds.
- **Security:** Password hashing and secure API communication.
- **Scalability:** The backend structure should allow for adding new service categories easily.

---

## 8. Future Roadmap
- **Payment Integration:** In-app payments for services.
- **Rating & Reviews:** Customer feedback system for workers.
- **Real-time Notifications:** In-app or email alerts for new bookings.
- **Geolocation:** Find workers based on the customer's live location.
