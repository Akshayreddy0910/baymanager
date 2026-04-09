import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Edit2, Trash2, X, AlertOctagon, Check, 
  Car, Users, Calendar, Hash, Save, Search, User 
} from 'lucide-react';
import { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/vehicleService.js';
import { getAllCustomers } from '../../services/customerService.js';
import { useSocket } from '../../context/SocketContext.jsx'; 
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const ManageVehicles = () => {
  // 1. Data and State - Preserving existing variable names
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); 
  const socket = useSocket();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({ customerId: '', registrationNumber: '', model: '', year: '' });

  // Design System: Color lookup for consistent aesthetics
  const colorClasses = {
    cyan:    { bg: "bg-cyan-400/10",    border: "border-cyan-400/20",    text: "text-cyan-400" },
    blue:    { bg: "bg-blue-400/10",    border: "border-blue-400/20",    text: "text-blue-400" },
    amber:   { bg: "bg-amber-400/10",   border: "border-amber-400/20",   text: "text-amber-400" },
    emerald: { bg: "bg-emerald-400/10", border: "border-emerald-400/20", text: "text-emerald-400" },
    rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/20",    text: "text-rose-400" },
    purple:  { bg: "bg-purple-400/10",  border: "border-purple-400/20",  text: "text-purple-400" },
  };

  // 1. Fetch data from backend - Preserving parallel fetch logic
  const loadData = async () => {
    try {
      const [vData, cData] = await Promise.all([getAllVehicles(), getAllCustomers()]);
      setVehicles(vData);
      setCustomers(cData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. WebSocket Sync - Preserving exact listener handling
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (newVehicle) => {
        setVehicles((prev) => {
            const exists = prev.some(v => v._id === newVehicle._id);
            if (exists) return prev;
            return [...prev, newVehicle];
        });
    };

    const handleUpdated = (updatedVehicle) => {
        setVehicles((prev) => prev.map(v => v._id === updatedVehicle._id ? updatedVehicle : v));
    };

    const handleDeleted = (deletedId) => {
        setVehicles((prev) => prev.filter(v => v._id !== deletedId));
        setConfirmDeleteId(prevId => prevId === deletedId ? null : prevId);
    };

    socket.on('vehicle:created', handleCreated);
    socket.on('vehicle:updated', handleUpdated);
    socket.on('vehicle:deleted', handleDeleted);

    return () => {
        socket.off('vehicle:created', handleCreated);
        socket.off('vehicle:updated', handleUpdated);
        socket.off('vehicle:deleted', handleDeleted);
    };
  }, [socket]);

  // 3. Handlers - Preserving names and logic
  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({ 
        customerId: vehicle.customerId?._id || '', 
        registrationNumber: vehicle.registrationNumber, 
        model: vehicle.model, 
        year: vehicle.year 
      });
    } else {
      setEditingVehicle(null);
      setFormData({ customerId: '', registrationNumber: '', model: '', year: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        if (editingVehicle) {
            await updateVehicle(editingVehicle._id, formData);
        } else {
            await createVehicle(formData);
        }
        setIsModalOpen(false);
    } catch (err) {
        alert("Error saving vehicle");
    }
  };

  const executeDelete = async (id) => {
    try {
        await deleteVehicle(id);
        setConfirmDeleteId(null);
    } catch (err) {
        alert("Delete failed. Unauthorized or server error.");
        setConfirmDeleteId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Car size={40} className="text-cyan-400 animate-pulse mb-4 shadow-glow-cyan-sm" />
        <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Vehicles...</p>
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
                    Manage <span className="text-gradient">Vehicles</span>
                </h1>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-slate-400 font-medium leading-none">Track and manage customer vehicles.</p>
                    <div className="h-4 w-px bg-slate-800 hidden md:block" />
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${socket ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${socket ? 'bg-emerald-400 animate-pulse shadow-glow-emerald' : 'bg-rose-400'}`} />
                        {socket ? 'Sync Active' : 'Sync Offline'}
                    </div>
                </div>
            </div>
            <Button variant="primary" onClick={() => openModal()} className="shadow-glow-blue px-8 py-6 h-auto uppercase tracking-widest font-black text-xs gap-3">
              <Plus size={20} />
              <span>Add Vehicle</span>
            </Button>
          </div>
        </motion.div>

        {/* ===== FLET TABLE ===== */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="mt-12"
        >
          {vehicles.length === 0 ? (
            <Card className="text-center py-20 border-dashed border-slate-800">
               <Car size={48} className="mx-auto text-slate-700 mb-6" />
               <h3 className="text-xl font-display font-bold text-slate-300 tracking-tight">No Vehicles Found</h3>
               <p className="text-slate-500 mt-2 font-medium">No vehicles registered in the system yet.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 border-b border-slate-800">
                    <tr>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Owner</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] text-center">Registration Number</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Model</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Year</th>
                      <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {vehicles.map((v, i) => (
                      <motion.tr 
                        key={v._id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.8) }}
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-display font-bold">
                                    {v.customerId?.name?.charAt(0) || <User size={16} />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-200 leading-none">{v.customerId?.name || 'Unassigned'}</p>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Customer Profile</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                            <span className="bg-slate-950 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono font-black shadow-inner tracking-[0.1em]">
                                {v.registrationNumber}
                            </span>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-slate-600" />
                                <span className="text-slate-300 font-bold">{v.model}</span>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-slate-500 font-black font-mono">{v.year}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            {confirmDeleteId === v._id ? (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex items-center bg-rose-500/10 border border-rose-500/30 rounded-xl overflow-hidden shadow-glow-rose-sm"
                                >
                                    <span className="px-3 text-[9px] font-black text-rose-400 uppercase tracking-tighter whitespace-nowrap">Delete this vehicle?</span>
                                    <button onClick={() => executeDelete(v._id)} className="p-3 bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                                        <Check size={14} />
                                    </button>
                                    <button onClick={() => setConfirmDeleteId(null)} className="p-3 bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(v)} className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => setConfirmDeleteId(v._id)} className="p-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>

        {/* ===== REGISTRATION MODAL ===== */}
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
                        <Card className="p-0 overflow-hidden border-slate-800 shadow-glow-blue-sm">
                            <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
                                        {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Enter vehicle details.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-slate-100 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-3 ml-2">Select Owner</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 pointer-events-none">
                                            <User size={18} />
                                        </div>
                                        <select 
                                            value={formData.customerId} 
                                            onChange={(e) => setFormData({...formData, customerId: e.target.value})} 
                                            className="w-full pl-14 pr-7 py-4 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-200 font-bold focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 transition-all appearance-none cursor-pointer" 
                                            required
                                        >
                                            <option value="">Select an owner...</option>
                                            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <Input 
                                    label="Registration Number" 
                                    icon={Hash}
                                    placeholder="XYZ-7890"
                                    value={formData.registrationNumber} 
                                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})} 
                                    required 
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input 
                                        label="Make / Model" 
                                        icon={Car}
                                        placeholder="Model"
                                        value={formData.model} 
                                        onChange={(e) => setFormData({...formData, model: e.target.value})} 
                                        required 
                                    />
                                    <Input 
                                        label="Year" 
                                        type="number"
                                        icon={Calendar}
                                        placeholder="2024"
                                        value={formData.year} 
                                        onChange={(e) => setFormData({...formData, year: e.target.value})} 
                                        required 
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" className="flex-2 gap-3 shadow-glow-blue">
                                        <Save size={18} />
                                        <span>{editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}</span>
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

export default ManageVehicles;
