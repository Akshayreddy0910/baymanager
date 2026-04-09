import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, TrendingUp, Filter, RefreshCcw, Activity, PieChart as PieChartIcon, BarChart3, Target } from 'lucide-react';
import api from '../../services/api.js';
import { useSocket } from '../../context/SocketContext.jsx';
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

const Reports = () => {
    // 1. Data and State - Preserving existing names
    const [revenueData, setRevenueData] = useState({ totalRevenue: 0, monthlyStats: [] });
    const [serviceDistribution, setServiceDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocket();

    // Design System Chart Colors
    const COLORS = ['#2563eb', '#db2777', '#059669', '#d97706', '#7c3aed', '#4b5563'];

    // Function to fetch analytical data - Preserving logic
    const fetchStats = async () => {
        try {
            const [revRes, servRes] = await Promise.all([
                api.get('/reports/revenue'),
                api.get('/reports/services')
            ]);
            setRevenueData(revRes.data);
            setServiceDistribution(servRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // 2. Real-time Synchronization - Preserving logic
    useEffect(() => {
        if (!socket) return;

        const handlePaymentUpdate = (data) => {
            console.log("💰 Payment detected! Refreshing revenue...", data);
            fetchStats();
        };

        socket.on('payment:success', handlePaymentUpdate);

        return () => {
            socket.off('payment:success', handlePaymentUpdate);
        };
    }, [socket]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <Activity size={40} className="text-blue-400 animate-pulse mb-4 shadow-glow-blue-sm" />
            <p className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">Processing Analytics...</p>
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
                            Business <span className="text-gradient">Intelligence</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-slate-400 font-medium">Real-time financial performance and market data.</p>
                            <div className="h-4 w-px bg-slate-800 hidden md:block" />
                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${socket ? 'text-emerald-400' : 'text-rose-400'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${socket ? 'bg-emerald-400 animate-pulse shadow-glow-emerald' : 'bg-rose-400'}`} />
                                {socket ? 'Live Stream Active' : 'Live Stream Offline'}
                            </div>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={fetchStats} className="gap-3 px-6 h-auto py-4 border-slate-800 uppercase tracking-widest font-black text-xs">
                        <RefreshCcw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Pipeline</span>
                    </Button>
                </motion.div>

                {/* ===== REVENUE OVERVIEW ===== */}
                <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: 0.2 }}
                   className="mt-12"
                >
                    <Card className="relative overflow-hidden group hover:border-blue-400/30 transition-all duration-500">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500 opacity-5 blur-[120px] -mr-48 -mt-48"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 p-8 md:p-12">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-4">
                                    <Target size={14} />
                                    <span>Cumulative Revenue Pipeline</span>
                                </div>
                                <h2 className="text-6xl md:text-8xl font-display font-bold text-slate-100 tracking-tighter leading-none mb-8 uppercase">
                                    ${revenueData.totalRevenue.toLocaleString()}
                                </h2>
                                <div className="flex items-center gap-4 text-emerald-400">
                                    <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center">
                                        <TrendingUp size={16} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">Growth active based on real-time ingestion</span>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-glow-blue-sm group-hover:bg-blue-600 transition-all duration-500 text-slate-100">
                                <DollarSign size={80} strokeWidth={2.5} />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* ===== CHARTS GRID ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Monthly Revenue Chart */}
                    <motion.div
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card className="h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-400/10 border border-blue-400/20 rounded-xl flex items-center justify-center text-blue-400">
                                        <BarChart3 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-slate-100 tracking-tight uppercase">Monetary Performance</h3>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Monthly aggregate revenue</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData.monthlyStats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fontSize: 10, fontWeight: '900', fill: '#475569'}} 
                                            dy={10} 
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fontSize: 10, fontWeight: '900', fill: '#475569'}} 
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#0f172a', 
                                                borderRadius: '16px', 
                                                border: '1px solid #1e293b', 
                                                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)', 
                                                padding: '16px' 
                                            }}
                                            itemStyle={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '12px' }}
                                            cursor={{fill: 'rgba(51, 65, 85, 0.2)'}}
                                        />
                                        <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Service distribution Chart */}
                    <motion.div
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card className="h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-pink-400/10 border border-pink-400/20 rounded-xl flex items-center justify-center text-pink-400">
                                        <Filter size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-slate-100 tracking-tight uppercase">Market Penetration</h3>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Service category breakdown</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={serviceDistribution}
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {serviceDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#0f172a', 
                                                borderRadius: '16px', 
                                                border: '1px solid #1e293b', 
                                                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)', 
                                                padding: '16px' 
                                            }}
                                            itemStyle={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '12px' }}
                                        />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            height={36} 
                                            iconType="circle" 
                                            wrapperStyle={{paddingTop: '20px', fontWeight: '900', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b'}} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
