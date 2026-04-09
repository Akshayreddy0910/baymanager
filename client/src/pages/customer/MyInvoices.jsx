import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  DollarSign, FileText, CheckCircle, CreditCard, X, 
  MessageSquare, AlertCircle, Wrench, Clock, ChevronRight, Calendar 
} from 'lucide-react';
import { getMyInvoices, createCheckoutSession, markAsPaid } from '../../services/invoiceService.js';
import { checkFeedbackExists } from '../../services/feedbackService.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const MyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payingId, setPayingId] = useState(null); // Track which invoice is being paid
  
  // feedbackStatus stores { [jobCardId]: boolean } to track if review exists
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [checkingFeedback, setCheckingFeedback] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Design System: Status styles for dynamic badges
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

  // 1. Fetch user invoices - Preserving logic and adding feedback check loop
  const loadData = async () => {
    try {
      const data = await getMyInvoices();
      setInvoices(data);
      setLoading(false);
      
      // After invoices are loaded, check feedback status for each job card
      if (data.length > 0) {
        setCheckingFeedback(true);
        const statuses = {};
        // Use a for loop to sequentially check feedback for each job
        for (let i = 0; i < data.length; i++) {
          const inv = data[i];
          const jcId = inv.jobCardId?._id || inv.jobCardId;
          if (jcId) {
            try {
              const res = await checkFeedbackExists(jcId);
              statuses[jcId] = res.exists;
            } catch (err) {
              console.error("Error checking feedback for JC:", jcId, err);
            }
          }
        }
        setFeedbackStatus(statuses);
        setCheckingFeedback(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // 2. Handle Stripe Success redirect back to this page - Preserving logic
    const query = new URLSearchParams(location.search);
    const success = query.get('success');
    const invoiceId = query.get('invoiceId');
    const canceled = query.get('canceled');
    const jobCardIdParam = query.get('jobCardId');

    if (success === 'true' && invoiceId) {
        const handleSuccessRedirect = async () => {
            try {
                // Mark the invoice as paid in BayManager's database
                await markAsPaid(invoiceId);
                
                // Immediately transition user to the feedback screen if we have the jobCardId
                if (jobCardIdParam) {
                    navigate(`/customer/give-feedback/${jobCardIdParam}`, { replace: true, state: { paymentSuccess: true } });
                } else {
                    setPaymentSuccess(true);
                    loadData();
                    navigate('/dashboard/invoices', { replace: true });
                }
            } catch (err) {
                console.error("Failed to finalize payment:", err);
            }
        };
        handleSuccessRedirect();
    }

    if (canceled === 'true') {
        navigate('/dashboard/invoices', { replace: true });
    }
  }, [location.search]);

  // 3. Stripe Payment Handler - Preserving exact function name and logic
  const handlePayment = async (invId) => {
    try {
        setPayingId(invId); // Show spinner on this invoice's button
        const stripeUrl = await createCheckoutSession(invId);
        window.location.href = stripeUrl; // Redirect to Stripe Checkout
    } catch (err) {
        setPayingId(null);
        alert("Payment could not be started: " + (err.response?.data?.message || "Please try again."));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
            <CreditCard size={48} className="text-purple-500 animate-pulse mb-4 shadow-glow-blue-sm" />
            <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Billing Records...</p>
        </div>
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
        >
          <h1 className="text-4xl font-display font-bold text-slate-100 uppercase tracking-tighter">
            My <span className="text-gradient">Invoices</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Secure payments powered by <span className="text-purple-400 font-bold">Stripe</span>
          </p>
        </motion.div>

        {/* ===== SUCCESS BANNER ===== */}
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-6 shadow-glow-emerald-sm"
          >
             <div className="bg-emerald-500/20 p-3 rounded-xl">
                <CheckCircle size={28} />
             </div>
             <div>
                <p className="font-display font-bold text-xl tracking-tight">Payment Confirmed! 🎉</p>
                <p className="text-xs font-medium opacity-80 mt-1 uppercase tracking-wider">Your invoice has been cleared successfully.</p>
             </div>
          </motion.div>
        )}

        {/* ===== EMPTY STATE ===== */}
        {!loading && invoices.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <Card className="text-center py-24 border-dashed border-slate-800">
               <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={32} className="text-slate-600" />
               </div>
               <h3 className="text-xl font-display font-bold text-slate-300">No invoices yet</h3>
               <p className="text-slate-500 mt-2 italic">Billing records appear once service sessions reach completion.</p>
            </Card>
          </motion.div>
        )}

        {/* ===== INVOICES LIST ===== */}
        {!loading && invoices.length > 0 && (
          <div className="mt-12 space-y-6">
            {invoices.map((inv, index) => {
              const jcIdValue = inv.jobCardId?._id || inv.jobCardId;
              const hasFeedback = feedbackStatus[jcIdValue] === true;
              const isPaid = inv.paymentStatus === 'Paid';
              const jobIsCompleted = inv.jobCardId?.status === "Completed";
              
              return (
                <motion.div
                  key={inv._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Card className="hover:shadow-glow-cyan-sm hover:border-cyan-400/30 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      
                      {/* Left Side: Invoice info */}
                      <div className="flex items-center gap-8">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center flex-shrink-0 shadow-inner border ${isPaid ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-purple-400/10 border-purple-400/20 text-purple-400'}`}>
                           <FileText size={32} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                             <span className="font-mono text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                                INV-{inv._id.slice(-8).toUpperCase()}
                             </span>
                             <span className={getBadgeClasses(inv.paymentStatus)}>
                               {inv.paymentStatus}
                             </span>
                          </div>
                          <p className="text-4xl font-display font-bold text-slate-100 tracking-tighter">
                             ${inv.totalAmount}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Wrench size={12} /> Service: ${inv.serviceCost}</span>
                              <span className="flex items-center gap-1.5"><Clock size={12} /> Labor: ${inv.laborCost}</span>
                              <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(inv.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Action Buttons */}
                      <div className="flex flex-wrap items-center gap-4 lg:flex-shrink-0">
                        {/* PAY NOW: Call handled based on original code structure */}
                        {!isPaid && (
                          <Button 
                            variant="primary"
                            onClick={() => handlePayment(inv._id)}
                            disabled={payingId === inv._id}
                            className="shadow-glow-blue px-10 gap-3 font-black uppercase tracking-widest text-xs h-14"
                          >
                            {payingId === inv._id ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Secure Gateway...</span>
                                </>
                            ) : (
                                <>
                                  <CreditCard size={18} />
                                  <span>Pay Now</span>
                                </>
                            )}
                          </Button>
                        )}

                        {/* FEEDBACK: Navigation handled based on feedback existence check */}
                        {isPaid && jobIsCompleted && !hasFeedback && (
                          <Button 
                            variant="secondary"
                            onClick={() => navigate(`/customer/give-feedback/${jcIdValue}`)}
                            className="bg-slate-800 hover:bg-slate-700 h-14 px-8 gap-2 uppercase font-black tracking-widest text-xs"
                          >
                            <MessageSquare size={18} className="text-cyan-400" />
                            <span>Leave Feedback</span>
                          </Button>
                        )}

                        {/* COMPLETED INDICATORS */}
                        {hasFeedback && (
                          <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle size={16} />
                            Feedback Submitted
                          </div>
                        )}

                        {isPaid && (
                          <div className="flex flex-col items-end gap-1 px-4">
                             <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-[0.2em]">
                                <CheckCircle size={18} />
                                <span>Cleared</span>
                             </div>
                             <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Digital Receipt Available</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Security Trust Badge */}
        <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-full">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
               <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.2em]">
                 Encrpyted Financial Gateway • No Cards Stored locally
               </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MyInvoices;
