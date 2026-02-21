
import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import BarChart from '../../components/BarChart';
import { getPharmacySales } from '../../services/mockApi';
import { analyzeSalesWithAI } from '../../services/aiService';
import { Sale } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { Sparkles, Download, TrendingUp, Activity, Clock, ArrowRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const SalesReports: React.FC = () => {
    const { user } = useAuth();
    const { hasAccess, checkAccess } = usePlanAccess();
    const [sales, setSales] = useState<Sale[]>([]);
    const [timeFilter, setTimeFilter] = useState('Daily');
    
    // AI State
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        checkAccess('export_reports');
        if (user?.pharmacyId) {
            getPharmacySales(Number(user.pharmacyId)).then(setSales);
        }
    }, [user]);

    const handleAIAnalysis = async () => {
        setAiLoading(true);
        try {
            const insights = await analyzeSalesWithAI(filteredSales.slice(0, 50));
            setAiInsights(insights || 'No insights available.');
        } catch (err) {
            alert("AI Analysis failed.");
        } finally {
            setAiLoading(false);
        }
    };

    const filteredSales = useMemo(() => {
        const now = new Date();
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            if (timeFilter === 'Daily') return saleDate.toDateString() === now.toDateString();
            if (timeFilter === 'Weekly') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return saleDate > oneWeekAgo;
            }
            if (timeFilter === 'Monthly') return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            return true;
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, timeFilter]);

    const chartData = useMemo(() => {
        const aggregation = filteredSales.reduce((acc, sale) => {
            const key = sale.date;
            acc[key] = (acc[key] || 0) + sale.totalPrice;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(aggregation).map(([name, value]) => ({ name, value })).slice(0, 10);
    }, [filteredSales]);

    const totalRevenue = useMemo(() => {
        return filteredSales.reduce((s, x) => s + x.totalPrice, 0);
    }, [filteredSales]);

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <TrendingUp className="w-4 h-4" />
                        Financial Intelligence
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Sales Reports</h1>
                    <p className="text-slate-400 font-medium text-lg">Analyze revenue streams and transaction history.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button 
                        onClick={handleAIAnalysis}
                        disabled={aiLoading || sales.length === 0}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 font-bold text-sm uppercase tracking-widest disabled:bg-slate-200"
                    >
                        <Sparkles className={`w-5 h-5 text-primary ${aiLoading ? 'animate-pulse' : ''}`} />
                        {aiLoading ? 'Analyzing...' : 'AI Insights'}
                    </button>
                    {hasAccess('export_reports') && (
                        <button className="p-4 bg-white border border-slate-100 text-slate-500 rounded-2xl hover:text-primary hover:shadow-lg transition-all">
                            <Download className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {aiInsights && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-primary rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-black uppercase tracking-widest text-white/80 text-xs">Gemini Clinical Brief</h3>
                                </div>
                                <button onClick={() => setAiInsights(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>
                            <div className="prose prose-invert max-w-none">
                                <div className="markdown-body text-lg font-bold leading-relaxed italic">
                                    <ReactMarkdown>{aiInsights}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Revenue Flow</h2>
                                <p className="text-sm text-slate-400 font-medium">Transaction volume over selected period</p>
                            </div>
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                {['Daily', 'Weekly', 'Monthly'].map(filter => (
                                    <button 
                                        key={filter} 
                                        onClick={() => setTimeFilter(filter)} 
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${timeFilter === filter ? 'bg-white text-primary shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <BarChart data={chartData} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center text-center space-y-6">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[60px] -mr-20 -mt-20" />
                    <div className="space-y-2">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Total Revenue</p>
                        <p className="text-6xl font-black tracking-tighter">${totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            +12.5% Growth
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Efficiency</p>
                        <p className="text-xl font-black mt-1">98.4%</p>
                    </div>
                </div>
            </div>

            <DataTable<Sale>
                columns={[
                    { key: 'date', header: 'Timestamp' },
                    { key: 'medicineName', header: 'Medicine Sold' },
                    { key: 'quantity', header: 'Qty' },
                    { key: 'totalPrice', header: 'Revenue' },
                    { key: 'soldBy', header: 'Clerk' }
                ]}
                data={filteredSales}
                renderRow={(sale) => (
                    <>
                        <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">{sale.date}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sale.timestamp}</span>
                            </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-700">{sale.medicineName}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">{sale.quantity}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-sm font-black text-primary">${sale.totalPrice.toFixed(2)}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                    {sale.soldBy.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{sale.soldBy}</span>
                            </div>
                        </td>
                    </>
                )}
            />
        </div>
    );
};

export default SalesReports;
