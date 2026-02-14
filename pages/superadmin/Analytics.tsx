
import React, { useState, useEffect } from 'react';
import { getAdminAnalytics } from '../../services/mockApi';
import { AnalyticsData, SubscriptionPlan } from '../../types';
import DashboardCard from '../../components/DashboardCard';
import { LineChart, DonutChart } from '../../components/SimpleCharts';
import BarChart from '../../components/BarChart';

// Icons
const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>;
const ArchiveBoxXMarkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
const ArrowTrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" /></svg>;

const Analytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getAdminAnalytics().then(setData);
    }, []);

    if (!data) return <div className="p-8 text-center text-slate-500">Loading Business Health Dashboard...</div>;

    // Safety checks for mapping arrays
    const revenueTrendData = (data.revenueHistory || []).map(d => ({ label: d.month, value: d.amount }));
    
    const revenueByPlanData = (data.revenueByPlan || []).map(d => ({
        name: d.name,
        value: d.value
    }));

    const growthTrendData = (data.growthHistory || []).map(d => ({
        label: d.date,
        value: d.new,
        value2: d.churned
    }));

    const subscriptionColors: Record<string, string> = {
        [SubscriptionPlan.BASIC]: '#f59e0b', // amber-500
        [SubscriptionPlan.STANDARD]: '#10b981', // emerald-500
        [SubscriptionPlan.PLATINUM]: '#0ea5e9', // sky-500
    };
    
    const donutData = (data.subscriptionDistribution || [])
        .filter(d => d.value > 0)
        .map(d => ({
            ...d,
            color: subscriptionColors[d.name] || '#64748b'
        }));

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Business Health Dashboard</h1>
                    <p className="text-slate-500 mt-1">Real-time overview of platform performance and financial health.</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated</span>
                    <p className="text-sm font-mono text-slate-600">Just now</p>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total MRR</span>
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CurrencyDollarIcon className="w-5 h-5"/></div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800">${(data.mrr || 0).toLocaleString()}</div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                        <TrendingUpIcon className="w-3 h-3 mr-1" /> +8.2% vs last month
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">NRR</span>
                            <div className="p-2 bg-violet-50 rounded-lg text-violet-600"><TrendingUpIcon className="w-5 h-5"/></div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800">{data.nrr || 0}%</div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Target: &gt;100%
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pharmacies</span>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><UserGroupIcon className="w-5 h-5"/></div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800">{data.activePharmacies || 0}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-600 flex items-center"><TrendingUpIcon className="w-3 h-3 mr-1"/> +{data.newPharmaciesThisMonth || 0} New</span>
                        <span className="text-xs font-bold text-red-500 flex items-center"><ArrowTrendingDownIcon className="w-3 h-3 mr-1"/> -{data.churnedPharmaciesThisMonth || 0} Churned</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Churn Rate</span>
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><ArchiveBoxXMarkIcon className="w-5 h-5"/></div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800">{data.churnRate || 0}%</div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Monthly churn
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold mb-6 text-slate-800">Revenue Breakdown by Plan (MRR)</h2>
                    <div className="h-64">
                        <BarChart data={revenueByPlanData} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold mb-6 text-slate-800">Monthly Revenue Trend</h2>
                    <div className="h-64">
                        <LineChart data={revenueTrendData} color1="#10b981" />
                    </div>
                </div>
            </div>

            {/* Growth & Distribution Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Growth Trend: New vs Churned</h2>
                        <div className="flex gap-4 text-xs font-bold">
                            <span className="flex items-center text-indigo-600"><div className="w-3 h-1 bg-indigo-600 mr-2"></div> New</span>
                            <span className="flex items-center text-pink-500"><div className="w-3 h-1 border-t border-pink-500 border-dashed mr-2"></div> Churned</span>
                        </div>
                    </div>
                    <div className="h-64">
                        <LineChart data={growthTrendData} color1="#4f46e5" color2="#ec4899" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold mb-6 text-slate-800">Plan Distribution (Count)</h2>
                    <div className="h-64 flex flex-col justify-center items-center">
                        <DonutChart data={donutData} size={180} />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800">Recent Signups</h2>
                </div>
                <table className="min-w-full">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Client Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {(data.recentSignups || []).map((client, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{client.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{client.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{new Date(client.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${client.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {client.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Analytics;
