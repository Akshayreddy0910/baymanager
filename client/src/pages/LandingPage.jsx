import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Activity, ChevronRight, Wrench, Users, CreditCard, CheckCircle, Cog, ArrowRight } from 'lucide-react';
import Hero3DScene from "../components/Hero3DScene.jsx";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans overflow-x-hidden selection:bg-blue-500/30">
      {/* 
        HERO SECTION 
        Premium dark theme hero with a sleek modern vibe
      */}
      <section className="relative bg-slate-950 pt-32 lg:pt-48 pb-32 lg:pb-48 overflow-hidden">
        {/* Abstract animated glowing background elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[128px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[128px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* LEFT COLUMN: HERO CONTENT */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-full px-5 py-2 mb-10 shadow-glow-blue-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-glow-blue"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">BayManager Engine v2.0 Ready</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-white tracking-tighter mb-10 leading-[0.9]">
                Orchestrate <br className="hidden lg:block"/>
                <span className="text-gradient drop-shadow-2xl">
                   Your Garage.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 font-medium mb-12 leading-relaxed">
                A real-time, relentlessly synchronized ecosystem for modern auto shops. Seamlessly connect customers, mechanics, and dispatchers in one ultra-fast portal.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <Link to="/register" className="w-full sm:w-auto bg-blue-600 text-white px-12 py-6 rounded-2xl font-black text-lg hover:bg-blue-500 hover:shadow-glow-blue hover:-translate-y-1 transition-all flex items-center justify-center space-x-3 group">
                  <span>Create Free Account</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto bg-slate-900 text-slate-300 border border-slate-800 px-12 py-6 rounded-2xl font-black text-lg hover:bg-slate-800 hover:text-white hover:-translate-y-1 transition-all">
                  Login to Portal
                </Link>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: 3D SCENE */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative perspective-1000"
            >
              <Hero3DScene />
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-32 bg-slate-900/50 backdrop-blur-xl text-white py-10 rounded-[3rem] shadow-glow-blue-sm border border-slate-800/50"
          >
            <div className="flex flex-col md:flex-row items-center justify-around gap-10 px-12 text-[10px] font-black uppercase tracking-[0.3em]">
                <div className="flex items-center space-x-4 group cursor-default">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 group-hover:shadow-glow-blue-sm transition-all">
                        <Activity size={24} className="animate-pulse" />
                    </div>
                    <span className="text-slate-400">WebSocket Real-Time Sync</span>
                </div>
                <div className="flex items-center space-x-4 group cursor-default">
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 group-hover:shadow-glow-blue-sm transition-all">
                        <ShieldCheck size={24} />
                    </div>
                    <span className="text-slate-400">Enterprise Grade Security</span>
                </div>
                <div className="flex items-center space-x-4 group cursor-default">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover:shadow-glow-emerald-sm transition-all">
                        <Zap size={24} />
                    </div>
                    <span className="text-slate-400">Instant Operations</span>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 
        ROLES SECTION (Animated Cards)
      */}
      <section className="py-48 bg-slate-900/30 relative">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-32">
             <h2 className="text-5xl md:text-7xl font-display font-black text-slate-100 tracking-tighter mb-6 uppercase">One System. <span className="text-gradient">Complete Harmony.</span></h2>
             <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">Every module is interconnected. Total operational transparency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Customer Role */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-slate-900/50 backdrop-blur-xl rounded-[3rem] p-12 border border-slate-800/50 hover:border-blue-500/30 transition-all duration-500 group shadow-lg"
            >
               <div className="bg-blue-500/10 w-24 h-24 rounded-[2rem] border border-blue-500/20 flex items-center justify-center text-blue-400 mb-10 group-hover:shadow-glow-blue-sm transition-all duration-500">
                  <CreditCard size={40} />
               </div>
               <h3 className="text-3xl font-display font-bold text-slate-100 mb-6 tracking-tight uppercase">For Customers</h3>
               <p className="text-slate-400 leading-relaxed font-bold text-sm mb-10 h-24">
                  Book services instantly, track vehicle repair status in real-time, and pay digital invoices securely powered by Stripe.
               </p>
               <ul className="space-y-4 pt-10 border-t border-slate-800">
                  <li className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-500"><CheckCircle size={18} className="text-blue-500" /><span>Secure Garage</span></li>
                  <li className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-500"><CheckCircle size={18} className="text-blue-500" /><span>Stripe Billing</span></li>
                  <li className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-500"><CheckCircle size={18} className="text-blue-500" /><span>Live Status</span></li>
               </ul>
            </motion.div>

            {/* Admin Role */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-slate-900/50 backdrop-blur-xl rounded-[3rem] p-12 border border-slate-800/50 hover:border-purple-500/30 transition-all duration-500 group shadow-lg"
            >
               <div className="bg-purple-500/10 w-24 h-24 rounded-[2rem] border border-purple-500/20 flex items-center justify-center text-purple-400 mb-10 group-hover:shadow-glow-purple-sm transition-all duration-500">
                  <Activity size={40} />
               </div>
               <h3 className="text-3xl font-display font-bold text-slate-100 mb-6 tracking-tight uppercase">For Administration</h3>
               <p className="text-slate-400 leading-relaxed font-bold text-sm mb-10 h-24">
                  Dispatch jobs, analyze revenue charts, and manage the entire facility from an omniscient dashboard.
               </p>
               <ul className="space-y-4 pt-10 border-t border-slate-800">
                  <li className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-500"><CheckCircle size={18} className="text-purple-500" /><span>Live Analytics</span></li>
                  <li className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-500"><CheckCircle size={18} className="text-purple-500" /><span>Smart Dispatch</span></li>
                  <li className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-500"><CheckCircle size={18} className="text-purple-500" /><span>Deep Insight</span></li>
               </ul>
            </motion.div>

            {/* Staff Role */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-slate-900/50 backdrop-blur-xl rounded-[3rem] p-12 border border-slate-800/50 hover:border-emerald-500/30 transition-all duration-500 group shadow-lg"
            >
               <div className="bg-emerald-500/10 w-24 h-24 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-10 group-hover:shadow-glow-emerald-sm transition-all duration-500">
                  <Wrench size={40} />
               </div>
               <h3 className="text-3xl font-display font-bold text-slate-100 mb-6 tracking-tight uppercase">For Mechanics</h3>
               <p className="text-slate-400 leading-relaxed font-bold text-sm mb-10 h-24">
                  No more paperwork. Receive live dispatch notifications instantly and execute digital job cards efficiently directly from the bay.
               </p>
               <ul className="space-y-4 pt-10 border-t border-slate-800">
                  <li className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-500"><CheckCircle size={18} className="text-emerald-500" /><span>Dispatch Alerts</span></li>
                  <li className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-500"><CheckCircle size={18} className="text-emerald-500" /><span>Digital Cards</span></li>
                  <li className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-500"><CheckCircle size={18} className="text-emerald-500" /><span>Performance</span></li>
               </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
               <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-glow-blue-sm group-hover:rotate-12 transition-transform duration-500">
                  <Cog size={24} />
               </div>
               <span className="text-2xl font-display font-bold text-slate-100 uppercase tracking-tighter">Bay<span className="text-gradient">Manager</span></span>
            </div>
            <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                <a href="#" className="hover:text-blue-400 transition-colors">Dashboard</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Pricing</a>
                <a href="#" className="hover:text-blue-400 transition-colors">About</a>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">© {new Date().getFullYear()} BayManager Systems. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
