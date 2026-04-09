import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import { LogOut, Cog, MessageSquare, Star, LayoutDashboard, User, Shield, Briefcase, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from "./ui/Button.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
      className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 group ${
        isActive(to) 
          ? 'text-blue-400 bg-blue-500/10' 
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
      }`}
    >
      <Icon size={16} className={`${isActive(to) ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span>{children}</span>
      {isActive(to) && (
        <motion.div 
            layoutId="nav-active"
            className="absolute inset-0 border border-blue-400/30 rounded-xl pointer-events-none"
        />
      )}
    </Link>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => {
              const dashPath = !user ? '/' : 
                             user.role === 'admin' ? '/admin' : 
                             user.role === 'staff' ? '/staff' : 
                             '/dashboard';
              navigate(dashPath);
            }}
          >
            <div className="bg-blue-600 p-2 rounded-xl shadow-glow-blue-sm group-hover:rotate-12 transition-transform duration-500">
              <Cog className="text-white" size={20} />
            </div>
            <span className="text-xl font-display font-bold text-slate-100 tracking-tighter uppercase">
              Bay<span className="text-gradient">Manager</span>
            </span>
          </motion.div>

          {/* NAVIGATION LINKS */}
          <div className="hidden lg:flex items-center gap-2">
            {user && (
              <>
                {user.role === "admin" && (
                  <>
                    <NavLink to="/admin" icon={LayoutDashboard}>Dashboard</NavLink>
                    <NavLink to="/admin/feedback" icon={MessageSquare}>Feedback</NavLink>
                  </>
                )}
                {user.role === "staff" && (
                  <>
                    <NavLink to="/staff" icon={Briefcase}>Dashboard</NavLink>
                    <NavLink to="/staff/my-ratings" icon={Star}>My Ratings</NavLink>
                  </>
                )}
                {user.role === "customer" && (
                  <>
                    <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                  </>
                )}
              </>
            )}
          </div>

          {/* USER ACTIONS */}
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-8">
                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{user.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-emerald" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                    <Shield size={8} className="text-blue-500" />
                    <span>{user.role} Level Access</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-8 w-px bg-slate-800 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="group flex items-center gap-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all duration-300"
                    >
                      <LogOut size={16} className="text-slate-500 group-hover:text-rose-500 transition-colors" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-400 transition-colors">Log Out</span>
                    </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-100 transition-colors px-4">Login</Link>
                <Button variant="primary" onClick={() => navigate('/register')} className="h-11 px-6 text-xs uppercase font-black tracking-widest gap-2">
                  <span>Register</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>

        </div>
      </nav>
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;
