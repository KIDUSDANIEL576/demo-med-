
import React, { useState, useEffect } from 'react';
import { getProductIntelligence } from '../../services/mockApi';
import { ProductIntelligenceData, SubscriptionPlan } from '../../types';
import DashboardCard from '../../components/DashboardCard';

// Icons
const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-4.5 6.01 6.01 0 00-1.5-4.5m0 9c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm0-9c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ArrowTrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
const LockClosedIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>;

const planColors: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.BASIC]: 'bg-amber-100 text-amber-800 border-amber-200',
    [SubscriptionPlan.STANDARD]: 'bg-green-100 text-green-800 border-green-200',
    [SubscriptionPlan.PLATINUM]: 'bg-sky-100 text-sky-800 border-sky-200',
    [SubscriptionPlan.PATIENT_FREE]: 'bg-slate-100 text-slate-800 border-slate-200',
    [SubscriptionPlan.PATIENT_PAID]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const ProductAnalytics: React.FC = () => {
    const [data, setData] = useState<ProductIntelligenceData | null>(null);

    useEffect(() => {
        getProductIntelligence().then(setData);
    }, []);

    if (!data) return <div className="p-8 text-center text-slate-500">Loading Product Intelligence...</div>;

    const upgradePressure = data.upgradePressure || [];
    const featureAdoption = data.featureAdoption || [];
    const maxHits = upgradePressure.length > 0 ? Math.max(...upgradePressure.map(u => u.paywallHits)) : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Product Intelligence</h1>
                <p className="text-slate-500 mt-1">Analyze feature adoption, time-to-value, and upgrade triggers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard 
                    title="Avg Time to First Inventory Item" 
                    value={`${data.avgTimeSignupToFirstItem ?? 0} Days`}
                    icon={<ClockIcon />}
                    colorClass="bg-indigo-500"
                />
                <DashboardCard 
                    title="Avg Time to First Sale (Activation)" 
                    value={`${data.avgTimeSignupToFirstSale ?? 0} Days`}
                    icon={<ArrowTrendingUpIcon />}
                    colorClass="bg-pink-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <LightBulbIcon className="w-5 h-5 text-amber-500"/> Feature Adoption
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">% of active tenants using specific features</p>
                    </div>
                    <table className="min-w-full">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Feature</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Level</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Adoption</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {featureAdoption.map((feat, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{feat.featureName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${planColors[feat.planRequired]}`}>
                                            {feat.planRequired}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-700 w-8">{feat.usagePercent}%</span>
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${feat.usagePercent > 80 ? 'bg-emerald-500' : feat.usagePercent > 40 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                                                    style={{ width: `${feat.usagePercent}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-400">({feat.totalUsers} users)</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <LockClosedIcon className="w-5 h-5 text-red-500"/> Upgrade Pressure
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Which blocked features are users trying to access?</p>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
                        {upgradePressure.map((item, i) => {
                            const percent = maxHits > 0 ? (item.paywallHits / maxHits) * 100 : 0;
                            const conversionRate = item.paywallHits > 0 ? ((item.upgradeRequests / item.paywallHits) * 100).toFixed(1) : "0.0";
                            
                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="font-bold text-slate-700">{item.featureName}</span>
                                        <span className="text-xs text-slate-500">
                                            <strong className="text-slate-800">{item.paywallHits}</strong> Hits • <strong className="text-green-600">{conversionRate}%</strong> Request Rate
                                        </span>
                                    </div>
                                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-slate-300 rounded-full" 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-green-500 rounded-l-full opacity-80" 
                                            style={{ width: `${maxHits > 0 ? (item.upgradeRequests / maxHits) * 100 * 5 : 0}%` }}
                                            title="Upgrade Requests (Scaled x5)"
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                        <div className="mt-4 flex items-center gap-4 text-xs justify-center">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-300 rounded"></div> CTA Shown (Paywall Hit)</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div> Request Submitted</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductAnalytics;
