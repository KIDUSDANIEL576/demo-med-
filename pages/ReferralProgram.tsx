
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getReferralCode, getReferralStats, getReferralSettings, trackReferralClick } from '../services/mockApi';
import { ReferralStat, ReferralSettings } from '../types';
import DashboardCard from '../components/DashboardCard';
import { GiftIcon } from '../constants';
import ReferralModal from '../components/ReferralModal';

// Icons
const ClipboardDocumentIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>;
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CursorArrowRaysIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" /></svg>;

const ReferralProgram: React.FC = () => {
    const { user } = useAuth();
    const [referralCode, setReferralCode] = useState('');
    const [referralLink, setReferralLink] = useState('');
    const [stats, setStats] = useState<ReferralStat>({ totalReferrals: 0, successfulReferrals: 0, pendingRewards: 0, totalClicks: 0, discountEarned: 'None' });
    const [settings, setSettings] = useState<ReferralSettings | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refreshData = async () => {
        if (!user) return;
        const [code, statsData, settingsData] = await Promise.all([
            getReferralCode(user.id),
            getReferralStats(user.id),
            getReferralSettings()
        ]);
        setReferralCode(code);
        setReferralLink(`https://medintellicare.com/signup?ref=${code}`);
        setStats(statsData);
        setSettings(settingsData);
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user]);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleSimulateClick = async () => {
        if (referralCode) {
            await trackReferralClick(referralCode);
            refreshData();
            alert("Simulated a click on your referral link! Check the stats update.");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Referral Data...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                    <GiftIcon className="w-64 h-64" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-extrabold mb-4">
                        {settings?.programTitle || "Turn your connection into savings.🎁"}
                    </h1>
                    <p className="text-lg text-indigo-100 mb-6 whitespace-pre-line leading-relaxed">
                        {settings?.programMessage || `Share your unique referral link and get 20% off for 2 months each time someone subscribes—no limits, no hassle.`}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg flex items-center gap-2 border border-white/20 flex-grow max-w-xl">
                            <input 
                                type="text" 
                                readOnly 
                                value={referralLink} 
                                className="bg-transparent text-white w-full px-3 py-2 focus:outline-none font-mono text-sm"
                            />
                            <button 
                                onClick={handleCopy}
                                className={`px-4 py-2 rounded font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50'}`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2 rounded-lg font-bold bg-amber-400 text-amber-900 hover:bg-amber-300 shadow-lg transition-transform transform hover:-translate-y-0.5"
                        >
                            Invite Friends
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <DashboardCard 
                    title="Total Referrals" 
                    value={stats.totalReferrals}
                    icon={<ClipboardDocumentIcon />}
                    colorClass="bg-blue-500"
                />
                 <DashboardCard 
                    title="Link Clicks" 
                    value={stats.totalClicks}
                    icon={<CursorArrowRaysIcon />}
                    colorClass="bg-pink-500"
                />
                <DashboardCard 
                    title="Successful Signups" 
                    value={stats.successfulReferrals}
                    icon={<CheckCircleIcon />}
                    colorClass="bg-green-500"
                />
                <DashboardCard 
                    title="Pending Rewards" 
                    value={stats.pendingRewards}
                    icon={<ClockIcon />}
                    colorClass="bg-amber-500"
                />
                <DashboardCard 
                    title="Discount Earned" 
                    value={stats.discountEarned}
                    icon={<CurrencyDollarIcon />}
                    colorClass="bg-violet-500"
                />
            </div>

            {/* Test Helper for Mock Environment */}
            <div className="text-center mt-10">
                <p className="text-slate-500 text-sm mb-2">Development Tool:</p>
                <button 
                    onClick={handleSimulateClick} 
                    className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 text-sm"
                >
                    Simulate Visitor Click
                </button>
            </div>

            {isModalOpen && <ReferralModal referralLink={referralLink} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ReferralProgram;
