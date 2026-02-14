
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getPharmacyById, requestUpgrade, getPlans } from '../services/mockApi';
import { CheckIcon, XIcon } from '../constants';
import { SubscriptionPlan, Pharmacy } from '../types';


const UpgradePlan: React.FC<{ featureName: string }> = ({ featureName }) => {
    const { user } = useAuth();
    const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [requestSent, setRequestSent] = useState<SubscriptionPlan | null>(null);

    useEffect(() => {
        if (user?.pharmacyId) {
            getPharmacyById(Number(user.pharmacyId)).then(setPharmacy);
        }
        getPlans().then(setPlans);
    }, [user]);

    const handleRequestUpgrade = async (plan: SubscriptionPlan) => {
        if (!pharmacy) return;

        // Default to monthly billing when requesting via this quick-upgrade component
        // FIX: Added 5th argument 'QUICK_UPGRADE' to satisfy the function signature.
        await requestUpgrade(pharmacy.id, pharmacy.name, plan, 'monthly', 'QUICK_UPGRADE');
        setRequestSent(plan);
    };

    if(plans.length === 0) return null;

    return (
        <div className="p-4 md:p-8 bg-base-100 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-800">Choose Your Plan</h1>
                <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
                    The feature <span className="font-semibold text-primary">"{featureName}"</span> is not on your plan. Upgrade today to unlock powerful new tools for your pharmacy.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 items-stretch">
                {plans.map(plan => {
                    const isCurrentPlan = user?.plan === plan.name;
                    const isUpgradeTarget = !isCurrentPlan && (plan.name === SubscriptionPlan.STANDARD || plan.name === SubscriptionPlan.PLATINUM);

                    return (
                        <div key={plan.name} className={`bg-base-300 rounded-lg shadow-lg p-6 flex flex-col border-t-4 ${plan.color} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                            <h2 className={`text-2xl font-bold ${plan.color.replace('border', 'text')}`}>{plan.name}</h2>
                            <p className="text-sm text-slate-500 mb-2">{plan.subtitle}</p>
                            <p className="text-4xl font-bold my-4 text-slate-800">${plan.price}<span className="text-lg font-normal text-slate-500">/month</span></p>
                            
                            <div className="space-y-4 flex-grow mb-6">
                                <ul className="space-y-2">
                                    {plan.features.map((feature: string, i: number) => (
                                         <li key={i} className="flex items-start text-sm text-slate-600">
                                            {feature.toLowerCase().includes('disabled') || feature.toLowerCase().includes('no ') ? <XIcon /> : <CheckIcon />}
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                             <div className="mt-auto">
                                {isCurrentPlan ? (
                                    <button disabled className="w-full text-center px-4 py-3 bg-slate-300 text-slate-600 font-bold rounded-md cursor-not-allowed">
                                        Current Plan
                                    </button>
                                ) : requestSent === plan.name ? (
                                    <button disabled className="w-full text-center px-4 py-3 bg-green-500 text-white font-bold rounded-md">
                                        Request Sent!
                                    </button>
                                ) : isUpgradeTarget ? (
                                    <button onClick={() => handleRequestUpgrade(plan.name)} className="w-full text-center px-4 py-3 bg-primary text-white font-bold rounded-md hover:bg-primary/90 transition-colors">
                                        Request Upgrade
                                    </button>
                                ) : (
                                    <button disabled className="w-full text-center px-4 py-3 bg-slate-300 text-slate-600 font-bold rounded-md cursor-not-allowed">
                                        Contact Support
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {requestSent && (
                <div className="mt-8 text-center p-4 bg-emerald-100 text-emerald-800 rounded-lg shadow-md animate-fade-in">
                    <p className="font-semibold">Your upgrade request for the {requestSent} plan has been sent.</p>
                    <p className="text-sm">An administrator will review your request and contact you shortly.</p>
                </div>
            )}
        </div>
    );
};
export default UpgradePlan;
