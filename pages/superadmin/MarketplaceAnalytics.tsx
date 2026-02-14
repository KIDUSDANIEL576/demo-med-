
import React, { useState, useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import { 
    getMarketplaceAnalytics, 
    getSuppliers, 
    approveSupplier, 
    suspendSupplier,
    getDemandSignals 
} from '../../services/mockApi';
import { MarketplaceStats, PharmaceuticalCompany, DemandSignal } from '../../types';
import { 
    ChartBarIcon, 
    BuildingStorefrontIcon, 
    SparklesIcon, 
    Cog6ToothIcon, 
    UserCheckIcon, 
    UserXIcon,
    ExclamationTriangleIcon 
} from '../../constants';

const MarketplaceAnalytics: React.FC = () => {
    const [stats, setStats] = useState<MarketplaceStats | null>(null);
    const [suppliers, setSuppliers] = useState<PharmaceuticalCompany[]>([]);
    const [demandSignals, setDemandSignals] = useState<DemandSignal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [s, sup, ds] = await Promise.all([
            getMarketplaceAnalytics(),
            getSuppliers(),
            getDemandSignals()
        ]);
        setStats(s);
        setSuppliers(sup || []);
        setDemandSignals(ds || []);
        setLoading(false);
    };

    const handleApprove = async (id: string) => {
        if (window.confirm("Approve this supplier to enter the marketplace?")) {
            await approveSupplier(id);
            fetchData();
        }
    };

    const handleSuspend = async (id: string) => {
        if (window.confirm("Suspend this supplier? They will no longer be able to receive orders.")) {
            await suspendSupplier(id);
            fetchData();
        }
    };

    if (loading || !stats) return <div className="p-8 font-mono">Calculating Marketplace Moat...</div>;

    const pendingSuppliers = suppliers.filter(s => s.status === 'pending');
    const activeSuppliers = suppliers.filter(s => s.status === 'approved');

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Marketplace Intelligence</h1>
                    <p className="text-slate-500 font-medium">Global B2B Supply Ecosystem & Regional Demand Signals</p>
                </div>
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                    <SparklesIcon className="w-5 h-5" /> Admin Hub
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                    title="Gross Volume" 
                    value={`$${(stats.totalVolume ?? 0).toLocaleString()}`}
                    icon={<ChartBarIcon className="w-6 h-6"/>}
                    colorClass="bg-indigo-600"
                />
                <DashboardCard 
                    title="Platform Commission" 
                    value={`$${(stats.totalVolume * 0.025).toLocaleString()}`}
                    icon={<SparklesIcon className="w-6 h-6"/>}
                    colorClass="bg-emerald-600"
                />
                <DashboardCard 
                    title="Active Suppliers" 
                    value={stats.activeSuppliers ?? 0}
                    icon={<BuildingStorefrontIcon className="w-6 h-6"/>}
                    colorClass="bg-blue-500"
                />
                <DashboardCard 
                    title="Supply Gap Signals" 
                    value={demandSignals.length}
                    icon={<ExclamationTriangleIcon className="w-6 h-6"/>}
                    colorClass="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Supplier Approval Queue */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h2 className="font-black text-slate-800 uppercase tracking-wide">Supplier Approval Queue</h2>
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-black">{pendingSuppliers.length} PENDING</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Supplier</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">License</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Regions</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingSuppliers.map(sup => (
                                    <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-black text-slate-800">{sup.legalName}</div>
                                            <div className="text-xs text-slate-400">{sup.contactPerson}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{sup.licenseNumber}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{sup.distributionRegions.join(', ')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleApprove(sup.id)} className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10">
                                                    <UserCheckIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleSuspend(sup.id)} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md shadow-red-500/10">
                                                    <UserXIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingSuppliers.length === 0 && (
                                    <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic font-medium uppercase tracking-tighter">Horizon clear. No pending applications.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reliability Leaderboard */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-black text-slate-800 uppercase tracking-wide">Reliability Leaderboard</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {activeSuppliers.sort((a,b) => b.reliabilityScore - a.reliabilityScore).map((sup, i) => (
                            <div key={sup.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-black text-slate-800">{sup.tradeName}</p>
                                    <div className="flex items-center gap-1">
                                        {[1,2,3,4,5].map(star => (
                                            <span key={star} className={star <= Math.round(sup.reliabilityScore/20) ? 'text-amber-400' : 'text-slate-200'}>★</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-black ${sup.reliabilityScore > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{sup.reliabilityScore}%</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Demand Heatmaps Intelligence */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5"><SparklesIcon className="w-64 h-64" /></div>
                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-indigo-400">Regional Supply Signals</h2>
                        <p className="text-slate-400 font-medium">Shortage forecasting based on anonymized pharmacy depletion rates.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {demandSignals.map(signal => (
                            <div key={signal.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{signal.region}</p>
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${signal.intensity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                </div>
                                <h3 className="font-black text-lg mb-1">{signal.medicineName}</h3>
                                <div className="flex items-end justify-between">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Trend: {signal.trend}</p>
                                    <span className={`text-xs font-black uppercase ${signal.intensity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                                        {signal.intensity} RISK
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceAnalytics;
