import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

// Auth & Public Pages
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageCustomers from './pages/admin/ManageCustomers.jsx';
import ManageVehicles from './pages/admin/ManageVehicles.jsx';
import ManageBookings from './pages/admin/ManageBookings.jsx';
import ManageJobCards from './pages/admin/ManageJobCards.jsx';
import ManageInvoices from './pages/admin/ManageInvoices.jsx';
import Reports from './pages/admin/Reports.jsx';
import ManageStaff from './pages/admin/ManageStaff.jsx';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard.jsx';
import MyJobCards from './pages/staff/MyJobCards.jsx';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard.jsx';
import BookService from './pages/customer/BookService.jsx';
import MyBookings from './pages/customer/MyBookings.jsx';
import MyInvoices from './pages/customer/MyInvoices.jsx';
import MyVehicles from './pages/customer/MyVehicles.jsx'; // Added MyVehicles
import GiveFeedback from './pages/customer/GiveFeedback.jsx';

// Feedback Related Pages
import FeedbackOverview from './pages/admin/FeedbackOverview.jsx';
import MyRatings from './pages/staff/MyRatings.jsx';

// UI Components
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-blue-500/30">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<LandingPage />} />

            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div className="flex flex-col">
                    <div className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex space-x-8 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-x-auto no-scrollbar">
                       <Link to="/admin" className="text-blue-400 hover:text-blue-300 transition-all flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-blue-400" /> Dashboard
                       </Link>
                       <Link to="/admin/customers" className="text-slate-500 hover:text-slate-200 transition-all">Customers</Link>
                       <Link to="/admin/vehicles" className="text-slate-500 hover:text-slate-200 transition-all">Vehicles</Link>
                       <Link to="/admin/bookings" className="text-slate-500 hover:text-slate-200 transition-all">Bookings</Link>
                       <Link to="/admin/jobcards" className="text-slate-500 hover:text-slate-200 transition-all">Job Cards</Link>
                       <Link to="/admin/staff" className="text-slate-500 hover:text-slate-200 transition-all">Staff</Link>
                       <Link to="/admin/invoices" className="text-slate-500 hover:text-slate-200 transition-all">Invoices</Link>
                       <Link to="/admin/feedback" className="text-purple-400 hover:text-purple-300 transition-all">Feedback</Link>
                       <Link to="/admin/reports" className="text-emerald-400 hover:text-emerald-300 transition-all">Reports</Link>
                    </div>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="customers" element={<ManageCustomers />} />
                      <Route path="vehicles" element={<ManageVehicles />} />
                      <Route path="bookings" element={<ManageBookings />} />
                      <Route path="jobcards" element={<ManageJobCards />} />
                      <Route path="invoices" element={<ManageInvoices />} />
                      <Route path="feedback" element={<FeedbackOverview />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="staff" element={<ManageStaff />} />
                    </Routes>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Staff Routes */}
            <Route 
              path="/staff/*" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <div className="flex flex-col">
                    <div className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex space-x-8 text-[10px] font-black uppercase tracking-[0.2em]">
                       <Link to="/staff" className="text-blue-400 hover:text-blue-300 transition-all flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-blue-400" /> Dashboard
                       </Link>
                       <Link to="/staff/jobcards" className="text-slate-500 hover:text-slate-200 transition-all">My Job Cards</Link>
                       <Link to="/staff/my-ratings" className="text-amber-400 hover:text-amber-300 transition-all">My Ratings</Link>
                    </div>
                    <Routes>
                      <Route path="/" element={<StaffDashboard />} />
                      <Route path="jobcards" element={<MyJobCards />} />
                      <Route path="my-ratings" element={<MyRatings />} />
                    </Routes>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Customer Routes */}
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <div className="flex flex-col">
                    <div className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex space-x-8 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-x-auto no-scrollbar">
                       <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 transition-all flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-blue-400" /> Overview
                       </Link>
                       <Link to="/dashboard/vehicles" className="text-emerald-400 hover:text-emerald-300 transition-all">My Vehicles</Link>
                       <Link to="/dashboard/book" className="text-slate-500 hover:text-slate-200 transition-all">Book Service</Link>
                       <Link to="/dashboard/bookings" className="text-slate-500 hover:text-slate-200 transition-all">My Bookings</Link>
                       <Link to="/dashboard/invoices" className="text-slate-500 hover:text-slate-200 transition-all">Invoices</Link>
                    </div>
                    <Routes>
                      <Route path="/" element={<CustomerDashboard />} />
                      <Route path="vehicles" element={<MyVehicles />} />
                      <Route path="book" element={<BookService />} />
                      <Route path="bookings" element={<MyBookings />} />
                      <Route path="invoices" element={<MyInvoices />} />
                    </Routes>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Customer Feedback Route (Dedicated) */}
            <Route 
              path="/customer/give-feedback/:jobCardId" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <GiveFeedback />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
