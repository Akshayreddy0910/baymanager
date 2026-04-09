import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  Calendar, CreditCard, ChevronRight, Bell, Clock, FileText, 
  CheckCircle, Wrench, Plus, List, ArrowRight, Activity 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyBookings } from '../../services/bookingService.js';
import { getMyInvoices } from '../../services/invoiceService.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  // Preserve state shape, added activeServices for the new design
  const [stats, setStats] = useState({ bookings: 0, activeServices: 0, pendingPayments: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tailwind purge safety: lookup object for dynamic colors
  const colorClasses = {
    cyan:    { bg: "bg-cyan-400/10",    border: "border-cyan-400/20",    text: "text-cyan-400" },
    amber:   { bg: "bg-amber-400/10",   border: "border-amber-400/20",   text: "text-amber-400" },
    emerald: { bg: "bg-emerald-400/10", border: "border-emerald-400/20", text: "text-emerald-400" },
    blue:    { bg: "bg-blue-400/10",    border: "border-blue-400/20",    text: "text-blue-400" },
    rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/20",    text: "text-rose-400" },
    purple:  { bg: "bg-purple-400/10",  border: "border-purple-400/20",  text: "text-purple-400" },
  };

  // 1. Fetch user specific data - Preserving logic and adding activeCount computation
  const loadData = async () => {
    try {
      const myBookings = await getMyBookings();
      const myInvoices = await getMyInvoices();
      
      let pendingCount = 0;
      let activeCount = 0;
      let initialNotes = [];

      // Compute invoice notifications and counts
      for (let j = 0; j < myInvoices.length; j++) {
          if (myInvoices[j].paymentStatus === 'Pending') {
              pendingCount++;
              initialNotes.push({
                  id: myInvoices[j]._id,
                  type: 'invoice',
                  title: 'New Service Invoice Generated',
                  message: `Your service is complete. A bill of $${myInvoices[j].totalAmount} is pending.`,
                  time: new Date(myInvoices[j].createdAt).toLocaleString(),
                  isNew: false
              });
          }
      }

      // Compute booking notifications and active count
      for (let i = 0; i < myBookings.length; i++) {
          const status = myBookings[i].status;
          if (status === 'Pending' || status === 'Confirmed' || status === 'In Progress') {
              activeCount++;
          }
          if (status !== 'Completed') {
              initialNotes.push({
                  id: myBookings[i]._id,
                  type: 'booking',
                  title: `Booking Update: ${myBookings[i].vehicleId?.model || 'Vehicle'}`,
                  message: `Your service status is currently: ${status}.`,
                  time: new Date(myBookings[i].updatedAt || myBookings[i].createdAt).toLocaleString(),
                  isNew: false
              });
          }
      }

      setStats({ 
        bookings: myBookings.length, 
        activeServices: activeCount,
        pendingPayments: pendingCount 
      });

      // Sort newest notifications first
      initialNotes.sort((a,b) => new Date(b.time) - new Date(a.time));
      setNotifications(initialNotes);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // 2. Real-time Notification listener - Kept byte-for-byte logic
  useEffect(() => {
    if (!socket || !user) return;

    const handleBookingUpdated = (updatedBooking) => {
        if (updatedBooking.customerId?._id === user.id || updatedBooking.customerId === user.id) {
            setNotifications(prev => [
                {
                    id: `bu-${Date.now()}`,
                    type: 'booking',
                    title: `🔴 LIVE UPDATE: Booking Status change`,
                    message: `Admin updated your booking status to: ${updatedBooking.status}.`,
                    time: new Date().toLocaleString(),
                    isNew: true
                },
                ...prev
            ]);
        }
    };

    const handleJobCardUpdated = (updatedJC) => {
        const custId = updatedJC.bookingId?.customerId?._id || updatedJC.bookingId?.customerId;
        if (custId === user.id) {
            if (updatedJC.status === 'Completed') {
                setNotifications(prev => [
                    {
                        id: `jc-${Date.now()}`,
                        type: 'jobcard',
                        title: `🔴 LIVE UPDATE: Service Completed!`,
                        message: `The mechanic has finished all work on your vehicle.`,
                        time: new Date().toLocaleString(),
                        isNew: true
                    },
                    ...prev
                ]);
            }
        }
    };

    const handleInvoiceCreated = (newInv) => {
        const custId = newInv.jobCardId?.bookingId?.customerId?._id || newInv.jobCardId?.bookingId?.customerId;
        if (custId === user.id) {
            setStats(prev => ({ ...prev, pendingPayments: prev.pendingPayments + 1 }));
            setNotifications(prev => [
                {
                    id: `inv-${Date.now()}`,
                    type: 'invoice',
                    title: `🔴 LIVE UPDATE: New Invoice Formed`,
                    message: `A new bill for $${newInv.totalAmount} has just been generated. Please check billing.`,
                    time: new Date().toLocaleString(),
                    isNew: true
                },
                ...prev
            ]);
        }
    };

    socket.on('booking:updated', (updatedBooking) => {
        handleBookingUpdated(updatedBooking);
        loadData(); 
    });
    socket.on('jobCard:updated', (updatedJC) => {
        handleJobCardUpdated(updatedJC);
        loadData();
    });
    socket.on('invoice:created', (newInv) => {
        handleInvoiceCreated(newInv);
        loadData();
    });

    return () => {
        socket.off('booking:updated');
        socket.off('jobCard:updated');
        socket.off('invoice:created');
    };
  }, [socket, user]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
            <Wrench size={40} className="text-cyan-400 animate-spin mb-4" />
            <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Dashboard...</p>
        </div>
    </div>
  );

  // Compute stat cards for the redesigned layout
  const statCards = [
    { label: "Total Bookings", value: stats.bookings, icon: Calendar, color: "cyan", delay: 0.1 },
    { label: "Active Services", value: stats.activeServices, icon: Activity, color: "blue", delay: 0.2 },
    { label: "Unpaid Invoices", value: stats.pendingPayments, icon: CreditCard, color: "amber", delay: 0.3 }
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
            Welcome back, <span className="text-gradient">{user.name || "Customer"}</span>!
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Here's an overview of your garage service activities.
          </p>
          <div className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest mt-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${socket ? 'bg-cyan-500 animate-pulse shadow-glow-cyan' : 'bg-rose-500'}`}></div>
              {socket ? 'Live Sync Active' : 'Sync Offline'}
          </div>
        </motion.div>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
                <Card className="hover:shadow-glow-cyan-sm hover:border-cyan-400/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${cc.bg} ${cc.border} border flex items-center justify-center`}>
                      <Icon size={28} className={cc.text} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{card.label}</p>
                      <p className="text-4xl font-display font-bold text-slate-100 mt-1 uppercase tracking-tighter">
                        {card.value}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* ===== QUICK ACTIONS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-display font-bold text-slate-100 mb-6 flex items-center gap-3">
             <Plus className="text-cyan-400" size={24} />
             Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Action 1: Book Service */}
            <Card className="hover:shadow-glow-cyan-sm hover:border-cyan-400/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div onClick={() => navigate("/dashboard/book")}>
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-4">
                  <Wrench size={24} className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-display font-semibold text-slate-100">Book Service</h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">Schedule a new maintenance or repair session.</p>
                <div className="flex items-center gap-2 text-cyan-400 mt-4 group-hover:translate-x-1 transition-transform text-sm font-bold">
                  Book now <ArrowRight size={16} />
                </div>
              </div>
            </Card>

            {/* Action 2: My Bookings */}
            <Card className="hover:shadow-glow-cyan-sm hover:border-blue-400/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div onClick={() => navigate("/dashboard/bookings")}>
                <div className="w-12 h-12 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center mb-4">
                  <List size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-display font-semibold text-slate-100">My Bookings</h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">Track the status of your upcoming services.</p>
                <div className="flex items-center gap-2 text-blue-400 mt-4 group-hover:translate-x-1 transition-transform text-sm font-bold">
                  View all <ArrowRight size={16} />
                </div>
              </div>
            </Card>

            {/* Action 3: My Invoices */}
            <Card className="hover:shadow-glow-cyan-sm hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div onClick={() => navigate("/dashboard/invoices")}>
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4">
                  <FileText size={24} className="text-amber-400" />
                </div>
                <h3 className="text-xl font-display font-semibold text-slate-100">My Invoices</h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">View and pay for your completed services.</p>
                <div className="flex items-center gap-2 text-amber-400 mt-4 group-hover:translate-x-1 transition-transform text-sm font-bold">
                  Check billing <ArrowRight size={16} />
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* ===== NOTIFICATIONS SECTION ===== */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.7 }}
           className="mt-12"
        >
          <h2 className="text-2xl font-display font-bold text-slate-100 mb-6 flex items-center gap-3">
             <Bell className="text-cyan-400" size={24} />
             Live Job Alerts
          </h2>
          {notifications.length === 0 ? (
             <Card className="text-center py-16">
               <CheckCircle size={48} className="mx-auto text-slate-600 mb-4" />
               <h3 className="text-xl font-display font-semibold text-slate-300">No recent updates</h3>
               <p className="text-slate-500 mt-2">Everything is running smoothly on the garage floor.</p>
             </Card>
          ) : (
             <div className="space-y-4">
               {notifications.map((note, idx) => (
                 <motion.div
                   key={`${note.id}-${idx}`}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.3, delay: 0.8 + (idx * 0.05) }}
                 >
                   <Card className={`group ${note.isNew ? 'border-cyan-500/30' : ''}`}>
                      <div className="flex justify-between items-start">
                         <div className="flex gap-4">
                           <div className={`mt-1 flex-shrink-0 ${note.isNew ? 'text-cyan-400 animate-pulse shadow-glow-cyan' : 'text-slate-600'}`}>
                              {note.type === 'invoice' ? <FileText size={20} /> : note.type === 'jobcard' ? <CheckCircle size={20} /> : <Calendar size={20}/>}
                           </div>
                           <div>
                             <h4 className={`font-display font-bold ${note.isNew ? 'text-slate-100' : 'text-slate-300'}`}>{note.title}</h4>
                             <p className="text-slate-500 text-sm mt-1">{note.message}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-600 uppercase whitespace-nowrap">
                            <Clock size={12} />
                            {note.time}
                         </div>
                      </div>
                   </Card>
                 </motion.div>
               ))}
             </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default CustomerDashboard;
