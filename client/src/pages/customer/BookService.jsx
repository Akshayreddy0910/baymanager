import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Car, ArrowLeft, Wrench, Calendar, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAllVehicles } from '../../services/vehicleService.js';
import { createBooking } from '../../services/bookingService.js';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const BookService = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [vehicles, setVehicles] = useState([]);
    // Preserve exact state variable and shape
    const [formData, setFormData] = useState({ vehicleId: '', serviceType: '', bookingDate: '' });
    const [loading, setLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState('');

    // 1. Load user's vehicles directly from the role-filtered API - Preserving logic
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                // The backend API already filters vehicles by the logged-in customer's ID
                const response = await getAllVehicles();
                setVehicles(response);
                setLoading(false);
            } catch (err) {
                console.error("Vehicle Load Error:", err);
                setError("Could not retrieve your garage. Please try again later.");
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    // 2. Handle Booking Submission - Preserving byte-for-byte logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.vehicleId) {
            setError("Please select a vehicle from your garage first.");
            return;
        }

        try {
            setIsBooking(true);
            // Find the selected vehicle full object to extract the correct customerId
            let selectedCustomer = '';
            for (let i = 0; i < vehicles.length; i++) {
                if (vehicles[i]._id === formData.vehicleId) {
                    // Correctly access the customerId from the vehicle object
                    selectedCustomer = vehicles[i].customerId?._id || vehicles[i].customerId;
                    break;
                }
            }

            if (!selectedCustomer) {
                setIsBooking(false);
                throw new Error("Missing owner information for this vehicle.");
            }

            await createBooking({
                ...formData,
                customerId: selectedCustomer
            });

            // Redirect to history upon success
            navigate('/dashboard/bookings');
        } catch (err) {
            setIsBooking(false);
            setError(err.response?.data?.message || "Booking failed. Ensure all fields are valid.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <Wrench className="w-12 h-12 text-cyan-400 animate-spin mb-4 shadow-glow-cyan-sm" />
                <p className="font-display font-bold text-slate-500 uppercase tracking-widest text-xs">Opening Service Bay...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <div className="max-w-2xl mx-auto px-6 py-8">
                
                {/* Back Button */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/dashboard/bookings")}
                    className="mb-8 hover:bg-slate-900"
                  >
                    <ChevronLeft size={18} className="mr-2" />
                    Back to History
                  </Button>
                </motion.div>

                {/* ===== HEADER ===== */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-10"
                >
                  <h1 className="text-4xl font-display font-bold text-slate-100 uppercase tracking-tighter">
                    Book a <span className="text-gradient">Service</span>
                  </h1>
                  <p className="text-slate-400 mt-2 font-medium">
                    Schedule professional maintenance or repair for your vehicle.
                  </p>
                </motion.div>

                {/* ===== ERROR STATE ===== */}
                {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 p-4 bg-rose-500/10 text-rose-400 rounded-xl flex items-center gap-3 border border-rose-500/20 shadow-glow-rose-sm"
                    >
                        <AlertTriangle size={20} />
                        <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
                    </motion.div>
                )}

                {/* ===== FORM CARD ===== */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border-slate-800 bg-slate-900/40">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Vehicle Selection */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                                <Car size={14} className="text-cyan-400" />
                                Select Registered Vehicle
                            </label>
                            <div className="relative group">
                                <select 
                                    value={formData.vehicleId} 
                                    onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                                    className="w-full px-6 py-4 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:border-cyan-400 transition-all font-bold text-slate-200 outline-none appearance-none cursor-pointer group-hover:border-slate-700"
                                    required
                                >
                                    <option value="" className="bg-slate-950 text-slate-500">-- Choose from your Garage --</option>
                                    {vehicles.map(v => (
                                        <option key={v._id} value={v._id} className="bg-slate-950 text-slate-200">
                                            {v.model} [{v.registrationNumber}]
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-cyan-400 transition-colors">
                                    <Car size={18} />
                                </div>
                            </div>
                            {vehicles.length === 0 && (
                                <p className="text-[10px] text-amber-500 mt-3 font-black uppercase tracking-tighter px-2 flex items-center gap-2">
                                    <AlertTriangle size={12} />
                                    No vehicles found. Add a vehicle in "My Garage" first.
                                </p>
                            )}
                        </div>

                        {/* Service Type Selection */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                                <Wrench size={14} className="text-cyan-400" />
                                Type of Service
                            </label>
                            <div className="relative group">
                                <select 
                                    value={formData.serviceType} 
                                    onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                                    className="w-full px-6 py-4 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:border-cyan-400 transition-all font-bold text-slate-200 outline-none appearance-none cursor-pointer group-hover:border-slate-700"
                                    required
                                >
                                    <option value="" className="bg-slate-950 text-slate-500">-- Select Required Category --</option>
                                    <option value="General Service" className="bg-slate-950 text-slate-200">General Service</option>
                                    <option value="Oil Change" className="bg-slate-950 text-slate-200">Oil Change</option>
                                    <option value="Brake Check" className="bg-slate-950 text-slate-200">Brake Check</option>
                                    <option value="Tire Rotation" className="bg-slate-950 text-slate-200">Tire Rotation</option>
                                    <option value="Engine Tuning" className="bg-slate-950 text-slate-200">Engine Tuning</option>
                                    <option value="Body Work" className="bg-slate-950 text-slate-200">Body Work</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-cyan-400 transition-colors">
                                    <Wrench size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Date Picker - Standardized with custom right icon */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <Calendar size={14} className="text-cyan-400" />
                                Preferred Intake Date
                            </label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.bookingDate}
                                    onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                                    required
                                    className="w-full px-6 py-4 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:border-cyan-400 transition-all font-bold text-slate-200 outline-none cursor-pointer group-hover:border-slate-700 [color-scheme:dark]"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-cyan-400 transition-colors">
                                    <Calendar size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            variant="primary"
                            size="lg"
                            disabled={vehicles.length === 0 || isBooking}
                            className={`w-full shadow-glow-cyan-sm mt-4 uppercase tracking-widest font-black ${isBooking ? 'opacity-80' : ''}`}
                        >
                            {isBooking ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                    <span>Syncing with Garage...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={20} className="mr-2" />
                                    <span>Schedule Booking</span>
                                </>
                            )}
                        </Button>
                    </form>
                  </Card>
                </motion.div>
                
                {/* Footer Metadata */}
                <p className="mt-8 text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                  Secured & Reliable Automotive Management
                </p>
            </div>
        </div>
    );
};

export default BookService;
