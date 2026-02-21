import React, { useState, useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import { getSuperAdminDashboardData } from '../../services/mockApi';
import { useTheme } from '../../contexts/ThemeContext';
import BarChart from '../../components/BarChart';
import UpdateNoticeModal from '../../components/UpdateNoticeModal';
import { Building2, DollarSign, PackageX, Users, Megaphone, Sparkles, Activity, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const salesData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
];

const SuperAdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ totalPharmacies: 0, totalSales: 0, inventoryShortages: 0, newUsersThisMonth: 0 });
    const { theme, setTheme } = useTheme();
    const [isNoticeModalOpen, setNoticeModalOpen] = useState(false);

    useEffect(() => {
        getSuperAdminDashboardData().then(data => setStats(data));
    }, []);
    
    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTheme(e.target.checked ? 'christmas' : 'default');
    }

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <Activity className="w-4 h-4" />
                        Global Platform Analytics
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Network Control</h1>
                    <p className="text-slate-400 font-medium text-lg">Platform-wide performance and system health overview.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <button 
                        onClick={() => setNoticeModalOpen(true)} 
                        className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 font-bold text-sm uppercase tracking-widest"
                    >
                        <Megaphone className="w-5 h-5 text-primary" />
                        Broadcast Update
                    </button>
                    
                    <div className="flex items-center gap-4 bg-white border border-slate-100 p-2 pl-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Holiday Mode</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={theme === 'christmas'} onChange={handleThemeChange} className="sr-only peer" />
                            <div className="w-12 h-7 bg-slate-100 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <DashboardCard 
                    title="Total Pharmacies" 
                    value={stats.totalPharmacies}
                    icon={<Building2 />}
                    colorClass="bg-sky-500"
                />
                <DashboardCard 
                    title="Gross Revenue" 
                    value={`$${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<DollarSign />}
                    colorClass="bg-emerald-500"
                />
                <DashboardCard 
                    title="Inventory Alerts" 
                    value={stats.inventoryShortages}
                    icon={<PackageX />}
                    colorClass="bg-amber-500"
                />
                <DashboardCard 
                    title="New Adoptions" 
                    value={stats.newUsersThisMonth}
                    icon={<Users />}
                    colorClass="bg-violet-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] -mr-40 -mt-40" />
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Platform Growth</h2>
                                <p className="text-sm text-slate-400 font-medium">Aggregate sales performance across all verified pharmacies</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" />
                                +24% YoY
                            </div>
                        </div>
                        
                        <div className="h-80 w-full">
                            <BarChart data={salesData} />
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[60px] -mr-20 -mt-20 group-hover:bg-primary/30 transition-colors" />
                        <div className="relative z-10 space-y-8">
                            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                                <Activity className="w-7 h-7" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black tracking-tight uppercase">System Health</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium">All nodes are operational. Latency is within optimal parameters (42ms).</p>
                            </div>
                            <button className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                                View Status <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-primary rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 blur-[60px] -ml-20 -mb-20" />
                        <div className="relative z-10 space-y-8">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Clock className="w-7 h-7" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black tracking-tight uppercase">Pending Tasks</h3>
                                <p className="text-white/80 text-sm leading-relaxed font-medium">You have <span className="font-black text-white">14 pharmacy approvals</span> and <span className="font-black text-white">3 system updates</span> pending.</p>
                            </div>
                            <button className="w-full py-4 bg-white text-primary font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest shadow-xl shadow-black/10">
                                Review Queue
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {isNoticeModalOpen && <UpdateNoticeModal onClose={() => setNoticeModalOpen(false)} />}
        </div>
    );
};

export default SuperAdminDashboard;
