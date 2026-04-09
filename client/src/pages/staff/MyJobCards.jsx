import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Briefcase, Clock, CheckCircle2, Circle, AlertCircle, Wrench, ChevronRight } from 'lucide-react';
import { getMyJobCards, updateJobCardStatus } from '../../services/jobCardService.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

const MyJobCards = () => {
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added for error state handling

  const socket = useSocket();
  const { user } = useAuth();

  // Tailwind purge safety: style lookup object for status badges
  const statusStyles = {
    "Open":        { bg: "bg-blue-400/10",    text: "text-blue-400",    border: "border-blue-400/20" },
    "In Progress": { bg: "bg-amber-400/10",   text: "text-amber-400",   border: "border-amber-400/20" },
    "Completed":   { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
    "Pending":     { bg: "bg-slate-400/10",   text: "text-slate-400",   border: "border-slate-400/20" },
  };

  // Helper to get badge classes for a given status
  const getBadgeClasses = (status) => {
    const s = statusStyles[status] || statusStyles["Pending"];
    return `rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text} ${s.border} border`;
  };

  // 1. Load assignments
  const loadData = async () => {
    try {
      const data = await getMyJobCards();
      setJobCards(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch assigned job cards.");
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 1.5 Real-time Synchronization
  useEffect(() => {
    if (!socket || !user) return;
    const myId = String(user?._id || user?.id);

    const handleCreate = (newJC) => {
        const mId = String(newJC.mechanicId?._id || newJC.mechanicId?.id || newJC.mechanicId);
        if (mId === myId) {
            setJobCards(prev => {
                if (prev.find(j => j._id === newJC._id)) return prev;
                return [newJC, ...prev];
            });
        }
    };

    const handleUpdate = (updatedJC) => {
        const mId = String(updatedJC.mechanicId?._id || updatedJC.mechanicId?.id || updatedJC.mechanicId);
        if (mId === myId) {
            setJobCards(prev => prev.map(j => j._id === updatedJC._id ? updatedJC : j));
        }
    };

    const handleDelete = (deletedId) => {
        setJobCards(prev => prev.filter(j => j._id !== deletedId));
    };

    socket.on('jobCard:created', handleCreate);
    socket.on('jobCard:updated', handleUpdate);
    socket.on('jobCard:deleted', handleDelete);

    return () => {
        socket.off('jobCard:created', handleCreate);
        socket.off('jobCard:updated', handleUpdate);
        socket.off('jobCard:deleted', handleDelete);
    };
  }, [socket, user]);

  // 2. Inline task status update logic - Preserving byte-for-byte logic
  const toggleTask = async (jcId, taskIdx) => {
    // Find the specific job card in state using a for loop as per design rules
    let targetJC = null;
    for (let i = 0; i < jobCards.length; i++) {
        if (jobCards[i]._id === jcId) {
            targetJC = jobCards[i];
            break;
        }
    }

    if (!targetJC) return;

    // Clone and update the specific task status
    const updatedTasks = [...targetJC.tasks];
    updatedTasks[taskIdx].status = updatedTasks[taskIdx].status === 'Completed' ? 'Pending' : 'Completed';

    // 3. Check if all tasks are done to auto-update JC status via for loop
    let allDone = true;
    for (let j = 0; j < updatedTasks.length; j++) {
        if (updatedTasks[j].status !== 'Completed') {
            allDone = false;
        }
    }

    const newJCStatus = allDone ? 'Completed' : 'In Progress';

    try {
        await updateJobCardStatus(jcId, { tasks: updatedTasks, status: newJCStatus });
        loadData();
    } catch (err) {
        alert("Status update failed");
    }
  };

  // Wrapper for manual status change if needed - uses original updateJobCardStatus handler logic
  const handleManualStatusUpdate = async (jcId, newStatus) => {
      try {
          await updateJobCardStatus(jcId, { status: newStatus });
          loadData();
      } catch (err) {
          alert("Manual status update failed");
      }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Wrench size={48} className="text-cyan-400 animate-spin shadow-glow-cyan-sm" />
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
        >
          <h1 className="text-4xl font-display font-bold text-slate-100 uppercase tracking-tighter">
            My <span className="text-gradient">Job Cards</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            View and update the status of jobs assigned to you.
          </p>
        </motion.div>
        
        {/* ===== ERROR STATE ===== */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <Card className="border-rose-500/30 bg-rose-500/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-rose-400" size={24} />
                <p className="text-rose-400 font-medium">{error}</p>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* ===== EMPTY STATE ===== */}
        {!loading && !error && jobCards.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="text-center py-20 border-dashed border-slate-800">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-300">
                No job cards assigned
              </h3>
              <p className="text-slate-500 mt-2">
                You don't have any jobs assigned to you yet. Check back later.
              </p>
            </Card>
          </motion.div>
        )}
        
        {/* ===== JOB CARDS LIST ===== */}
        {!loading && !error && jobCards.length > 0 && (
          <div className="mt-12 space-y-6">
            {jobCards.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="hover:shadow-glow-cyan-sm hover:border-cyan-400/30 hover:-translate-y-0.5 transition-all duration-300">
                  
                  {/* Top row: Service + Status */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                          <Wrench size={20} className="text-cyan-400" />
                        </div>
                        <div>
                           <h3 className="text-xl font-display font-bold text-slate-100 tracking-tight">
                             {job.bookingId?.serviceType || "Service"}
                           </h3>
                           <p className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider">
                             Reference ID: #{job._id?.slice(-8).toUpperCase()}
                           </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                           <Briefcase size={14} className="text-slate-600" />
                           <span className="font-bold">{job.bookingId?.vehicleId?.model || 'Vehicle'}</span>
                        </div>
                        <div className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] font-bold text-slate-500">
                           {job.bookingId?.vehicleId?.registrationNumber || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                        <span className={getBadgeClasses(job.status)}>
                          {job.status}
                        </span>
                        {/* Styled manual status selector */}
                        <select
                          value={job.status}
                          onChange={(e) => handleManualStatusUpdate(job._id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all cursor-pointer hover:bg-slate-800"
                        >
                          <option value="Open">Set Open</option>
                          <option value="In Progress">Set In Progress</option>
                          <option value="Completed">Set Completed</option>
                        </select>
                    </div>
                  </div>
                  
                  {/* Tasks list (conditionally shown) */}
                  {job.tasks && job.tasks.length > 0 && (
                    <div className="mb-6 pt-6 border-t border-slate-800/50">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <span className="w-4 h-px bg-slate-800" />
                         Checklist Tasks
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {job.tasks.map((task, ti) => (
                          <motion.button 
                            key={ti} 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleTask(job._id, ti)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${task.status === 'Completed' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/30'}`}
                          >
                            <div className="flex items-center gap-3">
                                {task.status === 'Completed' ? (
                                    <CheckCircle2 size={18} className="text-emerald-400 shadow-glow-cyan-sm rounded-full" />
                                ) : (
                                    <Circle size={18} className="text-slate-600 group-hover:text-cyan-400" />
                                )}
                                <span className={`text-sm font-medium ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                  {task.description || task}
                                </span>
                            </div>
                            <ChevronRight size={14} className={`text-slate-700 ${task.status === 'Completed' ? 'opacity-0' : 'group-hover:translate-x-1 transition-transform'}`} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Metadata action row */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                    <div className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                      <Clock size={12} />
                      Last sync: {new Date(job.updatedAt || job.createdAt).toLocaleString()}
                    </div>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">
                       BayManager Mechanic Flow System v2.0
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default MyJobCards;
