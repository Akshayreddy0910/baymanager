import React, { useState, useEffect } from 'react';
import { Plus, Car, Trash2, X } from 'lucide-react';
import { getAllVehicles, createVehicle, deleteVehicle } from '../../services/vehicleService.js';

const MyVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ registrationNumber: '', model: '', year: '' });

    // 1. Fetch my vehicles on load
    const loadData = async () => {
        try {
            const data = await getAllVehicles();
            setVehicles(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // 2. Handle CRUD
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await createVehicle(formData);
            setIsModalOpen(false);
            setFormData({ registrationNumber: '', model: '', year: '' });
            loadData();
        } catch (err) {
            alert("Error adding vehicle: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="p-8 font-black animate-pulse">Opening your Garage...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">My Garage</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Manage your registered vehicles</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black flex items-center space-x-2 shadow-2xl shadow-blue-100 transition-transform active:scale-95"
                >
                    <Plus size={20} />
                    <span>Register Vehicle</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {vehicles.map((v) => (
                    <div key={v._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative group overflow-hidden">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                            <Car size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 leading-tight mb-1">{v.model}</h2>
                        <p className="text-gray-400 font-bold mb-6 text-sm">{v.year} Model</p>
                        
                        <div className="bg-gray-900 text-white px-4 py-2 rounded-xl inline-block font-mono font-black text-lg tracking-wider shadow-lg">
                            {v.registrationNumber}
                        </div>

                        {/* Visual flourish */}
                        <div className="absolute top-0 right-0 p-8 text-gray-50 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Car size={120} />
                        </div>
                    </div>
                ))}
                {vehicles.length === 0 && (
                    <div className="col-span-full py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                        <Car size={64} className="text-gray-100 mb-4" />
                        <p className="text-xl font-black text-gray-300 uppercase tracking-widest">No vehicles registered yet</p>
                        <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-black flex items-center gap-1 hover:gap-2 transition-all">
                            Add your first one <Plus size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative border border-gray-100">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors"><X size={28} /></button>
                        
                        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">New Vehicle</h2>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-8">Register a car to book services</p>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Registration Number</label>
                                <input type="text" value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-blue-500 font-bold text-gray-800 outline-none transition-all uppercase" placeholder="e.g. DL-01-AB-1234" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Car Model</label>
                                <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-blue-500 font-bold text-gray-800 outline-none transition-all" placeholder="e.g. Honda City" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manufacturing Year</label>
                                <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-blue-500 font-bold text-gray-800 outline-none transition-all" placeholder="2024" required />
                            </div>
                            
                            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">
                                Add to Garage
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyVehicles;
