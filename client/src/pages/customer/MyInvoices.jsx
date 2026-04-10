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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-glow-blue-sm">
                <FileText size={24} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Financial Portal</span>
            </div>
            <h1 className="text-5xl font-display font-bold text-slate-100 uppercase tracking-tighter leading-none">
              My <span className="text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">Invoices</span>
            </h1>
            <p className="text-slate-400 mt-4 font-medium max-w-md">
              Review and settle your service balances securely via our <span className="text-purple-400 font-bold">Stripe</span> gateway.
            </p>
          </motion.div>

          {/* ===== TEST MODE CARD NOTICE ===== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-5">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Simulator Mode</span>
                </div>
                <p className="text-[9px] font-mono font-bold text-slate-500 uppercase mb-1">Test Card Details</p>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-mono font-black text-white tracking-widest">4242 4242 4242 4242</p>
                  <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-slate-400 uppercase">Visa</div>
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="text-[9px] font-mono text-slate-600">EXP: 12/28</span>
                  <span className="text-[9px] font-mono text-slate-600">CVC: 123</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                <CreditCard size={20} className="text-slate-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===== SUCCESS BANNER ===== */}
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-6 shadow-glow-emerald-sm">
               <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <CheckCircle size={28} />
               </div>
               <div>
                  <p className="font-display font-bold text-xl tracking-tight">Payment Confirmed! 🎉</p>
                  <p className="text-xs font-medium opacity-80 mt-1 uppercase tracking-wider">Your invoice has been cleared successfully.</p>
               </div>
               <button 
                 onClick={() => setPaymentSuccess(false)}
                 className="ml-auto p-2 hover:bg-white/5 rounded-lg transition-colors"
               >
                 <X size={20} />
               </button>
            </div>
          </motion.div>
        )}

        {/* ===== LIST CONTENT ===== */}
        {invoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 group"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-b from-slate-900/50 to-transparent rounded-[3rem] blur-2xl opacity-50" />
              <Card className="relative bg-slate-900/40 border-slate-800/50 backdrop-blur-sm border-dashed text-center py-32 rounded-[2.5rem] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-slate-800 to-transparent" />
                
                <div className="w-24 h-24 bg-slate-900/80 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <FileText size={40} className="text-slate-700 group-hover:text-purple-500/50 transition-colors duration-500" />
                </div>
                
                <h3 className="text-2xl font-display font-bold text-slate-300 tracking-tight">Vault Empty</h3>
                <p className="text-slate-500 mt-3 italic text-sm max-w-xs mx-auto">
                  Your billing history will appear here once your vehicle service session reaches final certification.
                </p>
                
                <div className="mt-10 flex justify-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                </div>
              </Card>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
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
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`group relative overflow-hidden transition-all duration-500 ${isPaid ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'hover:border-purple-500/30 hover:bg-white/[0.02]'}`}>
                    {/* Progress indicator border for unpaid */}
                    {!isPaid && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-600 to-blue-600" />
                    )}
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-1">
                      
                      {/* Left Side: Invoice info */}
                      <div className="flex items-center gap-8">
                        <div className={`relative w-24 h-24 rounded-[2.5rem] flex items-center justify-center flex-shrink-0 shadow-inner border-2 transition-transform group-hover:scale-105 duration-500 ${isPaid ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-purple-600/10 border-purple-400/20 text-purple-400'}`}>
                           <FileText size={38} />
                           {isPaid && (
                             <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 border-4 border-slate-950">
                               <CheckCircle size={14} />
                             </div>
                           )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                             <span className="font-mono text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                #00{inv._id.slice(-6).toUpperCase()}
                             </span>
                             <span className={getBadgeClasses(inv.paymentStatus)}>
                               {inv.paymentStatus}
                             </span>
                          </div>
                          
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-slate-500 tracking-tighter">$</span>
                            <h2 className="text-4xl font-display font-bold text-slate-100 tracking-tighter">
                               {inv.totalAmount.toLocaleString()}
                            </h2>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.15em]">
                              <span className="flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                                <Wrench size={12} className="text-purple-500/60" /> 
                                Service: ${inv.serviceCost}
                              </span>
                              <span className="flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                                <Clock size={12} className="text-blue-500/60" /> 
                                Labor: ${inv.laborCost}
                              </span>
                              <span className="flex items-center gap-2 group-hover:text-slate-300 transition-colors text-slate-400">
                                <Calendar size={12} className="text-slate-600" /> 
                                Issued: {new Date(inv.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Action Buttons */}
                      <div className="flex flex-wrap items-center gap-4 lg:flex-shrink-0 lg:ml-auto">
                        
                        {!isPaid && (
                          <div className="flex flex-col items-center md:items-end gap-3">
                            <Button 
                              variant="primary"
                              onClick={() => handlePayment(inv._id)}
                              disabled={payingId === inv._id}
                              className="relative overflow-hidden group/btn shadow-glow-blue !px-12 gap-3 font-black uppercase tracking-widest text-xs h-14 w-full md:w-auto"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover/btn:opacity-90 transition-opacity" />
                              <div className="relative flex items-center gap-3">
                                {payingId === inv._id ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span>Initializing...</span>
                                    </>
                                ) : (
                                    <>
                                      <CreditCard size={18} />
                                      <span>Process Payment</span>
                                    </>
                                )}
                              </div>
                            </Button>
                            <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest hidden md:block">
                              Card Ending in 4242 Accepted
                            </p>
                          </div>
                        )}

                        {isPaid && jobIsCompleted && !hasFeedback && (
                          <Button 
                            variant="secondary"
                            onClick={() => navigate(`/customer/give-feedback/${jcIdValue}`)}
                            className="bg-slate-800/50 hover:bg-slate-700 h-14 px-8 gap-2 uppercase font-black tracking-widest text-xs border-slate-700 hover:border-cyan-500/30 transition-all group/fbtn"
                          >
                            <MessageSquare size={18} className="text-cyan-400 group-hover/fbtn:scale-110 transition-transform" />
                            <span>Share Experience</span>
                          </Button>
                        )}

                        {hasFeedback && (
                          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <CheckCircle size={18} />
                            Completed
                          </div>
                        )}

                        {isPaid && (
                          <div className="flex flex-col items-end gap-1 px-4 text-right">
                             <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-[0.1em]">
                                <span>Fully Cleared</span>
                                <CheckCircle size={20} />
                             </div>
                             <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Transaction Verified by Stripe</p>
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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
            <div className="inline-flex flex-col items-center gap-4">
              <div className="flex items-center gap-8 text-white/20">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center"><CheckCircle size={14}/></div>
                   <span className="text-[8px] font-black uppercase tracking-widest">PCI Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center"><CreditCard size={14}/></div>
                   <span className="text-[8px] font-black uppercase tracking-widest">SCA Ready</span>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900/30 border border-slate-800/50 rounded-3xl backdrop-blur-md">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                 <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.15em]">
                   Encrypted Network Protocol • ISO 27001 Certified Infrastructure
                 </p>
              </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyInvoices;
