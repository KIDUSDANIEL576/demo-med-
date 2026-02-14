
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPharmacyById, requestUpgrade, getPlans, initiateTelebirrPayment, checkPaymentStatus } from '../../services/mockApi';
import { CheckIcon, XIcon } from '../../constants';
import { SubscriptionPlan, Pharmacy, PlanDetails } from '../../types';

// Icons
const TagIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>;

const PlansAndUpgrade: React.FC = () => {
    const { user } = useAuth();
    const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
    const [plans, setPlans] = useState<PlanDetails[]>([]);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [requestSent, setRequestSent] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

    useEffect(() => {
        if (user?.pharmacyId) {
            getPharmacyById(Number(user.pharmacyId)).then(setPharmacy);
        }
        getPlans().then(setPlans);
    }, [user]);

    const handleUpgrade = async (plan: PlanDetails) => {
        if (!pharmacy) return;
        setLoading(true);

        try {
            // 1. Calculate Amount
            const amount = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

            // 2. Initiate Payment (Scaffold)
            setProcessingPayment(true);
            const transaction = await initiateTelebirrPayment(pharmacy.id, amount);
            
            // 3. Simulate Payment Processing / Polling
            // In a real app, this would redirect to Telebirr or poll an API
            setTimeout(async () => {
                const status = await checkPaymentStatus(transaction.id);
                setProcessingPayment(false);
                
                if (status.status === 'paid' || status.status === 'pending') { 
                     // 4. Send Upgrade Request linked to transaction
                     await requestUpgrade(pharmacy.id, pharmacy.name, plan.name, billingCycle, transaction.id);
                     setRequestSent(plan.name);
                     setPaymentStatus('success');
                } else {
                    setPaymentStatus('failed');
                }
                setLoading(false);
            }, 2000);

        } catch (error) {
            console.error("Upgrade failed", error);
            setLoading(false);
            setProcessingPayment(false);
            setPaymentStatus('error');
        }
    };

    if (!pharmacy) return <div className="p-8 text-center">Loading pharmacy data...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-800">Upgrade Your Pharmacy</h1>
                <p className="mt-4 text-lg text-slate-600">
                    Unlock advanced features like the Doctor Prescription Builder, API Access Port, and Advanced Analytics.
                </p>
                
                {/* Billing Toggle */}
                <div className="flex justify-center items-center mt-8 gap-4">
                    <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-800' : 'text-slate-500'}`}>Monthly</span>
                    <button 
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${billingCycle === 'yearly' ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-200 ease-in-out ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-800' : 'text-slate-500'}`}>
                        Yearly <span className="text-green-600 ml-1">(Save 20%)</span>
                    </span>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 items-start">
                {plans.map(plan => {
                    const isCurrentPlan = pharmacy.plan === plan.name;
                    const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                    
                    return (
                        <div key={plan.id} className={`relative bg-base-300 rounded-xl shadow-xl p-6 flex flex-col border-t-4 ${plan.color} ${plan.isPopular ? 'transform lg:-translate-y-4 lg:shadow-2xl border-primary' : ''}`}>
                             {plan.isPopular && (
                                <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-sm">
                                    Most Popular
                                </div>
                            )}
                            
                            <h2 className={`text-2xl font-bold ${plan.color.replace('border', 'text')}`}>{plan.name}</h2>
                            <p className="text-sm text-slate-500 mb-6">{plan.subtitle}</p>
                            
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-slate-800">${price}</span>
                                <span className="text-slate-500 font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                {billingCycle === 'yearly' && (
                                    <div className="flex items-center gap-1 text-green-600 text-sm font-bold mt-1">
                                        <TagIcon className="w-4 h-4" /> Save ${(plan.priceMonthly * 12) - plan.priceYearly} per year
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4 flex-grow mb-8 border-t border-base-200 pt-6">
                                <ul className="space-y-3">
                                    {plan.features.map((feature: string, i: number) => (
                                         <li key={i} className="flex items-start text-sm text-slate-700">
                                            {feature.toLowerCase().includes('no ') ? (
                                                <XIcon />
                                            ) : (
                                                <CheckIcon />
                                            )}
                                            <span className="ml-2 leading-tight">{feature.replace('No ', '')}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                             <div className="mt-auto">
                                {isCurrentPlan ? (
                                    <button disabled className="w-full text-center px-6 py-3 bg-slate-200 text-slate-500 font-bold rounded-lg cursor-not-allowed">
                                        Current Plan
                                    </button>
                                ) : requestSent === plan.name ? (
                                    <button disabled className="w-full text-center px-6 py-3 bg-green-100 text-green-700 font-bold rounded-lg border border-green-200">
                                        Request Pending
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleUpgrade(plan)}
                                        disabled={loading || processingPayment}
                                        className={`w-full text-center px-6 py-3 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-md ${plan.name === SubscriptionPlan.PLATINUM ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700' : 'bg-slate-800 hover:bg-slate-900'}`}
                                    >
                                        {processingPayment ? 'Processing...' : `Upgrade to ${plan.name}`}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Payment Status Modal / Overlay */}
            {paymentStatus === 'success' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Request Sent!</h3>
                        <p className="text-slate-600 mb-6">
                            Your payment was initiated and the upgrade request has been sent to the admin. You will be notified once approved.
                        </p>
                        <button onClick={() => setPaymentStatus(null)} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default PlansAndUpgrade;
