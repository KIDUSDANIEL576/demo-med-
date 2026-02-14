
import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import BarChart from '../../components/BarChart';
import ReportAnalysisModal from '../../components/ReportAnalysisModal';
import { getPharmacySales } from '../../services/mockApi';
import { analyzeSalesWithAI } from '../../services/aiService';
import { Sale, SubscriptionPlan } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { SparklesIcon } from '../../constants';

const SalesReports: React.FC = () => {
    const { user } = useAuth();
    const { hasAccess, checkAccess } = usePlanAccess();
    const [sales, setSales] = useState<Sale[]>([]);
    const [timeFilter, setTimeFilter] = useState('Daily');
    const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);
    
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

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Business Analytics</h1>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleAIAnalysis}
                        disabled={aiLoading || sales.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg transition-all font-black uppercase text-xs disabled:bg-indigo-300"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        {aiLoading ? 'Gemini is Thinking...' : 'Deep AI Insight'}
                    </button>
                    {hasAccess('export_reports') && (
                        <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-xs uppercase">
                            Export Excel
                        </button>
                    )}
                </div>
            </div>

            {aiInsights && (
                <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-2xl border-b-4 border-indigo-700 animate-slide-in-up relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><SparklesIcon className="w-20 h-20" /></div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black uppercase tracking-widest text-indigo-300 text-xs">Gemini Intelligent Brief</h3>
                        <button onClick={() => setAiInsights(null)} className="text-indigo-400 hover:text-white">&times;</button>
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic">"{aiInsights}"</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-base-300 shadow-xl rounded-2xl p-6 border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-800">Sales Volume Graph</h2>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {['Daily', 'Weekly', 'Monthly'].map(filter => (
                                <button 
                                    key={filter} 
                                    onClick={() => setTimeFilter(filter)} 
                                    className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${timeFilter === filter ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <BarChart data={chartData} />
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 flex flex-col justify-center text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Filtered Revenue</p>
                    <p className="text-5xl font-black text-slate-900">${filteredSales.reduce((s, x) => s + x.totalPrice, 0).toLocaleString()}</p>
                    <p className="text-xs font-bold text-emerald-600 mt-2 uppercase tracking-tighter">Gross Margin: 22.4%</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <DataTable<Sale>
                    columns={[
                        { key: 'date', header: 'Timestamp' },
                        { key: 'medicineName', header: 'Medicine Sold' },
                        { key: 'quantity', header: 'Qty' },
                        { key: 'totalPrice', header: 'Revenue' },
                        { key: 'soldBy', header: 'Assigned Clerk' }
                    ]}
                    data={filteredSales}
                    renderRow={(sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">{sale.date} {sale.timestamp}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{sale.medicineName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">{sale.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-indigo-600">${sale.totalPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium uppercase tracking-tighter">{sale.soldBy}</td>
                        </tr>
                    )}
                />
            </div>
        </div>
    );
};

export default SalesReports;
