import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  Users, Truck, Calendar, Wallet, ClipboardList, 
  FileText, MessageSquare, TrendingUp, Activity, ArrowRight, Car
} from 'lucide-react';
import { getAllCustomers } from '../../services/customerService.js';
import { getAllVehicles } from '../../services/vehicleService.js';
import { getAllBookings } from '../../services/bookingService.js';
import api from '../../services/api.js'; 
import { useNavigate, Link } from 'react-router-dom';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

const AdminDashboard = () => {
  // 1. State to track the count of different records - Preserving existing names
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    bookings: 0,
    invoices: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Design System: Color lookup for consistent aesthetics
  const colorClasses = {
    cyan:    { bg: "bg-cyan-400/10",    border: "border-cyan-400/20",    text: "text-cyan-400" },
    blue:    { bg: "bg-blue-400/10",    border: "border-blue-400/20",    text: "text-blue-400" },
    amber:   { bg: "bg-amber-400/10",   border: "border-amber-400/20",   text: "text-amber-400" },
    emerald: { bg: "bg-emerald-400/10", border: "border-emerald-400/20", text: "text-emerald-400" },
    rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/20",    text: "text-rose-400" },
    purple:  { bg: "bg-purple-400/10",  border: "border-purple-400/20",  text: "text-purple-400" },
  };

  // 2. Fetch all counts on component mount - Preserving logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customers, vehicles, bookings, invoices] = await Promise.all([
          getAllCustomers(),
          getAllVehicles(),
          getAllBookings(),
          api.get('/invoices/all')
        ]);
        
        setStats({
          customers: customers.length,
          vehicles: vehicles.length,
          bookings: bookings.length,
          invoices: invoices.data.length
        });
        setLoading(false);
      } catch (err) {
        console.error("Dashboard count error:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Activity size={40} className="text-cyan-400 animate-pulse mb-4 shadow-glow-cyan-sm" />
        <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Dashboard...</p>
    </div>
  );

  // 3. Define the cards to be displayed - Using colorClasses for rich aesthetics
  const statCards = [
    { label: 'Customers', value: stats.customers, icon: Users, color: 'cyan', delay: 0.1, path: '/admin/customers' },
    { label: 'Vehicles',  value: stats.vehicles,  icon: Car,   color: 'blue', delay: 0.2, path: '/admin/vehicles' },
    { label: 'Bookings',  value: stats.bookings,  icon: Calendar, color: 'amber', delay: 0.3, path: '/admin/bookings' },
    { label: 'Invoices',  value: stats.invoices,  icon: FileText, color: 'emerald', delay: 0.4, path: '/admin/invoices' }
  ];

  // 4. Management Quick Links for Admin Control
  const mgmtLinks = [
    { label: "Manage Customers", desc: "Add and edit customer records",     icon: Users,         color: "cyan",    path: "/admin/customers" },
    { label: "Manage Vehicles",  desc: "Track vehicles per customer",       icon: Car,           color: "blue",    path: "/admin/vehicles" },
    { label: "Manage Bookings",  desc: "Review and confirm service requests", icon: Calendar,    color: "amber",   path: "/admin/bookings" },
    { label: "Manage Job Cards", desc: "Assign mechanics and track progress", icon: ClipboardList, color: "purple", path: "/admin/jobcards" },
    { label: "Manage Invoices",  desc: "Manage and generate invoices.",     icon: Wallet,      color: "emerald", path: "/admin/invoices" },
    { label: "Customer Feedback", desc: "View customer ratings and feedback.", icon: MessageSquare, color: "rose",    path: "/admin/feedback" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ===== HEADER ===== */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-display font-bold text-slate-100 uppercase tracking-tighter">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium leading-relaxed">
            Monitor your workshop operations here.
          </p>
        </motion.div>

        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {statCards.map((card, i) => {
                const Icon = card.icon;
                const cc = colorClasses[card.color];
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: card.delay }}
                    >
                        <Link to={card.path}>
                            <Card className="hover:shadow-glow-cyan-sm hover:border-cyan-400/30 hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${cc.bg} ${cc.border} ${cc.text} shadow-inner`}>
                                        <Icon size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                                            {card.label}
                                        </p>
                                        <p className="text-3xl font-display font-bold text-slate-100 mt-1 tracking-tight">
                                            {card.value || 0}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
        
        {/* ===== MANAGEMENT QUICK LINKS ===== */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16"
        >
            <div className="flex items-center gap-3 mb-8">
                <TrendingUp size={24} className="text-purple-400" />
                <h2 className="text-2xl font-display font-bold text-slate-100 tracking-tight uppercase">
                    System <span className="text-purple-400">Overview</span>
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mgmtLinks.map((link, i) => {
                    const Icon = link.icon;
                    const cc = colorClasses[link.color];
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                        >
                            <Link to={link.path}>
                                <Card className="group relative overflow-hidden p-8 hover:border-slate-600 transition-all cursor-pointer">
                                    {/* Glass gradient hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="relative z-10">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 border ${cc.bg} ${cc.border} ${cc.text}`}>
                                            <Icon size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                                            {link.label}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium mt-2 mb-6">
                                            {link.desc}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-300 transition-all">
                                            <span>Go to page</span>
                                            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>

        {/* Footer info */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1 }}
           className="mt-20 border-t border-slate-900 pt-8 flex items-center justify-center gap-4 opacity-30 select-none"
        >
           <Activity size={16} />
           <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em]">BayManager v1.0.0</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
