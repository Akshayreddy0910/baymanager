import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Trash2, Calendar, User, Car, Clipboard, Clock, CheckCircle, AlertCircle, MoreVertical } from 'lucide-react';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../services/bookingService.js';
import { useSocket } from '../../context/SocketContext.jsx';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

const ManageBookings = () => {
  // 1. State and Data - Preserving existing names
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  // Status mapping for consistent styling across the platform
  const statusStyles = {
    'Pending':    { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: Clock },
    'Confirmed':  { text: "text-blue-400",  bg: "bg-blue-400/10",  border: "border-blue-400/20",  icon: CheckCircle },
    'In Progress': { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: RefreshCw },
    'Completed':  { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: CheckCircle },
  };

  // 1. Fetch data on load - Preserving logic
  const loadData = async () => {
    try {
      const data = await getAllBookings();
      setBookings(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Real-time Listeners - Preserving byte-for-byte logic
  useEffect(() => {
    if (!socket) return;
    
    socket.on('booking:updated', () => {
        loadData();
    });
    socket.on('jobCard:updated', () => {
        loadData();
    });
    socket.on('invoice:created', () => {
        loadData();
    });
    
    return () => {
      socket.off('booking:updated');
      socket.off('jobCard:updated');
      socket.off('invoice:created');
    };
  }, [socket]);

  // 2. Handle simple status updates - Preserving logic
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this booking?")) {
      await deleteBooking(id);
      loadData();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Calendar size={40} className="text-blue-400 animate-pulse mb-4 shadow-glow-blue-sm" />
        <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Bookings...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ===== HEADER ===== */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-100 uppercase tracking-tighter">
                Manage <span className="text-gradient">Bookings</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Review and manage customer service appointments.</p>
          </div>
          <Button variant="secondary" onClick={loadData} className="gap-3 px-6 border-slate-800">
            <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-black uppercase tracking-widest">Refresh</span>
          </Button>
        </motion.div>

        {/* ===== BOOKINGS TABLE ===== */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="mt-12"
        >
          {bookings.length === 0 ? (
            <Card className="text-center py-20 border-dashed border-slate-800">
               <Calendar size={48} className="mx-auto text-slate-700 mb-6" />
               <h3 className="text-xl font-display font-bold text-slate-300 tracking-tight">No Bookings Found</h3>
               <p className="text-slate-500 mt-2 font-medium">No active bookings detected in system.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden p-0 border-slate-900 shadow-glow-blue-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 border-b border-slate-800/50">
                    <tr>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Customer</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Vehicle</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Service Type</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Booking Date</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {bookings.map((b, i) => {
                      const status = statusStyles[b.status] || { text: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20", icon: AlertCircle };
                      const StatusIcon = status.icon;

                      return (
                        <motion.tr 
                          key={b._id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.8) }}
                          className="hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="px-8 py-6 font-bold text-slate-200">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                                      <User size={14} />
                                  </div>
                                  <span>{b.customerId?.name || 'Unknown Client'}</span>
                              </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <Car size={14} className="text-slate-600" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{b.vehicleId?.model}</p>
                                <p className="font-mono text-[10px] text-slate-400 mt-0.5">{b.vehicleId?.registrationNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 text-slate-300">
                                <Clipboard size={14} className="text-slate-600" />
                                <span className="text-sm font-medium">{b.serviceType}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Clock size={14} className="text-slate-600" />
                                <span className="text-xs font-mono">{new Date(b.bookingDate).toLocaleDateString()}</span>
                              </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.bg} ${status.border} ${status.text}`}>
                                <StatusIcon size={12} />
                                <select 
                                  value={b.status} 
                                  onChange={(e) => handleStatusUpdate(b._id, e.target.value)}
                                  className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none pr-4"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                    <MoreVertical size={10} />
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button onClick={() => handleDelete(b._id)} className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ManageBookings;
