import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Calendar, Wrench, Car, Clock, Plus, ChevronRight, AlertCircle } from 'lucide-react';
import { getMyBookings } from '../../services/bookingService.js';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Design System: Status badge lookup
  const statusStyles = {
    "Pending":     { bg: "bg-amber-400/10",   text: "text-amber-400",   border: "border-amber-400/20" },
    "Confirmed":   { bg: "bg-blue-400/10",    text: "text-blue-400",    border: "border-blue-400/20" },
    "In Progress": { bg: "bg-blue-400/10",    text: "text-blue-400",    border: "border-blue-400/20" },
    "Completed":   { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
    "Paid":        { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
    "Cancelled":   { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20" },
  };

  const getBadgeClasses = (status) => {
    const s = statusStyles[status] || statusStyles["Pending"];
    return `rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text} ${s.border} border shadow-sm`;
  };

  // 1. Fetch bookings belonging to the current user - Preserving logic
  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch History Error:", err);
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Wrench size={48} className="text-cyan-400 animate-spin shadow-glow-cyan-sm" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-100 uppercase tracking-tighter">
              Service <span className="text-gradient">History</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">
              Track your past and upcoming maintenance sessions.
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => navigate("/dashboard/book")}
            className="shadow-glow-cyan-sm uppercase font-black tracking-widest text-xs"
          >
            <Plus size={18} className="mr-2" />
            New Booking
          </Button>
        </motion.div>

        {/* ===== EMPTY STATE ===== */}
        {!loading && bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <Card className="text-center py-20 border-dashed border-slate-800">
               <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar size={32} className="text-slate-600" />
               </div>
               <h3 className="text-xl font-display font-bold text-slate-300">No history found</h3>
               <p className="text-slate-500 mt-2 mb-8 italic">You haven't booked any services yet.</p>
               <Button variant="secondary" onClick={() => navigate("/dashboard/book")}>
                  Schedule First Service
               </Button>
            </Card>
          </motion.div>
        )}

        {/* ===== BOOKINGS LIST ===== */}
        {!loading && bookings.length > 0 && (
          <div className="mt-12 space-y-6">
            {bookings.map((b, index) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="hover:shadow-glow-cyan-sm hover:border-cyan-400/30 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                         <Wrench size={24} className="text-cyan-400" />
                      </div>
                      <div>
                         <h3 className="text-xl font-display font-bold text-slate-100 tracking-tight mb-1">
                           {b.serviceType}
                         </h3>
                         <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Car size={14} className="text-slate-600" />
                                <span className="font-bold">{b.vehicleId?.model || 'Vehicle'}</span>
                            </div>
                            <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono text-[10px] font-black tracking-widest border border-slate-800">
                                {b.vehicleId?.registrationNumber || 'N/A'}
                            </span>
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-3">
                            <Clock size={12} />
                            {new Date(b.bookingDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
                         </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={getBadgeClasses(b.status)}>
                         {b.status}
                      </span>
                      <ChevronRight size={20} className="text-slate-800" />
                    </div>

                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Footer info */}
        <div className="mt-12 text-center">
            <p className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.2em]">
                BayManager Service Tracking Interface v2.0
            </p>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
