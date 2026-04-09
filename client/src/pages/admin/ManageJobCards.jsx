import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, X, ClipboardCheck, Users, Clipboard, 
  Settings, User, CheckCircle, Clock, Save, ListTodo, Activity, Car, Wrench
} from 'lucide-react';
import { getAllJobCards, createJobCard, deleteJobCard } from '../../services/jobCardService.js';
import { getAllBookings } from '../../services/bookingService.js';
import { getAllStaff } from '../../services/staffService.js'; 
import { useSocket } from '../../context/SocketContext.jsx'; 
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const ManageJobCards = () => {
  // 1. Data and State - Preserving existing names
  const [jobCards, setJobCards] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]); 
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    bookingId: '', 
    mechanicId: '', 
    newTaskDescription: '', 
    tasks: [] 
  });

  // Design System: Status and Color Styles
  const statusStyles = {
    'Pending':    { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: Clock },
    'In Progress': { text: "text-blue-400",  bg: "bg-blue-400/10",  border: "border-blue-400/20",  icon: Wrench },
    'Completed':  { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: CheckCircle },
  };

  // 1. Fetch required data from backend - Preserving parallel fetch logic
  const loadData = async () => {
    try {
      const [jcResponse, bResponse, sResponse] = await Promise.all([
          getAllJobCards(),
          getAllBookings(),
          getAllStaff()
      ]);
      
      setJobCards(jcResponse);
      setBookings(bResponse);
      setStaff(sResponse);
      setLoading(false);
    } catch (err) {
      console.error("Data Load Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Real-time Synchronization - Preserving byte-for-byte identical logic
  useEffect(() => {
    if (!socket) return;

    socket.on('booking:created', (newBooking) => {
        setBookings((prev) => {
            if (prev.find(b => b._id === newBooking._id)) return prev;
            return [...prev, newBooking];
        });
    });

    socket.on('jobCard:created', (newJC) => {
        setJobCards((prev) => {
            if (prev.find(j => j._id === newJC._id)) return prev;
            return [newJC, ...prev];
        });
    });

    socket.on('jobCard:updated', (updatedJC) => {
        setJobCards((prev) => prev.map(j => j._id === updatedJC._id ? updatedJC : j));
    });

    socket.on('jobCard:deleted', (deletedId) => {
        setJobCards((prev) => prev.filter(j => j._id !== deletedId));
    });

    return () => {
        socket.off('booking:created');
        socket.off('jobCard:created');
        socket.off('jobCard:updated');
        socket.off('jobCard:deleted');
    };
  }, [socket]);

  // 3. Automated Task Generation - Preserving logic
  const handleBookingChange = (bId) => {
      let autoTask = [];
      const found = bookings.find(b => b._id === bId);
      if (found) {
          autoTask = [{ description: found.serviceType, status: 'Pending' }];
      }
      
      setFormData({
          ...formData,
          bookingId: bId,
          tasks: autoTask
      });
  };

  // 4. Task Management Logic - Preserving logic
  const addTask = () => {
      if (formData.newTaskDescription.trim()) {
          setFormData({
              ...formData,
              tasks: [...formData.tasks, { description: formData.newTaskDescription, status: 'Pending' }],
              newTaskDescription: ''
          });
      }
  };

  const removeTask = (index) => {
      const updatedTasks = formData.tasks.filter((_, i) => i !== index);
      setFormData({ ...formData, tasks: updatedTasks });
  };

  // 5. Save Logic - Preserving logic
  const handleSave = async (e) => {
    e.preventDefault();
    try {
        await createJobCard({
            bookingId: formData.bookingId,
            mechanicId: formData.mechanicId,
            tasks: formData.tasks
        });
        setIsModalOpen(false);
        setFormData({ bookingId: '', mechanicId: '', newTaskDescription: '', tasks: [] });
    } catch (err) {
        alert("Selection error: " + (err.response?.data?.message || "Check your data"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this job card?")) {
      try {
          await deleteJobCard(id);
      } catch (err) {
          alert("Delete failed");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Activity size={40} className="text-orange-400 animate-pulse mb-4 shadow-glow-amber-sm" />
        <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Job Cards...</p>
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
                Manage <span className="text-gradient">Job Cards</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-400 font-medium">Track and manage vehicle service job cards.</p>
                <div className="h-4 w-px bg-slate-800 hidden md:block" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${socket ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${socket ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    {socket ? 'Sync Active' : 'Sync Offline'}
                </div>
            </div>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} className="shadow-glow-blue px-8 py-6 h-auto uppercase tracking-widest font-black text-xs gap-3">
            <Plus size={20} />
            <span>Create Job Card</span>
          </Button>
        </motion.div>

        {/* ===== JOB CARDS GRID ===== */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="mt-12"
        >
          {jobCards.length === 0 ? (
            <Card className="text-center py-20 border-dashed border-slate-800">
               <Settings size={48} className="mx-auto text-slate-700 mb-6" />
               <h3 className="text-xl font-display font-bold text-slate-300 tracking-tight">No Job Cards Found</h3>
               <p className="text-slate-500 mt-2 font-medium">Create a job card to start the work.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobCards.map((jc, i) => {
                const status = statusStyles[jc.status] || statusStyles['Pending'];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={jc._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.8) }}
                  >
                    <Card className="group relative overflow-hidden flex flex-col h-full hover:border-slate-400/30 transition-all duration-300">
                      <div className="p-8 pb-4">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                <Clipboard size={12} className="text-slate-600" />
                                <span>ID {jc._id.slice(-6).toUpperCase()}</span>
                              </div>
                              <h3 className="font-display font-bold text-2xl text-slate-100 leading-tight tracking-tight uppercase">
                                {jc.bookingId?.customerId?.name || 'Unknown Client'}
                              </h3>
                           </div>
                           <div className={`px-4 py-1.5 rounded-full border ${status.bg} ${status.border} ${status.text} text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm`}>
                             <StatusIcon size={12} />
                             <span>{jc.status}</span>
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400">
                              <Car size={14} className="text-slate-600" />
                              <span>{jc.bookingId?.vehicleId?.model || 'Generic Unit'}</span>
                           </div>
                           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono font-black text-slate-300 tracking-tighter">
                               {jc.bookingId?.vehicleId?.registrationNumber || jc.bookingId?.vehicleId?.registrationNo || 'No ID'}
                           </div>
                        </div>
                      </div>

                      <div className="px-8 flex-1">
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
                           <div className="flex justify-between items-center mb-4">
                              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Tasks</h4>
                              <div className="flex items-center gap-1">
                                <ListTodo size={12} className="text-slate-700" />
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{jc.tasks?.length || 0} Tasks</span>
                              </div>
                           </div>
                           <ul className="space-y-3">
                              {jc.tasks?.slice(0, 3).map((t, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${t.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                                        <ClipboardCheck size={10} />
                                    </div>
                                    <span className={t.status === 'Completed' ? 'line-through opacity-30 italic' : ''}>{t.description}</span>
                                </li>
                              ))}
                              {jc.tasks?.length > 3 && (
                                <li className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-7 mt-2">
                                  + {jc.tasks.length - 3} More
                                </li>
                              )}
                           </ul>
                        </div>
                      </div>

                      <div className="p-8 pt-10 mt-auto border-t border-slate-900/50 flex justify-between items-center group/footer">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-display font-bold shadow-inner group-hover/footer:bg-blue-600/10 group-hover/footer:border-blue-500/20 group-hover/footer:text-blue-400 transition-all">
                               {jc.mechanicId?.name?.charAt(0) || <User size={18} />}
                            </div>
                            <div>
                               <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em] leading-none mb-1">Mechanic</p>
                               <p className="text-sm font-bold text-slate-200 leading-none">{jc.mechanicId?.name || 'Not Assigned'}</p>
                            </div>
                         </div>
                         <button onClick={() => handleDelete(jc._id)} className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                           <Trash2 size={20} />
                         </button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ===== CREATION MODAL ===== */}
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl"
                    >
                        <Card className="p-0 overflow-hidden border-slate-800 shadow-glow-blue-sm">
                            <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-slate-100 tracking-tight uppercase">Create Job Card</h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Define job card details.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-slate-100 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Select Booking</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 pointer-events-none">
                                                <Clipboard size={18} />
                                            </div>
                                            <select 
                                                value={formData.bookingId} 
                                                onChange={(e) => handleBookingChange(e.target.value)} 
                                                className="w-full pl-14 pr-12 py-4 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-200 font-bold focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 transition-all appearance-none cursor-pointer" 
                                                required
                                            >
                                                <option value="">Select a Booking...</option>
                                                {bookings.map(b => (
                                                    <option key={b._id} value={b._id}>
                                                        {b.customerId?.name || 'N/A'} - {b.vehicleId?.registrationNumber || 'No ID'} | {b.serviceType}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Assign Mechanic</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 pointer-events-none">
                                                <User size={18} />
                                            </div>
                                            <select 
                                                value={formData.mechanicId} 
                                                onChange={(e) => setFormData({...formData, mechanicId: e.target.value})} 
                                                className="w-full pl-14 pr-12 py-4 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-200 font-bold focus:outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-400/10 transition-all appearance-none cursor-pointer" 
                                                required
                                            >
                                                <option value="">Select a Mechanic...</option>
                                                {staff.map(member => (
                                                    <option key={member._id} value={member._id}>
                                                        {member.name} • Mechanic
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-inner">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Tasks</label>
                                    <div className="flex gap-3 mb-6">
                                        <div className="flex-1">
                                            <Input 
                                                placeholder="Add a task..." 
                                                value={formData.newTaskDescription}
                                                onChange={(e) => setFormData({...formData, newTaskDescription: e.target.value})}
                                            />
                                        </div>
                                        <Button type="button" onClick={addTask} size="sm" className="h-auto">
                                            Add Task
                                        </Button>
                                    </div>
                                    
                                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        <AnimatePresence initial={false}>
                                        {formData.tasks?.map((t, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="bg-slate-950/50 p-4 border border-slate-800 rounded-xl flex justify-between items-center group/task"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-mono text-slate-600">0{i+1}</span>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide group-hover/task:text-slate-200 transition-colors">{t.description}</span>
                                                </div>
                                                <button type="button" onClick={() => removeTask(i)} className="text-slate-600 hover:text-rose-400 transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </motion.div>
                                        ))}
                                        </AnimatePresence>
                                        {formData.tasks?.length === 0 && (
                                            <p className="text-[10px] text-center text-slate-700 py-4 uppercase font-black">No tasks defined</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" className="flex-2 gap-3 shadow-glow-blue uppercase h-auto py-6 font-black tracking-widest text-xs">
                                        <Save size={20} />
                                        <span>Save Job Card</span>
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        
      </div>
    </div>
  );
};

export default ManageJobCards;
;
