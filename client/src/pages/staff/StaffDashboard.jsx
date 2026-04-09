import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle2, Activity, Wrench, Star, Bell } from 'lucide-react';
import { motion } from "framer-motion";
import { getMyJobCards } from '../../services/jobCardService.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

const StaffDashboard = () => {
  const [activeJobs, setActiveJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]); // Added to track full history for stats
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tailwind purge safety: lookup object for dynamic colors
  const colorClasses = {
    cyan:    { bg: "bg-cyan-400/10",    border: "border-cyan-400/20",    text: "text-cyan-400" },
    amber:   { bg: "bg-amber-400/10",   border: "border-amber-400/20",   text: "text-amber-400" },
    emerald: { bg: "bg-emerald-400/10", border: "border-emerald-400/20", text: "text-emerald-400" },
    blue:    { bg: "bg-blue-400/10",    border: "border-blue-400/20",    text: "text-blue-400" },
    rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/20",    text: "text-rose-400" },
  };

  // 1. Fetch mechanic specific jobs
  const loadJobs = async () => {
    try {
      const jobs = await getMyJobCards();
      setAllJobs(jobs); // Keep full list for stats
      
      // Filter out completed jobs
      const active = jobs.filter(job => job.status !== 'Completed');
      setActiveJobs(active);

      // Create notifications based on active jobs (e.g. recently updated or pending ones)
      setNotifications(active.map(job => ({
          id: job._id,
          title: `New Assignment: ${job.bookingId?.vehicleId?.model || 'Vehicle'}`,
          message: `Job Card #${job._id.slice(-6).toUpperCase()} requires your attention.`,
          time: new Date(job.createdAt).toLocaleString(),
          isNew: false
      })));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Compute stats via for loops as per design requirements
  const [statCards, setStatCards] = useState([]);

  useEffect(() => {
    let totalJobs = allJobs.length;
    let inProgressCount = 0;
    let completedCount = 0;

    for (let i = 0; i < allJobs.length; i++) {
        if (allJobs[i].status === 'In Progress') {
            inProgressCount++;
        } else if (allJobs[i].status === 'Completed') {
            completedCount++;
        }
    }

    const cards = [
        { label: "Total Jobs",     value: totalJobs,     icon: Briefcase,    color: "cyan",    delay: 0.1 },
        { label: "In Progress",    value: inProgressCount, icon: Activity,   color: "amber",   delay: 0.2 },
        { label: "Completed",      value: completedCount, icon: CheckCircle2, color: "emerald", delay: 0.3 }
    ];
    setStatCards(cards);
  }, [allJobs]);

  // 2. Real-time Notification listener
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewJobCard = (newJC) => {
        // Only notify if the new job card is assigned to this exact mechanic
        const mId = newJC.mechanicId?._id || newJC.mechanicId?.id || newJC.mechanicId;
        const myId = user?._id || user?.id;
        
        if (String(mId) === String(myId)) {
            setActiveJobs(prev => {
                if (prev.find(j => j._id === newJC._id)) return prev;
                return [newJC, ...prev];
            });

            setAllJobs(prev => {
                if (prev.find(j => j._id === newJC._id)) return prev;
                return [newJC, ...prev];
            });

            setNotifications(prev => [
                {
                    id: newJC._id,
                    title: `🔴 LIVE ASSIGNMENT: ${newJC.bookingId?.vehicleId?.model || 'Vehicle'}`,
                    message: `Admin just assigned Job Card #${newJC._id.slice(-6).toUpperCase()} to you.`,
                    time: new Date().toLocaleString(),
                    isNew: true
                },
                ...prev
            ]);
        }
    };

    socket.on('jobCard:created', handleNewJobCard);

    return () => {
        socket.off('jobCard:created', handleNewJobCard);
    };
  }, [socket, user]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4 shadow-glow-cyan-sm"></div>
            <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Portal...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ===== HEADER ===== */}
        {/* Wrapped in motion.div for entry animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-display font-bold text-slate-100">
            Welcome, <span className="text-gradient">{user?.name || "Mechanic"}</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Here's an overview of your assigned jobs and performance.
          </p>
          <div className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest mt-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${socket ? 'bg-cyan-500 animate-pulse shadow-glow-cyan' : 'bg-rose-500'}`}></div>
              {socket ? 'Live Dispatch Connected' : 'Sync Offline'}
          </div>
        </motion.div>
        
        {/* ===== STAT CARDS (3 cards) ===== */}
        {/* Stat cards are staggered using the delay computed in the for loop logic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            const colors = colorClasses[card.color];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: card.delay }}
              >
                <Card className="hover:shadow-glow-cyan-sm hover:border-cyan-400/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                      <Icon size={28} className={colors.text} />
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
        
        {/* ===== QUICK ACTIONS SECTION ===== */}
        {/* Staggered section entrance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-display font-bold text-slate-100 mb-6 flex items-center gap-3">
             <Activity className="text-cyan-400" size={24} />
             Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Action card 1: View My Job Cards */}
            <Card 
              className="hover:shadow-glow-cyan-sm hover:border-cyan-400/50 
                         hover:-translate-y-1 transition-all duration-300 
                         cursor-pointer group relative overflow-hidden"
            >
              <div onClick={() => navigate("/staff/jobcards")}>
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border 
                                border-cyan-400/20 flex items-center justify-center mb-4">
                  <Briefcase size={24} className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-display font-semibold text-slate-100">
                  My Job Cards
                </h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  View and update status on your assigned jobs.
                </p>
                <div className="flex items-center gap-2 text-cyan-400 mt-4 
                                group-hover:translate-x-1 transition-transform font-bold text-sm">
                  <span>View all assignments</span>
                  <span>→</span>
                </div>
              </div>
            </Card>
            
            {/* Action card 2: My Ratings (from feedback system) */}
            <Card 
              className="hover:shadow-glow-cyan-sm hover:border-amber-400/50 
                         hover:-translate-y-1 transition-all duration-300 
                         cursor-pointer group relative overflow-hidden"
            >
              <div onClick={() => navigate("/staff/my-ratings")}>
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border 
                                border-amber-400/20 flex items-center justify-center mb-4">
                  <Star size={24} className="text-amber-400" />
                </div>
                <h3 className="text-xl font-display font-semibold text-slate-100">
                  My Ratings
                </h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  See customer feedback and your average rating.
                </p>
                <div className="flex items-center gap-2 text-amber-400 mt-4 
                                group-hover:translate-x-1 transition-transform font-bold text-sm">
                  <span>View overall ratings</span>
                  <span>→</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* ===== NOTIFICATIONS SECTION ===== */}
        {/* Repurposing the notifications list with the new theme */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.7 }}
           className="mt-12"
        >
          <h2 className="text-2xl font-display font-bold text-slate-100 mb-6 flex items-center gap-3">
             <Bell className="text-cyan-400" size={24} />
             Notifications
          </h2>
          {notifications.length === 0 ? (
             <Card className="text-center py-16">
               <CheckCircle2 size={48} className="mx-auto text-slate-600 mb-4" />
               <h3 className="text-xl font-display font-semibold text-slate-300">
                 All Caught Up
               </h3>
               <p className="text-slate-500 mt-2">No pending job notifications at this time.</p>
             </Card>
          ) : (
             <div className="space-y-4">
               {notifications.map((note, idx) => (
                 <motion.div
                   key={note.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.3, delay: 0.8 + (idx * 0.05) }}
                 >
                   <Card className={`group ${note.isNew ? 'border-cyan-500/30 shadow-glow-cyan-sm' : ''}`}>
                      <div className="flex justify-between items-start">
                         <div className="flex gap-4">
                           <div className={`mt-1 w-2 h-2 rounded-full ${note.isNew ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
                           <div>
                             <h4 className="font-display font-bold text-slate-200">{note.title}</h4>
                             <p className="text-slate-400 text-sm mt-1">{note.message}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 uppercase whitespace-nowrap">
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

export default StaffDashboard;
