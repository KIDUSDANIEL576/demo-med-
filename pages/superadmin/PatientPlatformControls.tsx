
import React, { useState, useEffect } from 'react';
import { 
    getSafetySettings, 
    updateSafetySettings, 
    getPatientPlatformAnalytics, 
    getAbuseLogs 
} from '../../services/mockApi';
import { SafetySettings, AbuseLog, PatientPlatformAnalytics } from '../../types';
import { ShieldCheckIcon, ExclamationTriangleIcon, ChartBarIcon, CpuChipIcon } from '../../constants';
import { LineChart, DonutChart } from '../../components/SimpleCharts';

const PatientPlatformControls: React.FC = () => {
    const [settings, setSettings] = useState<SafetySettings | null>(null);
    const [analytics, setAnalytics] = useState<PatientPlatformAnalytics | null>(null);
    const [logs, setLogs] = useState<AbuseLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [s, a, l] = await Promise.all([
            getSafetySettings(),
            getPatientPlatformAnalytics(),
            getAbuseLogs()
        ]);
        setSettings(s);
        setAnalytics(a);
        setLogs(l || []);
        setLoading(false);
    };

    const handleToggleSetting = async (key: keyof SafetySettings) => {
        if (!settings) return;
        const updated = { ...settings, [key]: !settings[key] };
        setSettings(updated); 
        await updateSafetySettings(updated);
    };

    const handleRateLimitChange = async (val: number) => {
        if (!settings) return;
        const updated = { ...settings, maxRequestsPerDay: val };
        setSettings(updated);
        await updateSafetySettings(updated);
    };

    if (loading || !settings || !analytics) return <div className="p-8 font-mono animate-pulse">Syncing Safety Protocols...</div>;

    const conversionData = [
        { name: 'Paid', value: analytics.conversion?.paid ?? 0, color: '#10b981' },
        { name: 'Abandoned', value: analytics.conversion?.abandoned ?? 0, color: '#f59e0b' },
        { name: 'In Queue', value: analytics.conversion?.inQueue ?? 0, color: '#6366f1' }
    ];

    const dailyVolume = (analytics.dailyVolume || []).map(d => ({ label: d.date, value: d.count }));
    const topSearched = analytics.topSearched || [];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Platform Control Center</h1>
                    <p className="text-slate-500 font-medium">Safely manage patient growth, prevent abuse, and monitor telemetry.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">System Pulse</span>
                    <div className={`w-3 h-3 rounded-full ${settings.platformEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Kill Switch</h3>
                        <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-900">Platform Enabled</p>
                                <p className="text-xs text-slate-500">Shut down patient access instantly.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.platformEnabled} onChange={() => handleToggleSetting('platformEnabled')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                                <p className="font-bold text-slate-900">Pause New Requests</p>
                                <p className="text-xs text-slate-500">Search only; block payments.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.requestsPaused} onChange={() => handleToggleSetting('requestsPaused')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Rate Limiting</h3>
                        <CpuChipIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase">Daily Request Capacity</label>
                        <input 
                            type="range" 
                            min="10" 
                            max="500" 
                            step="10"
                            value={settings.maxRequestsPerDay}
                            onChange={(e) => handleRateLimitChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between items-end pt-2">
                            <span className="text-3xl font-black text-slate-900">{settings.maxRequestsPerDay}</span>
                            <span className="text-xs font-bold text-slate-400">Requests / Day</span>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-600 rounded-2xl p-6 shadow-xl text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black uppercase tracking-widest text-sm opacity-80">Utilization</h3>
                        <ChartBarIcon className="w-5 h-5 opacity-80" />
                    </div>
                    <div className="text-5xl font-black mb-1">{settings.maxRequestsPerDay > 0 ? ((settings.currentDailyCount / settings.maxRequestsPerDay) * 100).toFixed(0) : 0}%</div>
                    <p className="text-indigo-100 text-sm font-bold uppercase tracking-tight">Capacity Filled Today</p>
                    <div className="mt-4 h-2 bg-indigo-900/50 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${settings.maxRequestsPerDay > 0 ? (settings.currentDailyCount/settings.maxRequestsPerDay)*100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide mb-6">Requests Per Day (Trend)</h2>
                    <div className="h-64">
                        <LineChart data={dailyVolume} color1="#6366f1" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide mb-6">Paid vs Abandoned</h2>
                    <div className="h-64">
                        <DonutChart data={conversionData} size={180} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-black text-slate-800 uppercase tracking-wide text-sm">Security & Abuse Log</h2>
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Timestamp</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Event</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.length > 0 ? logs.map(log => (
                                    <tr key={log.id} className="hover:bg-red-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                log.type === 'rate_limit_hit' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {log.type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600">
                                            {log.details}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="p-10 text-center text-slate-400 italic font-mono uppercase tracking-tighter">Clear horizon. No security incidents logged.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                        <h2 className="font-black text-slate-800 uppercase tracking-wide text-sm">Top Searched Medicines</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {topSearched.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div className="text-sm font-bold text-slate-700">{item.name}</div>
                                <div className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded">{item.hits} searches</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientPlatformControls;
