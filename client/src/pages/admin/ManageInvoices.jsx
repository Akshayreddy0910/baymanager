import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, DollarSign, Receipt, Briefcase, 
  Wallet, FileText, CheckCircle, Clock, AlertCircle, Save, Landmark, TrendingUp,
  Settings, User
} from 'lucide-react';
import { getAllInvoices, createInvoice, markAsPaid } from '../../services/invoiceService.js';
import { getAllJobCards } from '../../services/jobCardService.js';
import { useSocket } from '../../context/SocketContext.jsx'; 
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const ManageInvoices = () => {
  // 1. Data and State - Preserving existing variable names
  const [invoices, setInvoices] = useState([]);
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ jobCardId: '', serviceCost: '', laborCost: '' });

  // Design System: Status Styles
  const statusStyles = {
    'Paid':    { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: CheckCircle },
    'Pending': { text: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20",    icon: Clock },
  };

  // 1. Fetch data
  const loadData = async () => {
    try {
      const [iData, jcData] = await Promise.all([getAllInvoices(), getAllJobCards()]);
      setInvoices(iData);
      setJobCards(jcData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Real-time Synchronization
  useEffect(() => {
    if (!socket) return;

    socket.on('invoice:created', (newInv) => {
        setInvoices((prev) => {
            if (prev.find(i => i._id === newInv._id)) return prev;
            return [newInv, ...prev];
        });
    });

    socket.on('payment:success', (data) => {
        setInvoices((prev) => prev.map(inv => 
            inv._id === data.invoiceId ? { ...inv, paymentStatus: 'Paid' } : inv
        ));
    });

    return () => {
        socket.off('invoice:created');
        socket.off('payment:success');
    };
  }, [socket]);

  // 3. Actions
  const handleSave = async (e) => {
    e.preventDefault();
    try {
        await createInvoice({
            jobCardId: formData.jobCardId,
            serviceCost: Number(formData.serviceCost),
            laborCost: Number(formData.laborCost)
        });
        setIsModalOpen(false);
        setFormData({ jobCardId: '', serviceCost: '', laborCost: '' });
    } catch (err) {
        alert("Error: " + (err.response?.data?.message || "Something went wrong"));
    }
  };

  const handlePay = async (id) => {
    if (window.confirm("Mark this invoice as PAID?")) {
        try {
            await markAsPaid(id);
        } catch (err) {
            alert("Update failed");
        }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Landmark size={40} className="text-purple-400 animate-pulse mb-4 shadow-glow-purple-sm" />
        <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Invoices...</p>
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
                Manage <span className="text-gradient">Invoices</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-400 font-medium">Create and track customer invoices.</p>
                <div className="h-4 w-px bg-slate-800 hidden md:block" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${socket ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${socket ? 'bg-emerald-400 animate-pulse shadow-glow-emerald' : 'bg-rose-400'}`} />
                    {socket ? 'Sync Active' : 'Sync Offline'}
                </div>
            </div>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} className="shadow-glow-purple px-8 py-6 h-auto uppercase tracking-widest font-black text-xs gap-3">
            <Plus size={20} />
            <span>Create Invoice</span>
          </Button>
        </motion.div>

        {/* ===== INVOICE LEDGER ===== */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="mt-12"
        >
          {invoices.length === 0 ? (
            <Card className="text-center py-20 border-dashed border-slate-800">
               <Receipt size={48} className="mx-auto text-slate-700 mb-6" />
               <h3 className="text-xl font-display font-bold text-slate-300 tracking-tight">No Invoices Found</h3>
               <p className="text-slate-500 mt-2 font-medium">Generate an invoice to track payments.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden p-0 border-slate-900 shadow-glow-purple-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                  <thead className="bg-slate-900/50 border-b border-slate-800/50">
                    <tr>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Invoice ID</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Customer</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] text-right">Costs</th>
                      <th className="px-8 py-5 font-black text-slate-100 text-[10px] uppercase tracking-[0.2em] text-right">Total</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {invoices.map((inv, i) => {
                      const status = statusStyles[inv.paymentStatus] || statusStyles['Pending'];
                      const StatusIcon = status.icon;

                      return (
                        <motion.tr 
                          key={inv._id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.8) }}
                          className="hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                  <Receipt className="text-purple-400/50" size={16} />
                                  <span className="font-mono text-xs font-bold text-purple-400 tracking-tighter">
                                    INV-{inv._id.slice(-8).toUpperCase()}
                                  </span>
                              </div>
                          </td>
                          <td className="px-8 py-6 font-bold text-slate-200">
                              {inv.jobCardId?.bookingId?.customerId?.name || 'Unlinked Profile'}
                          </td>
                          <td className="px-8 py-6">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.bg} ${status.border} ${status.text} text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                                 <StatusIcon size={12} className={inv.paymentStatus === 'Pending' ? 'animate-pulse' : ''} />
                                 <span>{inv.paymentStatus}</span>
                              </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                              <div className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">
                                ${inv.serviceCost?.toFixed(2)} / ${inv.laborCost?.toFixed(2)}
                              </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <TrendingUp size={14} className="text-emerald-500/30" />
                                <span className="font-display font-bold text-slate-100 text-lg tracking-tight">
                                    ${inv.totalAmount?.toFixed(2)}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                              {inv.paymentStatus === 'Pending' ? (
                                  <button 
                                    onClick={() => handlePay(inv._id)} 
                                    className="p-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl transition-all shadow-glow-emerald-sm opacity-0 group-hover:opacity-100"
                                    title="Mark as Paid"
                                  >
                                      <DollarSign size={16} />
                                  </button>
                              ) : (
                                  <CheckCircle size={20} className="text-emerald-500/40 mx-auto" />
                              )}
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

        {/* ===== GENERATION MODAL ===== */}
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md"
                    >
                        <Card className="p-0 overflow-hidden border-slate-800 shadow-glow-purple-sm">
                            <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-slate-100 tracking-tight uppercase">Create Invoice</h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Financial reconciliation</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-slate-100 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Select Job Card</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 pointer-events-none">
                                            <Briefcase size={18} />
                                        </div>
                                        <select 
                                            value={formData.jobCardId} 
                                            onChange={(e) => setFormData({...formData, jobCardId: e.target.value})} 
                                            className="w-full pl-14 pr-12 py-4 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-200 font-bold focus:outline-none focus:border-purple-400/50 focus:ring-4 focus:ring-purple-400/10 transition-all appearance-none cursor-pointer" 
                                            required
                                        >
                                            <option value="">Select a Job Card...</option>
                                            {jobCards.map(jc => (
                                                <option key={jc._id} value={jc._id}>
                                                    JOB-{jc._id.slice(-6).toUpperCase()} | {jc.bookingId?.customerId?.name || 'N/A'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input 
                                        label="Service Cost ($)" 
                                        type="number"
                                        placeholder="0.00"
                                        icon={Settings}
                                        value={formData.serviceCost} 
                                        onChange={(e) => setFormData({...formData, serviceCost: e.target.value})} 
                                        required 
                                    />
                                    <Input 
                                        label="Labor Cost ($)" 
                                        type="number"
                                        placeholder="0.00"
                                        icon={User}
                                        value={formData.laborCost} 
                                        onChange={(e) => setFormData({...formData, laborCost: e.target.value})} 
                                        required 
                                    />
                                </div>
                                
                                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-inner relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all" />
                                    <div className="relative z-10">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Total Amount Due</p>
                                        <div className="flex items-center gap-3">
                                            <Wallet size={24} className="text-purple-400" />
                                            <span className="text-5xl font-display font-bold text-slate-100 tracking-tighter">
                                                ${(Number(formData.serviceCost) || 0) + (Number(formData.laborCost) || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" variant="primary" className="w-full py-6 mt-4 gap-3 shadow-glow-purple uppercase font-black tracking-widest text-xs h-auto">
                                    <Save size={20} />
                                    <span>Create Invoice</span>
                                </Button>
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

export default ManageInvoices;
