import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Edit2, Trash2, X, Activity, Key, Users, 
  Mail, Phone, MapPin, Wifi, WifiOff, Save 
} from 'lucide-react';
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/customerService.js';
import { useSocket } from '../../context/SocketContext.jsx'; 
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const ManageCustomers = () => {
  // 1. State to track customers and UI flow - Preserving existing names
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', password: '' });

  // Design System: Color lookup for consistent aesthetics
  const colorClasses = {
    cyan:    { bg: "bg-cyan-400/10",    border: "border-cyan-400/20",    text: "text-cyan-400" },
    blue:    { bg: "bg-blue-400/10",    border: "border-blue-400/20",    text: "text-blue-400" },
    amber:   { bg: "bg-amber-400/10",   border: "border-amber-400/20",   text: "text-amber-400" },
    emerald: { bg: "bg-emerald-400/10", border: "border-emerald-400/20", text: "text-emerald-400" },
    rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/20",    text: "text-rose-400" },
    purple:  { bg: "bg-purple-400/10",  border: "border-purple-400/20",  text: "text-purple-400" },
  };

  // 1. Fetch data from backend on load - Preserving logic
  const loadData = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Real-time Synchronization Effect - Preserving byte-for-byte identical logic
  useEffect(() => {
    if (!socket) return;

    socket.on("customer:created", (newCustomer) => {
        const updatedList = [];
        let alreadyExists = false;
        for (let i = 0; i < customers.length; i++) {
            updatedList.push(customers[i]);
            if (customers[i]._id === newCustomer._id) alreadyExists = true;
        }
        if (!alreadyExists) {
            updatedList.push(newCustomer);
            setCustomers(updatedList);
        }
    });

    socket.on("customer:updated", (updatedCustomer) => {
        const newList = [];
        for (let i = 0; i < customers.length; i++) {
            if (customers[i]._id === updatedCustomer._id) {
                newList.push(updatedCustomer);
            } else {
                newList.push(customers[i]);
            }
        }
        setCustomers(newList);
    });

    socket.on("customer:deleted", (deletedId) => {
        const newList = [];
        for (let i = 0; i < customers.length; i++) {
            if (customers[i]._id !== deletedId) {
                newList.push(customers[i]);
            }
        }
        setCustomers(newList);
    });

    return () => {
        socket.off("customer:created");
        socket.off("customer:updated");
        socket.off("customer:deleted");
    };
  }, [socket, customers]);

  // 3. Handle CRUD actions - Preserving logic and handler names
  const handleDelete = async (id) => {
    if (window.confirm("Danger: Deleting this customer will also remove their login access. Continue?")) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({ 
        name: customer.name, 
        phone: customer.phone, 
        email: customer.email, 
        address: customer.address,
        password: '' 
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', email: '', address: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        if (editingCustomer) {
            await updateCustomer(editingCustomer._id, formData);
        } else {
            await createCustomer(formData);
        }
        setIsModalOpen(false);
        setFormData({ name: '', phone: '', email: '', address: '', password: '' });
    } catch (err) {
        alert(err.response?.data?.message || "Operation failed");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Users size={40} className="text-blue-400 animate-pulse mb-4 shadow-glow-blue-sm" />
        <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Customers...</p>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-4xl font-display font-bold text-slate-100 uppercase tracking-tighter">
                    Manage <span className="text-gradient">Customers</span>
                </h1>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-slate-400 font-medium">Add, edit, and track customer profiles.</p>
                    <div className="h-4 w-px bg-slate-800 hidden md:block" />
                    {/* Live Sync Indicator */}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                        {socket ? (
                            <>
                                <Wifi size={14} className="text-emerald-400" />
                                <span className="text-emerald-400">Sync Active</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            </>
                        ) : (
                            <>
                                <WifiOff size={14} className="text-rose-400 font-bold" />
                                <span className="text-rose-400 font-bold">Sync Offline</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Button variant="primary" onClick={() => openModal()} className="shadow-glow-blue px-8 py-6 h-auto uppercase tracking-widest font-black text-xs gap-3">
              <Plus size={20} />
              <span>Create Customer</span>
            </Button>
          </div>
        </motion.div>

        {/* ===== CUSTOMER GRID ===== */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12"
        >
            {customers.length === 0 ? (
                <Card className="text-center py-20 border-dashed border-slate-800">
                    <Users size={48} className="mx-auto text-slate-700 mb-6" />
                    <h3 className="text-xl font-display font-bold text-slate-300 tracking-tight">No Customers Found</h3>
                    <p className="text-slate-500 mt-2 font-medium">Add your first customer to begin operations.</p>
                    <Button variant="secondary" className="mt-8" onClick={() => openModal()}>
                        Add First Customer
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {customers.map((c, i) => (
                    <motion.div
                        key={c._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.8) }}
                    >
                        <Card className="group relative overflow-hidden p-10 hover:border-blue-400/30 transition-all duration-300">
                            {/* Actions Overlay */}
                            <div className="absolute top-6 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                                <button onClick={() => openModal(c)} className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-all">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(c._id)} className="p-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Avatar / Profile Initials */}
                            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-[1.8rem] flex items-center justify-center text-slate-200 font-display font-bold text-2xl mb-8 group-hover:bg-blue-600/20 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                                {c.name.charAt(0)}
                            </div>

                            <h3 className="text-2xl font-display font-bold text-slate-100 leading-tight mb-2 tracking-tight">
                                {c.name}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm mb-6">
                                <Mail size={14} className="text-slate-600" />
                                <span>{c.email}</span>
                            </div>
                            
                            <div className="inline-flex items-center gap-2 text-[9px] font-black text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">
                                <Activity size={12} />
                                <span>Customer</span>
                            </div>

                            <div className="space-y-4 mt-10 pt-8 border-t border-slate-900/50">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Contact Details</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Phone size={14} className="text-slate-600" />
                                        <span className="text-sm font-bold font-mono tracking-wider">{c.phone}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-slate-500">
                                        <MapPin size={14} className="text-slate-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs font-medium leading-relaxed italic line-clamp-2">
                                            {c.address || 'Location Unspecified'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                    ))}
                </div>
            )}
        </motion.div>

        {/* ===== ADD/EDIT MODAL ===== */}
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
                    
                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl"
                    >
                        <Card className="p-0 overflow-hidden border-slate-800 shadow-glow-blue-sm">
                            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
                                        {editingCustomer ? 'Edit Customer' : 'Create Customer'}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Enter customer details.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-slate-100 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Input 
                                            label="Full Name" 
                                            placeholder="John Doe"
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <Input 
                                            label="Phone Number" 
                                            placeholder="+91 XXXXX XXXXX"
                                            icon={Phone}
                                            value={formData.phone} 
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <Input 
                                            label="Email Address" 
                                            type="email"
                                            placeholder="john@example.com"
                                            icon={Mail}
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                            required 
                                        />
                                    </div>

                                    {/* PASSWORD FIELD */}
                                    <div className="md:col-span-2">
                                        <Input 
                                            label={editingCustomer ? 'Update Password (Leave blank to keep)' : 'Password'} 
                                            type="password"
                                            placeholder="••••••••"
                                            icon={Key}
                                            value={formData.password} 
                                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                            required={!editingCustomer}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Input 
                                            label="Address" 
                                            placeholder="Street, City, Zip"
                                            icon={MapPin}
                                            value={formData.address} 
                                            onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" className="flex-2 gap-2 shadow-glow-blue">
                                        <Save size={18} />
                                        <span>{editingCustomer ? 'Update Customer' : 'Save Customer'}</span>
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

export default ManageCustomers;
