
import React, { useState, useEffect } from 'react';
import AssignPlanModal from '../../components/AssignPlanModal';
import { SubscriptionPlan, PlanDetails, PatientPlanConfig, PatientPlatformAnalytics } from '../../types';
import { CheckIcon, XIcon, PencilIcon, CurrencyDollarIcon, RocketLaunchIcon, ShieldCheckIcon } from '../../constants';
import { getPlans, updatePlanPrice, getPatientPlanConfigs, updatePatientPlanConfig, getPatientPlatformAnalytics } from '../../services/mockApi';
import DashboardCard from '../../components/DashboardCard';
import { motion, AnimatePresence } from 'motion/react';

const PlanCard: React.FC<{ plan: PlanDetails }> = ({ plan }) => (
    <div className={`bg-white rounded-3xl shadow-xl p-8 flex flex-col border-t-8 ${plan.color} transition-all hover:shadow-2xl hover:-translate-y-1`}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className={`text-2xl font-black uppercase tracking-tighter ${plan.color.replace('border', 'text')}`}>{plan.name}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.subtitle}</p>
            </div>
            {plan.isPopular && (
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-indigo-600/20">Popular</span>
            )}
        </div>
        
        <div className="flex justify-between items-end my-6">
            <div>
                 <p className="text-4xl font-black text-slate-900 tracking-tighter">${plan.priceMonthly}<span className="text-sm font-bold text-slate-400">/mo</span></p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly</p>
            </div>
             <div className="text-right">
                 <p className="text-4xl font-black text-slate-900 tracking-tighter">${plan.priceYearly}<span className="text-sm font-bold text-slate-400">/yr</span></p>
                 <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{plan.yearlyDiscountPercent}% Off</p>
            </div>
        </div>
        
        <div className="space-y-4 flex-grow">
            <ul className="space-y-3">
                {plan.features.map((feature: string, i: number) => (
                     <li key={i} className="flex items-start text-xs font-bold text-slate-600">
                        <div className="mt-0.5">
                            {feature.toLowerCase().includes('disabled') || feature.toLowerCase().includes('no ') ? <XIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                        </div>
                        <span className="ml-2">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                <span className="text-slate-900">Target:</span> {plan.purpose}
            </p>
        </div>
    </div>
);


const Plans: React.FC = () => {
    const [plans, setPlans] = useState<PlanDetails[]>([]);
    const [patientConfigs, setPatientConfigs] = useState<PatientPlanConfig[]>([]);
    const [analytics, setAnalytics] = useState<PatientPlatformAnalytics | null>(null);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Config State
    const [editingValues, setEditingValues] = useState<Record<string, { monthly: number, yearly: number, discount: number }>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [p, pc, a] = await Promise.all([
            getPlans(),
            getPatientPlanConfigs(),
            getPatientPlatformAnalytics()
        ]);
        setPlans(p);
        setPatientConfigs(pc);
        setAnalytics(a);

        const initValues: Record<string, any> = {};
        p.forEach(plan => {
            initValues[plan.name] = {
                monthly: plan.priceMonthly,
                yearly: plan.priceYearly,
                discount: plan.yearlyDiscountPercent
            };
        });
        setEditingValues(initValues);
        setLoading(false);
    };

    const handleValueChange = (planName: string, field: 'monthly' | 'yearly' | 'discount', value: string) => {
        const numValue = parseFloat(value) || 0;
        setEditingValues(prev => ({
            ...prev,
            [planName]: {
                ...prev[planName],
                [field]: numValue
            }
        }));
    };

    const handleSavePrices = async () => {
        const promises = Object.entries(editingValues).map(([name, vals]: [string, any]) => 
            updatePlanPrice(name as SubscriptionPlan, vals.monthly, vals.yearly, vals.discount)
        );
        await Promise.all(promises);
        fetchData();
        setEditModalOpen(false);
    };

    const handleUpdatePatientConfig = async (config: PatientPlanConfig) => {
        await updatePatientPlanConfig(config);
        fetchData();
    };

    if (loading) return <div className="p-8 font-mono animate-pulse">Syncing Monetization Engine...</div>;

    const conversionRate = analytics ? ((analytics.conversion.paid / (analytics.conversion.paid + analytics.conversion.abandoned)) * 100).toFixed(1) : "0.0";

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Patient Monetization Center</h1>
                    <p className="text-slate-500 font-medium">Control pricing, request quotas, and feature availability for patient tiers.</p>
                </div>
                 <div className="flex gap-4">
                    <button 
                        onClick={() => setEditModalOpen(true)} 
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-black text-xs uppercase rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <PencilIcon className="w-4 h-4" /> Edit Configuration
                    </button>
                    <button 
                        onClick={() => setAssignModalOpen(true)} 
                        className="px-6 py-3 bg-slate-900 text-white font-black text-xs uppercase rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20"
                    >
                        Assign Plan to User
                    </button>
                </div>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <DashboardCard 
                    title="Platform Revenue" 
                    value={`$${analytics?.revenue?.monthly ?? 0}`}
                    icon={<CurrencyDollarIcon />}
                    colorClass="bg-emerald-600"
                />
                <DashboardCard 
                    title="Revenue Growth" 
                    value={`+${analytics?.revenue?.growth ?? 0}%`}
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

            {/* Patient Tiers Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Patient Tiers</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {patientConfigs.map(config => (
                        <div key={config.id} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{config.name?.replace('PATIENT_', '') ?? 'UNKNOWN'} TIER</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Plan ID: {config.id}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.isEnabled} 
                                        onChange={() => handleUpdatePatientConfig({ ...config, isEnabled: !config.isEnabled })} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                            </div>
                            
                            <div className="p-8 space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Price ($)</label>
                                        <input 
                                            type="number" 
                                            value={config.monthlyPrice || 0}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setPatientConfigs(patientConfigs.map(c => c.id === config.id ? {...c, monthlyPrice: isNaN(val) ? 0 : val} : c));
                                            }}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Limit (Req)</label>
                                        <input 
                                            type="number" 
                                            value={config.requestLimit || 0}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setPatientConfigs(patientConfigs.map(c => c.id === config.id ? {...c, requestLimit: isNaN(val) ? 0 : val} : c));
                                            }}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entitlements</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(config.features || []).map((f, i) => (
                                            <span key={i} className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-xl border border-indigo-100">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button 
                                    onClick={() => handleUpdatePatientConfig(config)}
                                    className="px-8 py-3 bg-slate-900 text-white font-black text-xs uppercase rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                                >
                                    Sync Config
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Business Tiers Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Business Tiers</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {plans.map(plan => (
                        <PlanCard key={plan.name} plan={plan} />
                    ))}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <AssignPlanModal onClose={() => setAssignModalOpen(false)} />
                )}
                
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Edit Plan Configuration</h2>
                                <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <XIcon className="w-8 h-8" />
                                </button>
                            </div>
                            
                            <div className="space-y-8">
                                {plans.map(plan => (
                                    <div key={plan.name} className={`p-8 rounded-3xl border border-slate-100 bg-slate-50/50`}>
                                        <h3 className={`font-black text-xl mb-6 uppercase tracking-tighter ${plan.color.replace('border', 'text')}`}>{plan.name}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Price ($)</label>
                                                <input 
                                                    type="number" 
                                                    value={editingValues[plan.name]?.monthly} 
                                                    onChange={(e) => handleValueChange(plan.name, 'monthly', e.target.value)}
                                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Price ($)</label>
                                                <input 
                                                    type="number" 
                                                    value={editingValues[plan.name]?.yearly} 
                                                    onChange={(e) => handleValueChange(plan.name, 'yearly', e.target.value)}
                                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Discount (%)</label>
                                                <input 
                                                    type="number" 
                                                    value={editingValues[plan.name]?.discount} 
                                                    onChange={(e) => handleValueChange(plan.name, 'discount', e.target.value)}
                                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-slate-100">
                                <button 
                                    onClick={() => setEditModalOpen(false)} 
                                    className="px-8 py-4 bg-slate-100 text-slate-600 font-black text-xs uppercase rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSavePrices} 
                                    className="px-10 py-4 bg-slate-900 text-white font-black text-xs uppercase rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Plans;
