import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Shield, ArrowRight, UserPlus, Cog } from 'lucide-react';
import { registerUser } from '../../services/authService.js';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const Register = () => {
  // 1. State hooks for managing form input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 2. Function to handle input changes for all fields dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Function to handle the registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Execute the registration request through our auth service
      await registerUser(formData);

      // On successful registration, take the user to the login screen
      navigate('/login');
    } catch (err) {
      // Display error message if registration fails
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 py-20 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="p-10 border-slate-800 shadow-glow-blue">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ rotate: -20 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="inline-flex p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 shadow-glow-blue-sm"
            >
              <UserPlus size={32} />
            </motion.div>
            <h2 className="text-4xl font-display font-bold text-slate-100 tracking-tighter uppercase mb-2">
                Create <span className="text-gradient">Account</span>
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Register</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold shadow-glow-rose-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Full Name" 
                    name="name"
                    icon={User}
                    placeholder="Enter name..."
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <Input 
                    label="Email Address" 
                    name="email"
                    type="email"
                    icon={Mail}
                    placeholder="Enter email..."
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Phone Number" 
                    name="phone"
                    type="tel"
                    icon={Phone}
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
                <Input 
                    label="Password" 
                    name="password"
                    type="password"
                    icon={Lock}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Account Type</label>
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                        <Shield size={18} />
                    </div>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-800 bg-slate-900 focus:bg-slate-900 focus:border-blue-500 text-slate-100 outline-none font-bold transition-all cursor-pointer appearance-none"
                    >
                        <option value="customer" className="bg-slate-900 border-none outline-none">Customer</option>
                        <option value="staff" className="bg-slate-900 border-none outline-none">Staff</option>
                        <option value="admin" className="bg-slate-900 border-none outline-none">Admin</option>
                    </select>
                </div>
            </div>

            <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-6 mt-4 gap-3 shadow-glow-blue uppercase font-black tracking-widest text-xs h-auto"
                disabled={loading}
            >
              {loading ? (
                <Cog size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            Already have an account? <span className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer" onClick={() => navigate('/login')}>Login here</span>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
