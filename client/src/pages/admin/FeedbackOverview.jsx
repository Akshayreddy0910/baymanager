import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
    MessageSquare, Star, Calendar, User, Quote, Sparkles, 
    Smile, ArrowRight, TrendingUp, Award, ThumbsUp, Wrench, Search, Filter 
} from 'lucide-react';
import { getFeedbackStats, getAllFeedback } from '../../services/feedbackService.js';
import StarRating from '../../components/ui/StarRating.jsx';
import Card from "../../components/ui/Card.jsx";

const FeedbackOverview = () => {
  // 1. Data and UI State - Preserving existing names from the functional version
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 2. Load all feedback data and dashboard stats in parallel
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, allFeedback] = await Promise.all([
          getFeedbackStats(),
          getAllFeedback()
        ]);
        setStats(statsData);
        setFeedbacks(allFeedback);
      } catch (err) {
        setError(err.response?.data?.message || "Critical error loading feedback metrics.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Show a premium loading state
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <MessageSquare size={40} className="text-purple-400 animate-spin mb-4 shadow-glow-purple-sm" />
        <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Aggregating Sentiments...</p>
    </div>
  );

  // Handle Error State
  if (error) return (
    <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <Card className="max-w-md border-rose-500/30 text-center p-12">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <Shield size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-100 uppercase tracking-tight">Access Protocol Breach</h2>
            <p className="text-slate-500 mt-4 font-medium">{error}</p>
        </Card>
    </div>
  );

  // Handle Empty State
  if (!stats || stats.overall.totalFeedbacks === 0) return (
    <div className="min-h-screen bg-slate-950 p-12">
        <h1 className="text-4xl font-display font-bold text-slate-100 uppercase tracking-tighter mb-12">
            Customer <span className="text-gradient">Satisfaction</span>
        </h1>
        <Card className="text-center py-24 border-dashed border-slate-800">
          <MessageSquare size={64} className="mx-auto text-slate-700 mb-6" />
          <h2 className="text-3xl font-display font-bold text-slate-300">Feedback Matrix Empty</h2>
          <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium">
            Once customers start reviewing their services, their ratings, comments, and leaderboard rankings will materialize here.
          </p>
        </Card>
    </div>
  );

  // Rank coloring helper
  const getRankStyle = (index) => {
    if (index === 0) return { border: "border-amber-400/30", bg: "bg-amber-400/10", text: "text-amber-400", shadow: "shadow-glow-amber-sm" };
    if (index === 1) return { border: "border-slate-300/30", bg: "bg-slate-300/10", text: "text-slate-300", shadow: "shadow-glow-slate-sm" };
    if (index === 2) return { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-500", shadow: "shadow-glow-orange-sm" };
    return { border: "border-slate-800", bg: "bg-slate-900/40", text: "text-slate-500", shadow: "" };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ===== HEADER ===== */}
        <motion.div
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
           className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-100 uppercase tracking-tighter">
                Customer <span className="text-gradient">Satisfaction</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-400 font-medium">Verified service reviews and personnel benchmarks.</p>
                <div className="h-4 w-px bg-slate-800 hidden md:block" />
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Real-time Sentiment Stream</span>
                </div>
            </div>
          </div>
        </motion.div>

        {/* ===== PERFORMANCE SUMMARY ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {[
                { label: "Garage Performance", value: stats.overall.avgGarageRating, icon: Star, color: "amber" },
                { label: "Workshop Quality", value: stats.overall.avgMechanicRating, icon: Award, color: "cyan" },
                { label: "Review Aggregate", value: stats.overall.totalFeedbacks, icon: MessageSquare, color: "blue" },
                { label: "Retention Rate", value: stats.overall.recommendPercentage + "%", icon: ThumbsUp, color: "emerald" }
            ].map((cfg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                    <Card className={`group hover:border-${cfg.color}-400/30 transition-all duration-300 bg-slate-900/40`}>
                        <div className={`w-10 h-10 rounded-xl bg-${cfg.color}-400/10 flex items-center justify-center text-${cfg.color}-400 mb-6`}>
                            <cfg.icon size={20} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{cfg.label}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-display font-bold text-slate-100 tracking-tighter">
                                {typeof cfg.value === 'number' ? cfg.value.toFixed(1) : cfg.value}
                            </span>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>

        {/* ===== MIDDLE SECTION GRID ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
            {/* Mechanic Leaderboard */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                <Card className="h-full">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-cyan-400/10 rounded-xl text-cyan-400 border border-cyan-400/20 shadow-glow-cyan-sm">
                            <TrendingUp size={20} />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-slate-100 tracking-tight uppercase">Operational Ranks</h2>
                    </div>
                    <div className="space-y-4">
                        {stats.mechanicLeaderboard.map((m, i) => {
                            const style = getRankStyle(i);
                            return (
                                <div key={m._id} className={`flex items-center gap-6 p-4 rounded-2xl border ${style.border} ${style.bg} ${style.shadow} group hover:translate-x-1 transition-all`}>
                                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.text} font-black`}>
                                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <p className="text-sm font-display font-bold text-slate-100 truncate">{m.mechanicName}</p>
                                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{m.mechanicEmail}</p>
                                   </div>
                                   <div className="text-right">
                                      <div className="flex text-amber-400 text-xs">
                                         {[...Array(5)].map((_, idx) => (
                                           <Star key={idx} size={10} fill={idx < Math.round(m.averageRating) ? 'currentColor' : 'none'} className={idx < Math.round(m.averageRating) ? 'text-amber-400' : 'text-slate-700'} />
                                         ))}
                                      </div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{m.reviewCount} Reports</p>
                                   </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </motion.div>

            {/* Rating Distribution */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                <Card className="h-full flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-amber-400/10 rounded-xl text-amber-400 border border-amber-400/20">
                            <Filter size={20} />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-slate-100 tracking-tight uppercase">Sentiment Spread</h2>
                    </div>
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const entry = stats.ratingDistribution.find(d => d._id === rating);
                            const count = entry ? entry.count : 0;
                            const percentage = (count / stats.overall.totalFeedbacks) * 100;
                            return (
                                <div key={rating} className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                                        <span>{rating} Star Tier</span>
                                        <span>{count} Mentions</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                                            <motion.div 
                                                initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                                            />
                                        </div>
                                        <span className="text-xs font-display font-bold text-slate-400 w-8">{Math.round(percentage)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </motion.div>
        </div>

        {/* ===== RECENT FEEDBACK FEED ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {stats.recentFeedbacks.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.05 }}>
                <Card className="group relative overflow-hidden h-full border-slate-800 hover:border-blue-400/30 transition-all duration-300">
                    <Quote className="absolute top-6 right-8 text-slate-800 group-hover:text-blue-500/10 transition-colors" size={64} strokeWidth={4} />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col gap-1">
                                <StarRating rating={f.garageRating} readOnly={true} />
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Validated Transaction</span>
                            </div>
                            <div className="text-[10px] font-black text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 uppercase tracking-widest">
                                {new Date(f.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>

                        <p className="text-slate-200 font-medium leading-relaxed italic text-lg mb-8 flex-1">
                          “{f.comment || 'No textual commentary provided.'}”
                        </p>

                        <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-display font-bold text-sm border border-slate-700">
                                    {f.customerName.charAt(0)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-slate-100 font-display font-bold text-sm tracking-tight truncate">{f.customerName}</span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">Tech: {f.mechanicName}</span>
                                </div>
                            </div>
                            {f.wouldRecommend && (
                                <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-widest bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
                                    <ThumbsUp size={12} />
                                    <span>Endorsed</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
              </motion.div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default FeedbackOverview;
