
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardCard from '../../components/DashboardCard';
import { getPharmacyAdminDashboardData } from '../../services/mockApi';
import { DollarSign, PackageX, FileCheck, AlertCircle, TrendingUp, ArrowRight, Activity, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const PharmacyDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSalesToday: 0, lowStockItems: 0, prescriptionsFilled: 0, expiringItems: 0 });

    useEffect(() => {
        if (user?.pharmacyId) {
            getPharmacyAdminDashboardData(Number(user.pharmacyId)).then(setStats);
        }
    }, [user]);

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <Activity className="w-4 h-4" />
                        Real-time Analytics
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Pharmacy Overview</h1>
                    <p className="text-slate-400 font-medium">Welcome back, {user?.name.split(' ')[0]}. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <Clock className="w-4 h-4" />
                        Last Sync: Just Now
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <div className="cursor-pointer" onClick={() => navigate('/dashboard/sales')}>
                    <DashboardCard 
                        title="Sales Today" 
                        value={`$${stats.totalSalesToday.toFixed(2)}`}
                        icon={<DollarSign />}
                        colorClass="bg-emerald-500"
                    />
                </div>
                 <div className="cursor-pointer" onClick={() => navigate('/dashboard/inventory', { state: { filter: 'lowStock' } })}>
                    <DashboardCard 
                        title="Low Stock" 
                        value={stats.lowStockItems}
                        icon={<PackageX />}
                        colorClass="bg-amber-500"
                    />
                </div>
                 <div className="cursor-pointer" onClick={() => navigate('/dashboard/inventory', { state: { filter: 'expiring' } })}>
                    <DashboardCard 
                        title="Expiring Soon" 
                        value={stats.expiringItems}
                        icon={<AlertCircle />}
                        colorClass="bg-red-500"
                    />
                </div>
                <div className="cursor-pointer" onClick={() => navigate('/dashboard/prescription-lookup')}>
                    <DashboardCard 
                        title="Filled Today" 
                        value={stats.prescriptionsFilled}
                        icon={<FileCheck />}
                        colorClass="bg-primary"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Performance Trends</h2>
                                <p className="text-sm text-slate-400 font-medium">Sales and inventory metrics over the last 30 days</p>
                            </div>
                            <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-colors">
                                <TrendingUp className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="h-64 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Analytics Engine Initializing</p>
                                <p className="text-xs text-slate-300">Recharts visualization will be rendered here</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[60px] -mr-20 -mt-20" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight uppercase">Growth Insights</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Your pharmacy is performing <span className="text-primary font-bold">12% better</span> than last month. Consider restocking top-selling items.</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/dashboard/analytics')}
                        className="relative z-10 w-full py-5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 group"
                    >
                        View Full Reports
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
