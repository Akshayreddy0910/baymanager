import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Mail, Lock, Activity, ArrowRight, ShieldCheck, Car } from 'lucide-react';
import { loginUser } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const Login = () => {
  // 1. State hooks for managing form input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // 2. Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Execute the login request through our auth service
      const data = await loginUser({ email, password });

      // Save user details and token to the global AuthContext
      login(data.user, data.token);

      // 3. User Role Based Routing Logic
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-10 border-slate-800 shadow-glow-blue">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 shadow-glow-blue-sm"
            >
              <Car size={32} />
            </motion.div>
            <h2 className="text-4xl font-display font-bold text-slate-100 tracking-tighter uppercase mb-2">
              Bay<span className="text-gradient">Manager</span>
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Login</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-glow-rose-sm"
            >
              <Activity size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Email Address" 
              type="email"
              icon={Mail}
              placeholder="Enter email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input 
              label="Password" 
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-6 mt-4 gap-3 shadow-glow-blue uppercase font-black tracking-widest text-xs h-auto"
                disabled={loading}
            >
              {loading ? (
                <Activity size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            Don't have an account? <span className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer" onClick={() => navigate('/register')}>Register here</span>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
