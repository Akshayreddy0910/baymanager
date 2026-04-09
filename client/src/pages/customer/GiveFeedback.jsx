import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, MessageSquare, Wrench } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import StarRating from "../../components/ui/StarRating.jsx";
import { submitFeedback, checkFeedbackExists } from "../../services/feedbackService.js";

/**
 * GiveFeedback Page
 * Allows customers to submit reviews for their completed service bookings.
 * features duplicate checks on mount and a polished interactive form.
 */
const GiveFeedback = () => {
  // Extract jobCardId from URL parameters
  const { jobCardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const paymentSuccessParam = location.state?.paymentSuccess;

  // 1. Form state variables
  const [garageRating, setGarageRating] = useState(0);
  const [mechanicRating, setMechanicRating] = useState(0);
  const [comment, setComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  // 2. Lifecycle & status states
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);

  // 3. Prevent duplicate submissions by checking existence on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await checkFeedbackExists(jobCardId);
        if (response.exists) {
          setAlreadySubmitted(true);
        }
      } catch (err) {
        console.error("Duplicate check failed:", err);
      } finally {
        setCheckLoading(false);
      }
    };
    checkStatus();
  }, [jobCardId]);

  // 4. Handle form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Both ratings are mandatory
    if (garageRating === 0 || mechanicRating === 0) {
      setError("Please provide both ratings to help us improve!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await submitFeedback({ 
        jobCardId, 
        garageRating, 
        mechanicRating, 
        comment, 
        wouldRecommend 
      });
      // Success state triggers the "Thank You" view
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial gate for checking if feedback was already provided
  if (checkLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Wrench size={40} className="text-cyan-400 animate-spin mb-4" />
        <p className="font-display font-medium tracking-widest uppercase text-xs opacity-50">Checking...</p>
      </div>
    );
  }

  // Already submitted state
  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center py-12">
          <CheckCircle size={48} className="mx-auto text-emerald-400 mb-6" />
          <h2 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
            Feedback Already Submitted
          </h2>
          <p className="text-slate-400 mt-2 font-medium">
            You have already reviewed this service. Thank you for your feedback!
          </p>
          <Button 
            variant="primary" 
            className="mt-8 w-full" 
            onClick={() => navigate("/dashboard/invoices")}
          >
            Back to Billing
          </Button>
        </Card>
      </div>
    );
  }

  // Post-submission success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center py-12">
            <CheckCircle size={64} className="mx-auto text-emerald-400 mb-6" />
            <h2 className="text-3xl font-display font-bold text-slate-100 tracking-tight text-gradient">
              Thank You!
            </h2>
            <p className="text-slate-400 mt-2 font-medium">
              Your feedback has been submitted successfully.
            </p>
            <Button 
              variant="primary" 
              className="mt-8 w-full" 
              onClick={() => navigate("/dashboard/invoices")}
            >
              Back to Billing
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Render the Feedback Form
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        
        {/* Navigation / Header */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/dashboard/invoices")} 
          className="mb-8"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Billing
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Incoming Payment Success Banner */}
          {paymentSuccessParam && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-6 shadow-glow-emerald-sm"
            >
               <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <CheckCircle size={28} />
               </div>
               <div>
                  <p className="font-display font-bold text-xl tracking-tight">Payment Confirmed! 🎉</p>
                  <p className="text-xs font-medium opacity-80 mt-1 uppercase tracking-wider">Please take a moment to review your service.</p>
               </div>
            </motion.div>
          )}

          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-100 tracking-tighter">
              Rate Your <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-slate-400 mt-3 font-medium text-lg leading-relaxed">
              Help us improve by sharing your experience with the garage and the mechanics.
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Garage Rating Section */}
              <div className="space-y-3">
                <label className="text-slate-300 font-bold block">
                  How would you rate the garage overall?
                </label>
                <div className="bg-slate-800/30 p-4 rounded-2xl flex justify-center">
                  <StarRating 
                    value={garageRating} 
                    onChange={setGarageRating}
                    size="lg"
                  />
                </div>
              </div>
              
              {/* Mechanic Rating Section */}
              <div className="space-y-3">
                <label className="text-slate-300 font-bold block">
                  How would you rate the mechanic's work?
                </label>
                <div className="bg-slate-800/30 p-4 rounded-2xl flex justify-center">
                  <StarRating 
                    value={mechanicRating} 
                    onChange={setMechanicRating}
                    size="lg"
                  />
                </div>
              </div>
              
              {/* Comment Input */}
              <div>
                <label className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3 block">
                  Additional Comments (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  placeholder="Tell us what you liked or what we can do better..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 
                             text-slate-100 placeholder:text-slate-600 
                             focus:outline-none focus:border-cyan-400/50 
                             focus:ring-4 focus:ring-cyan-400/10 transition-all resize-none font-medium"
                />
                <div className="flex justify-end mt-2">
                  <span className={`text-[10px] font-bold ${comment.length > 950 ? 'text-rose-400' : 'text-slate-600'}`}>
                    {comment.length} / 1000
                  </span>
                </div>
              </div>
              
              {/* Recommendation Checkbox */}
              <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-2xl cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => setWouldRecommend(!wouldRecommend)}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${wouldRecommend ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700'}`}>
                  {wouldRecommend && <CheckCircle size={16} className="text-white" />}
                </div>
                <label className="text-slate-300 font-bold cursor-pointer select-none">
                  I would recommend this garage to others
                </label>
              </div>
              
              {/* Error Alert Display */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-400 
                             rounded-2xl p-4 text-sm font-bold flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  {error}
                </motion.div>
              )}
              
              {/* Submission Control */}
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full shadow-glow-cyan" 
                disabled={loading}
              >
                {loading ? "Transmitting Feedback..." : "Submit Feedback"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GiveFeedback;
