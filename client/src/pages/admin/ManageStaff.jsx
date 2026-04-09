import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, UserCheck, Shield, Users, Mail, Lock, User, Save, RefreshCw } from 'lucide-react';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../services/staffService.js';
import { useSocket } from '../../context/SocketContext.jsx';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const ManageStaff = () => {
  // 1. Data and State - Preserving existing names
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // 1. Initial Load - Preserving logic
  const loadData = async () => {
    try {
      const data = await getAllStaff();
      setStaff(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Real-time Synchronization - Preserving byte-for-byte identical logic
  useEffect(() => {
    if (!socket) return;

    socket.on('staff:created', (newMember) => {
        const newList = [];
        let exists = false;
        for (let i = 0; i < staff.length; i++) {
            newList.push(staff[i]);
            if (staff[i]._id === newMember._id) exists = true;
        }
        if (!exists) {
            newList.push(newMember);
            setStaff(newList);
        }
    });

    socket.on('staff:updated', (updatedMember) => {
        const newList = [];
        for (let i = 0; i < staff.length; i++) {
            if (staff[i]._id === updatedMember._id) {
                newList.push(updatedMember);
            } else {
                newList.push(staff[i]);
            }
        }
        setStaff(newList);
    });

    socket.on('staff:deleted', (deletedId) => {
        const newList = [];
        for (let i = 0; i < staff.length; i++) {
            if (staff[i]._id !== deletedId) {
                newList.push(staff[i]);
            }
        }
        setStaff(newList);
    });

    return () => {
        socket.off('staff:created');
        socket.off('staff:updated');
        socket.off('staff:deleted');
    };
  }, [socket, staff]);

  // 3. Form Handling - Preserving logic
  const openModal = (member = null) => {
    if (member) {
      setEditingStaff(member);
      setFormData({ name: member.name, email: member.email, password: '' });
    } else {
      setEditingStaff(null);
      setFormData({ name: '', email: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        if (editingStaff) {
            await updateStaff(editingStaff._id, formData);
        } else {
            await createStaff(formData);
        }
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '' });
    } catch (err) {
        alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this staff member?")) {
      try {
        await deleteStaff(id);
      } catch (err) {
        alert("Error deleting staff");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Users size={40} className="text-blue-400 animate-pulse mb-4 shadow-glow-blue-sm" />
        <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Loading Staff...</p>
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
                Manage <span className="text-gradient">Staff</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-400 font-medium">Add and manage workshop staff members.</p>
                <div className="h-4 w-px bg-slate-800 hidden md:block" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${socket ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${socket ? 'bg-emerald-400 animate-pulse shadow-glow-emerald' : 'bg-rose-400'}`} />
                    {socket ? 'Sync Active' : 'Sync Offline'}
                </div>
            </div>
          </div>
          <Button variant="primary" onClick={() => openModal()} className="shadow-glow-blue px-8 py-6 h-auto uppercase tracking-widest font-black text-xs gap-3">
            <Plus size={20} />
            <span>Add Staff</span>
          </Button>
        </motion.div>

        {/* ===== STAFF GRID ===== */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="mt-12"
        >
          {staff.length === 0 ? (
            <Card className="text-center py-20 border-dashed border-slate-800">
               <Shield size={48} className="mx-auto text-slate-700 mb-6" />
               <h3 className="text-xl font-display font-bold text-slate-300 tracking-tight">No Staff Found</h3>
               <p className="text-slate-500 mt-2 font-medium">No verified staff accounts detected.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {staff.map((member, i) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.8) }}
                >
                  <Card className="group relative overflow-hidden p-8 flex flex-col h-full bg-slate-900/40 border-slate-800 hover:border-blue-400/30 transition-all duration-300">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(member)} className="p-2.5 bg-slate-800/80 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl border border-slate-700 transition-all shadow-lg">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(member._id)} className="p-2.5 bg-slate-800/80 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl border border-slate-700 transition-all shadow-lg">
                          <Trash2 size={14} />
                        </button>
                    </div>

                    <div className="w-20 h-20 bg-slate-800 border-2 border-slate-700 rounded-[1.5rem] flex items-center justify-center text-blue-400 mb-8 font-display font-bold text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500 group-hover:border-blue-400/20 group-hover:shadow-glow-blue-sm">
                        {member.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-display font-bold text-slate-100 leading-tight tracking-tight uppercase mb-2">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 font-medium mb-8">
                         <Mail size={14} className="text-slate-600" />
                         <span className="text-sm truncate">{member.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl w-fit">
                        <UserCheck size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Staff</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ===== MODAL ===== */}
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
                                    <h2 className="text-2xl font-display font-bold text-slate-100 tracking-tight uppercase">
                                      {editingStaff ? 'Edit Staff' : 'Add Staff'}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Enter staff details.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-slate-100 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <Input 
                                    label="Full Name" 
                                    icon={User}
                                    placeholder="Enter full name..." 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                                <Input 
                                    label="Email Address" 
                                    type="email"
                                    icon={Mail}
                                    placeholder="name@workshop.local" 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    required 
                                />
                                <Input 
                                    label="Password" 
                                    type="password"
                                    icon={Lock}
                                    placeholder={editingStaff ? "Leave blank to keep" : "Minimum 6 characters..."} 
                                    value={formData.password} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                    required={!editingStaff} 
                                />
                                
                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex gap-4 items-center">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <Shield size={20} />
                                    </div>
                                    <p className="text-[10px] font-semibold text-slate-500 leading-tight uppercase tracking-tight">
                                        Role assignment: <span className="text-slate-200">Staff</span>. Elevated privileges are managed by Admin.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" className="flex-2 gap-3 shadow-glow-blue">
                                        <Save size={18} />
                                        <span>{editingStaff ? 'Update Staff' : 'Save Staff'}</span>
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

export default ManageStaff;
