import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Award, MessageSquare, Wrench, ChevronRight } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import StarRating from "../../components/ui/StarRating.jsx";
import { getMechanicFeedback } from "../../services/feedbackService.js";

/**
 * MyRatings Page (Staff/Mechanic)
 * Allows mechanics to view their personal performance metrics, average ratings,
 * and a chronological feed of customer feedback specific to their work.
 */
const MyRatings = () => {
  // 1. Data and lifecycle state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 2. Fetch personal feedback data on mount
  useEffect(() => {
    const fetchMyPerformance = async () => {
      try {
        const result = await getMechanicFeedback();
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to retrieve your performance records.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyPerformance();
  }, []);

  // Standardized premium loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="relative">
            <Wrench size={48} className="text-cyan-400 animate-spin" />
            <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20"
            />
        </div>
        <h2 className="mt-8 font-display font-black text-xl text-slate-100 tracking-[0.3em] uppercase opacity-50">Checking bay ratings</h2>
      </div>
    );
  }

  // Error handling view
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <Card className="max-w-md border-rose-500/30 text-center">
          <Award size={48} className="mx-auto text-rose-500 mb-6 opacity-50 rotate-12" />
          <h2 className="text-2xl font-display font-bold text-slate-100 italic">Access Denied</h2>
          <p className="text-slate-500 mt-2 font-medium">{error}</p>
        </Card>
      </div>
    );
  }

  // 3. Handle data exists check
  if (!data || data.summary.totalReviews === 0) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 md:p-24 flex items-center justify-center">
        <div className="text-center max-w-xl">
             <header className="mb-12">
                <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-100 tracking-tighter">
                   My <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">Ratings</span>
                </h1>
            </header>
            <Card className="py-20 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-600 mb-8 border border-slate-700 shadow-inner">
                    <Star size={40} />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-300 tracking-tight">Level 1: Unrated</h2>
                <p className="text-slate-500 mt-4 leading-relaxed font-medium">
                    You haven't received any customer reviews yet. Ratings and feedback will appear here once customers review the jobs you've completed.
                </p>
                <div className="mt-8 px-6 py-3 bg-slate-800/50 rounded-xl border border-slate-700 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    Keep up the good work! 🛠️
                </div>
            </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <motion.header 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-display font-black text-slate-100 tracking-tighter">
            My <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">Ratings</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.4em] mt-3">
             Individual Performance Dashboard
          </p>
        </motion.header>

        {/* Hero Performance Card */}
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
        >
            <Card className="text-center py-12 md:py-20 mb-12 shadow-glow-cyan-sm relative overflow-hidden group">
                {/* Abstract background flourish */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-cyan-500/20 transition-all duration-700"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-amber-400/10 border border-amber-400/30 mb-6 shadow-glow-amber-sm">
                        <Award size={48} className="text-amber-400" />
                    </div>
                    
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-4">
                        Aggregate Performance Score
                    </p>
                    
                    <div className="text-7xl md:text-9xl font-display font-black text-slate-100 tracking-tighter mb-4 flex items-center justify-center gap-4">
                        {data.summary.averageRating.toFixed(1)}
                        <span className="text-2xl text-slate-700 font-medium">/ 5.0</span>
                    </div>

                    <div className="flex items-center justify-center mb-6">
                        <StarRating value={data.summary.averageRating} readOnly size="lg" />
                    </div>

                    <div className="inline-flex items-center gap-2 bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700 text-xs font-bold text-slate-400">
                        <MessageSquare size={14} className="text-cyan-400" />
                        Showing insights from <span className="text-slate-100">{data.summary.totalReviews}</span> verified customer reviews
                    </div>
                </div>
            </Card>
        </motion.div>

        {/* Detailed Reviews Feed */}
        <section className="space-y-8 mb-20">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-display font-bold text-slate-200 tracking-tight">Recent Bay Reviews</h2>
                <div className="h-px flex-1 bg-slate-800 ml-6 hidden md:block"></div>
            </div>

            <div className="space-y-6">
                {data.feedbacks.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="hover:border-slate-700 transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="space-y-1">
                                    <StarRating value={f.mechanicRating} readOnly size="sm" />
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Mechanic Skill Rating</span>
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-700">
                                    {new Date(f.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>

                            {f.comment ? (
                                <blockquote className="relative p-6 bg-slate-800/20 rounded-2xl border border-slate-800 mb-6 italic">
                                    <p className="text-slate-300 font-medium leading-relaxed">
                                        "{f.comment}"
                                    </p>
                                </blockquote>
                            ) : (
                                <div className="py-4 text-slate-600 italic text-sm font-medium">Customer left a star rating without comment.</div>
                            )}

                            <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500">
                                        {f.customerId?.name?.charAt(0) || "A"}
                                    </div>
                                    <div>
                                        <p className="text-slate-100 font-display font-bold text-sm tracking-tight leading-none mb-1">
                                            {f.customerId?.name || "Anonymous Guest"}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <span>#{f._id.slice(-6).toUpperCase()}</span>
                                            {f.jobCardId?.bookingId?.serviceType && (
                                                <>
                                                    <span className="text-slate-700">•</span>
                                                    <span className="text-cyan-400 opacity-70">{f.jobCardId.bookingId.serviceType}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-700 font-black text-[10px] uppercase tracking-widest">
                                    <span>Verified Visit</span>
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>

      </div>
    </div>
  );
};

export default MyRatings;
