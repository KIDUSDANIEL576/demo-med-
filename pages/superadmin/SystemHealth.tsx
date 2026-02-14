
import React, { useState, useEffect } from 'react';
import { getSystemHealthAnalytics } from '../../services/mockApi';
import { generateExecutiveBriefWithAI } from '../../services/aiService';
import { SystemHealthData } from '../../types';
import DashboardCard from '../../components/DashboardCard';
import { LineChart } from '../../components/SimpleCharts';
import { SparklesIcon } from '../../constants';

const ServerStackIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>;
const ShieldExclamationIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002z" /></svg>;

const SystemHealth: React.FC = () => {
    const [data, setData] = useState<SystemHealthData | null>(null);
    const [brief, setBrief] = useState<string | null>(null);
    const [briefLoading, setBriefLoading] = useState(false);

    useEffect(() => {
        getSystemHealthAnalytics().then(setData);
    }, []);

    const handleGenerateBrief = async () => {
        if (!data) return;
        setBriefLoading(true);
        try {
            const result = await generateExecutiveBriefWithAI(data);
            setBrief(result || 'Brief generation failed.');
        } catch (err) {
            alert("AI Briefing failed.");
        } finally {
            setBriefLoading(false);
        }
    };

    if (!data) return <div className="p-8 text-center text-slate-500 font-mono animate-pulse uppercase tracking-widest">Bootstrapping Telemetry...</div>;

    const dauData = (data.dau || []).map(d => ({ label: d.date, value: d.value }));
    const signupData = (data.signups || []).map(d => ({ label: d.date, value: d.value }));

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                        <ServerStackIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Infrastructure Pulse</h1>
                        <p className="text-slate-500 font-medium">Real-time platform telemetry and integrity monitoring.</p>
                    </div>
                </div>
                <button 
                    onClick={handleGenerateBrief}
                    disabled={briefLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black shadow-xl transition-all disabled:bg-slate-400"
                >
                    <SparklesIcon className="w-4 h-4" />
                    {briefLoading ? 'Analyzing Core...' : 'Executive Briefing'}
                </button>
            </div>

            {brief && (
                <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl border-4 border-slate-800 animate-slide-in-up relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><SparklesIcon className="w-40 h-40" /></div>
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-black text-indigo-400 uppercase tracking-widest text-sm">Gemini AI Executive Summary</h3>
                        <button onClick={() => setBrief(null)} className="text-slate-500 hover:text-white">&times;</button>
                    </div>
                    <div className="text-lg font-medium leading-relaxed whitespace-pre-wrap font-mono">
                        {brief}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-4 text-slate-400 text-center">Daily Active Users (DAU)</h2>
                    <div className="h-64">
                        <LineChart data={dauData} color1="#3b82f6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-4 text-slate-400 text-center">In-Network Tenant Growth</h2>
                    <div className="h-64">
                        <LineChart data={signupData} color1="#10b981" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Audit Deletions" value={data.riskMetrics?.inventoryDeletions ?? 0} icon={<ShieldExclamationIcon/>} colorClass="bg-red-500" />
                <DashboardCard title="Integrity Alerts" value={data.integrityIndicators?.failedOperations ?? 0} icon={<ShieldExclamationIcon/>} colorClass="bg-amber-500" />
                <DashboardCard title="Anomalous Traffic" value="0.2%" icon={<ShieldExclamationIcon/>} colorClass="bg-indigo-600" />
            </div>
        </div>
    );
};

export default SystemHealth;
