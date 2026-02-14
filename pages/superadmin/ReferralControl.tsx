
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { getAllReferrals, approveReferral, rejectReferral, getReferralSettings, updateReferralSettings } from '../../services/mockApi';
import { Referral, ReferralSettings } from '../../types';
import { CheckIcon, XIcon } from '../../constants';

const ReferralControl: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'requests' | 'settings'>('requests');
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [settings, setSettings] = useState<ReferralSettings>({ 
        discountPercent: 0, 
        discountDurationMonths: 0,
        programTitle: '',
        programMessage: ''
    });
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [refs, sets] = await Promise.all([getAllReferrals(), getReferralSettings()]);
        setReferrals(refs);
        setSettings(sets);
        setLoading(false);
    };

    const handleApprove = async (id: string) => {
        if (window.confirm("Approve this referral? The referrer will receive a discount.")) {
            // Optimistic Update
            setReferrals(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', rewardStatus: 'paid' } : r));
            
            await approveReferral(id);
            // Re-fetch to confirm consistency
            fetchData();
        }
    };

    const handleReject = async (id: string) => {
        if (window.confirm("Reject this referral?")) {
            // Optimistic Update
            setReferrals(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', rewardStatus: 'void' } : r));
            
            await rejectReferral(id);
            // Re-fetch to confirm consistency
            fetchData();
        }
    };

    const handleSettingsSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateReferralSettings(settings);
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const columns = [
        { key: 'referrerName', header: 'Referrer' },
        { key: 'referralCode', header: 'Code' },
        { key: 'newUserName', header: 'Referee' },
        { key: 'clicks', header: 'Clicks' },
        { key: 'status', header: 'Status' },
        { key: 'rewardStatus', header: 'Reward' },
        { key: 'actions', header: 'Actions' },
    ];

    if (loading) return <div className="p-8">Loading Referral Data...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Referral Program Control</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'requests'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'}
                        `}
                    >
                        Referral Requests
                        {referrals.filter(r => r.status === 'pending').length > 0 && (
                            <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
                                {referrals.filter(r => r.status === 'pending').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'settings'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'}
                        `}
                    >
                        Global Settings
                    </button>
                </nav>
            </div>

            {activeTab === 'requests' && (
                <div className="animate-fade-in">
                    <DataTable<Referral>
                        columns={columns}
                        data={referrals}
                        renderRow={(referral) => (
                            <tr key={referral.id} className={referral.status === 'pending' ? 'bg-amber-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{referral.referrerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{referral.referralCode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    <div>{referral.newUserName}</div>
                                    <div className="text-xs text-slate-500">{referral.newUserEmail}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600">{referral.clicks || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                        referral.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                        referral.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'}`
                                    }>
                                        {referral.status}
                                    </span>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                        referral.rewardStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                                        referral.rewardStatus === 'void' ? 'bg-gray-100 text-gray-800' : 
                                        'bg-blue-100 text-blue-800'}`
                                    }>
                                        {referral.rewardStatus || 'pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {referral.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApprove(referral.id)} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Approve Reward">
                                                <CheckIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleReject(referral.id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Reject">
                                                <XIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                    />
                </div>
            )}

            {activeTab === 'settings' && (
                 <div className="animate-fade-in max-w-4xl">
                     <form onSubmit={handleSettingsSave} className="bg-base-300 p-8 rounded-lg shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                             <div>
                                <h3 className="text-xl font-bold text-slate-800">Global Program Configuration</h3>
                                <p className="text-slate-500 text-sm mt-1">Configure the rewards and messaging for the referral program visible to all users.</p>
                             </div>
                             {saveStatus && (
                                 <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-bold animate-fade-in">
                                     {saveStatus}
                                 </span>
                             )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-1 md:col-span-2">
                                 <label className="block text-sm font-semibold text-slate-700 mb-2">Program Title</label>
                                 <input 
                                     type="text" 
                                     value={settings.programTitle || ''} 
                                     onChange={e => setSettings({...settings, programTitle: e.target.value})} 
                                     className="w-full p-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                     placeholder="e.g. Turn your connection into savings.🎁"
                                 />
                                 <p className="text-xs text-slate-500 mt-1">Displayed as the main header on the user's referral page.</p>
                            </div>
                            
                            <div className="col-span-1 md:col-span-2">
                                 <label className="block text-sm font-semibold text-slate-700 mb-2">Program Message</label>
                                 <textarea 
                                     value={settings.programMessage || ''} 
                                     onChange={e => setSettings({...settings, programMessage: e.target.value})} 
                                     className="w-full p-3 rounded-md border border-slate-300 h-32 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                     placeholder="e.g. Share your unique referral link..."
                                 />
                                 <p className="text-xs text-slate-500 mt-1">The body text explaining the reward logic to users.</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Discount Percentage (%)</label>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        value={settings.discountPercent} 
                                        onChange={e => setSettings({...settings, discountPercent: parseInt(e.target.value) || 0})} 
                                        className="w-full p-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none text-lg font-bold text-primary"
                                    />
                                    <span className="ml-3 text-slate-500 font-bold">%</span>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Duration (Months)</label>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={settings.discountDurationMonths} 
                                        onChange={e => setSettings({...settings, discountDurationMonths: parseInt(e.target.value) || 0})} 
                                        className="w-full p-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none text-lg font-bold text-primary"
                                    />
                                    <span className="ml-3 text-slate-500 font-bold">Months</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8 pt-6 border-t border-slate-200">
                            <button type="submit" className="px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-md transition-transform transform hover:-translate-y-1">
                                Save Global Settings
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ReferralControl;
