
import React, { useState, useEffect } from 'react';
import AssignPlanModal from '../../components/AssignPlanModal';
import { SubscriptionPlan, PlanDetails } from '../../types';
import { CheckIcon, XIcon, PencilIcon } from '../../constants';
import { getPlans, updatePlanPrice } from '../../services/mockApi';

const PlanCard: React.FC<{ plan: PlanDetails }> = ({ plan }) => (
    <div className={`bg-base-300 rounded-lg shadow-lg p-6 flex flex-col border-t-4 ${plan.color}`}>
        <h2 className={`text-2xl font-bold ${plan.color.replace('border', 'text')}`}>{plan.name}</h2>
        <p className="text-sm text-slate-500 mb-2">{plan.subtitle}</p>
        
        <div className="flex justify-between items-end my-4">
            <div>
                 <p className="text-3xl font-bold text-slate-800">${plan.priceMonthly}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                 <p className="text-sm text-slate-400">Monthly</p>
            </div>
             <div className="text-right">
                 <p className="text-3xl font-bold text-slate-800">${plan.priceYearly}<span className="text-sm font-normal text-slate-500">/yr</span></p>
                 <p className="text-sm text-green-600 font-bold">{plan.yearlyDiscountPercent}% Off</p>
            </div>
        </div>
        
        <div className="space-y-4 flex-grow">
            <ul className="space-y-2">
                {plan.features.map((feature: string, i: number) => (
                     <li key={i} className="flex items-start text-sm text-slate-600">
                        {feature.toLowerCase().includes('disabled') || feature.toLowerCase().includes('no ') ? <XIcon /> : <CheckIcon />}
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        <p className="text-xs text-slate-500 italic mt-6 pt-4 border-t border-base-200">{plan.purpose}</p>
    </div>
);


const Plans: React.FC = () => {
    const [plans, setPlans] = useState<PlanDetails[]>([]);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Config State
    const [editingValues, setEditingValues] = useState<Record<string, { monthly: number, yearly: number, discount: number }>>({});

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = () => {
        setLoading(true);
        getPlans().then(data => {
            setPlans(data);
            const initValues: Record<string, any> = {};
            data.forEach(p => {
                initValues[p.name] = {
                    monthly: p.priceMonthly,
                    yearly: p.priceYearly,
                    discount: p.yearlyDiscountPercent
                };
            });
            setEditingValues(initValues);
            setLoading(false);
        });
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
        fetchPlans();
        setEditModalOpen(false);
    };

    if (loading) return <div className="p-8">Loading plans...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Plan Management</h1>
                 <div className="flex gap-4">
                    <button onClick={() => setEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-base-200">
                        <PencilIcon /> Edit Configuration
                    </button>
                    <button onClick={() => setAssignModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                        Assign Plan to User
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {plans.map(plan => (
                    <PlanCard key={plan.name} plan={plan} />
                ))}
            </div>

            {isAssignModalOpen && <AssignPlanModal onClose={() => setAssignModalOpen(false)} />}
            
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
                    <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">Edit Plan Configuration</h2>
                        <div className="space-y-6">
                            {plans.map(plan => (
                                <div key={plan.name} className={`p-4 rounded-lg border-l-4 ${plan.color} bg-white shadow-sm`}>
                                    <h3 className={`font-bold text-lg mb-4 ${plan.color.replace('border', 'text')}`}>{plan.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs text-slate-500 font-bold mb-1">Monthly Price ($)</label>
                                            <input 
                                                type="number" 
                                                value={editingValues[plan.name]?.monthly} 
                                                onChange={(e) => handleValueChange(plan.name, 'monthly', e.target.value)}
                                                className="w-full p-2 bg-white border border-slate-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 font-bold mb-1">Yearly Price ($)</label>
                                            <input 
                                                type="number" 
                                                value={editingValues[plan.name]?.yearly} 
                                                onChange={(e) => handleValueChange(plan.name, 'yearly', e.target.value)}
                                                className="w-full p-2 bg-white border border-slate-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 font-bold mb-1">Yearly Discount (%)</label>
                                            <input 
                                                type="number" 
                                                value={editingValues[plan.name]?.discount} 
                                                onChange={(e) => handleValueChange(plan.name, 'discount', e.target.value)}
                                                className="w-full p-2 bg-white border border-slate-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-slate-200">
                            <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={handleSavePrices} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Plans;
