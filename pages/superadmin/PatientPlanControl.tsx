
import React, { useState, useEffect } from 'react';
import { getPatientPlanConfigs, updatePatientPlanConfig, getPatientPlatformAnalytics } from '../../services/mockApi';
import { PatientPlanConfig, PatientPlatformAnalytics } from '../../types';
import DashboardCard from '../../components/DashboardCard';
import { CurrencyDollarIcon, RocketLaunchIcon, ShieldCheckIcon } from '../../constants';

const PatientPlanControl: React.FC = () => {
    const [configs, setConfigs] = useState<PatientPlanConfig[]>([]);
    const [analytics, setAnalytics] = useState<PatientPlatformAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [c, a] = await Promise.all([
            getPatientPlanConfigs(),
            getPatientPlatformAnalytics()
        ]);
        setConfigs(c || []);
        setAnalytics(a);
        setLoading(false);
    };

    const handleUpdate = async (config: PatientPlanConfig) => {
        await updatePatientPlanConfig(config);
        fetchData();
        alert(`${config.name} updated successfully.`);
    };

    const toggleEnabled = (config: PatientPlanConfig) => {
        handleUpdate({ ...config, isEnabled: !config.isEnabled });
    };

    if (loading || !analytics) return <div className="p-8 font-mono animate-pulse">Syncing Monetization Engine...</div>;

    const conversionPaid = analytics.conversion?.paid ?? 0;
    const conversionAbandoned = analytics.conversion?.abandoned ?? 0;
    const totalConversions = conversionPaid + conversionAbandoned;
    const conversionRate = totalConversions > 0 ? ((conversionPaid / totalConversions) * 100).toFixed(1) : "0.0";

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Patient Monetization Center</h1>
                <p className="text-slate-500 font-medium">Control pricing, request quotas, and feature availability for patient tiers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                    title="Platform Revenue" 
                    value={`$${analytics.revenue?.monthly ?? 0}`}
                    icon={<CurrencyDollarIcon />}
                    colorClass="bg-emerald-600"
                />
                <DashboardCard 
                    title="Revenue Growth" 
                    value={`+${analytics.revenue?.growth ?? 0}%`}
                    icon={<RocketLaunchIcon />}
                    colorClass="bg-indigo-600"
                />
                <DashboardCard 
                    title="Conversion" 
                    value={`${conversionRate}%`}
                    icon={<ShieldCheckIcon />}
                    colorClass="bg-violet-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {configs.map(config => (
                    <div key={config.id} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{config.name?.replace('PATIENT_', '') ?? 'UNKNOWN'} TIER</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Plan ID: {config.id}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={config.isEnabled} onChange={() => toggleEnabled(config)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>
                        
                        <div className="p-8 space-y-6 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Price ($)</label>
                                    <input 
                                        type="number" 
                                        value={config.monthlyPrice}
                                        onChange={(e) => setConfigs(configs.map(c => c.id === config.id ? {...c, monthlyPrice: parseFloat(e.target.value)} : c))}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Limit (Req)</label>
                                    <input 
                                        type="number" 
                                        value={config.requestLimit}
                                        onChange={(e) => setConfigs(configs.map(c => c.id === config.id ? {...c, requestLimit: parseInt(e.target.value)} : c))}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entitlements</label>
                                <div className="flex flex-wrap gap-2">
                                    {(config.features || []).map((f, i) => (
                                        <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg border border-indigo-100">
                                            {f}
                                        </span>
                                    ))}
                                    {(!config.features || config.features.length === 0) && (
                                        <span className="text-xs text-slate-400 italic">No features defined.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => handleUpdate(config)}
                                className="px-6 py-2 bg-slate-900 text-white font-black text-xs uppercase rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                            >
                                Sync Config
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientPlanControl;
