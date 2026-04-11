# 🚗 Bay Manager – Smart Garage Service Management System

## 📌 Overview

Bay Manager is a web-based application designed to automate and efficiently manage the operations of a vehicle service garage. Traditional garage systems rely on manual processes, which often lead to inefficiencies, poor record management, and lack of real-time tracking.

This system provides a centralized digital platform to manage customers, vehicles, bookings, job cards, invoices, payments, and feedback.

---

## 🎯 Key Features

- Role-Based Access Control (Admin, Staff, Customer)
- Service Booking and Tracking
- Job Card Management System
- Invoice Generation and Payment Handling
- 💳 Stripe Payment Integration (Test Mode)
- 🔔 In-App Notification System
- ⭐ Customer Feedback System
- Reports and Analytics Dashboard

---

## 👥 User Roles

### 👨‍💼 Admin
- Manage customers and vehicles
- View and manage bookings
- Create and assign job cards
- Generate invoices and track payments
- View customer feedback and reports

---

### 🔧 Staff
- View assigned job cards
- Update job status (In Progress / Completed)
- Monitor tasks
- View performance ratings

---

### 👤 Customer
- Register and login
- Add and manage vehicles
- Book services
- Track service progress
- View invoices and make payments
- Submit feedback

---

## 🧩 Modules

### Admin Modules
- Dashboard
- Customer Management
- Vehicle Management
- Booking Management
- Job Card Management
- Staff Management
- Invoice Management
- Feedback Management
- Reports & Analytics

---

### Customer Modules
- Dashboard
- My Vehicles
- Book Service
- My Bookings
- Invoices & Payment
- Feedback

---

### Staff Modules
- Dashboard
- My Job Cards
- My Ratings

---

## 🏗 System Architecture

The system follows a **three-tier architecture**:

- Frontend → React.js  
- Backend → Node.js + Express.js  
- Database → MongoDB Atlas  

Communication is handled using REST APIs.

---

## 💻 Technologies Used

- React.js  
- Node.js  
- Express.js  
- MongoDB Atlas  
- Stripe API  
- JWT Authentication  
- Tailwind CSS  
- Axios  

---

## 💳 Payment Integration

Stripe (test mode) is used for secure payments.

**Test Card Details:**
- Card Number: 4242 4242 4242 4242  
- Expiry: Any future date  
- CVV: Any 3 digits  

---

## 🔔 Notification System

- Booking confirmation notifications  
- Job assignment notifications  
- Payment status updates  

---

## ⭐ Feedback System

- Customers can submit feedback after service  
- Admin can view and analyze feedback  
- Helps improve service quality  

---

## 🔄 System Workflow

Customer → Books Service  
↓  
Admin → Creates Job Card → Assigns Staff  
↓  
Staff → Completes Service  
↓  
Admin → Generates Invoice  
↓  
Customer → Makes Payment  
↓  
System → Sends Notifications  

---

## 📁 Project Structure
2. Backend Setup
cd server
npm install
npm start
3. Frontend Setup
cd client
npm install
npm run dev
