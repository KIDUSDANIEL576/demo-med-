import React, { useState, useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import { getSuperAdminDashboardData } from '../../services/mockApi';
import { useTheme } from '../../contexts/ThemeContext';
import BarChart from '../../components/BarChart';
import { UsersIcon } from '../../constants';
import UpdateNoticeModal from '../../components/UpdateNoticeModal';

// FIX: Update icon components to accept and spread props to allow style overrides from parent components.
const BuildingStorefrontIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const ArchiveBoxXMarkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m0 10l8 4m-8-4v-2.5a1.5 1.5 0 013 0V17m0 0V9.5a1.5 1.5 0 013 0V17m10-5l-3-3m0 0l-3 3m3-3v12" /></svg>;
const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688 0-1.25-.562-1.25-1.25s.562-1.25 1.25-1.25h3.5c.688 0 1.25.562 1.25 1.25s-.562 1.25-1.25 1.25h-3.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84L6.16 19.5a.75.75 0 01-1.06-1.06l4.18-3.66m4.34-4.34l4.18-3.66a.75.75 0 011.06 1.06l-4.18 3.66m-4.34 4.34H14.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>

const salesData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
];

const MedIntelliCareLogo = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
        <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="currentColor"/>
    </svg>
);

const SuperAdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ totalPharmacies: 0, totalSales: 0, inventoryShortages: 0, newUsersThisMonth: 0 });
    const { theme, setTheme } = useTheme();
    const [isNoticeModalOpen, setNoticeModalOpen] = useState(false);

    useEffect(() => {
        getSuperAdminDashboardData().then(data => setStats(data));
    }, []);
    
    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTheme(e.target.checked ? 'christmas' : 'default');
    }

    const backgroundStyle = {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M20 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm20-20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-20-20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'/%3E%3C/g%3E%3C/svg%3E")`
    };

    return (
        <div className="space-y-8 p-4 rounded-lg" style={backgroundStyle}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <MedIntelliCareLogo />
                    <div>
                         <h1 className="text-3xl font-bold text-slate-800">Super Admin Dashboard</h1>
                         <p className="text-slate-500 mt-1">Welcome back! Here's an overview of the platform's activity.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={() => setNoticeModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90">
                        <MegaphoneIcon />
                        Update Notice
                    </button>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-slate-600">🎄 Holiday Theme</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={theme === 'christmas'} onChange={handleThemeChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                    title="Total Pharmacies" 
                    value={stats.totalPharmacies}
                    icon={<BuildingStorefrontIcon />}
                    colorClass="bg-sky-500"
                />
                <DashboardCard 
                    title="Total Sales" 
                    value={`$${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<CurrencyDollarIcon />}
                    colorClass="bg-emerald-500"
                />
                <DashboardCard 
                    title="Inventory Shortages" 
                    value={stats.inventoryShortages}
                    icon={<ArchiveBoxXMarkIcon />}
                    colorClass="bg-amber-500"
                />
                <DashboardCard 
                    title="New Users This Month" 
                    value={stats.newUsersThisMonth}
                    icon={<UsersIcon />}
                    colorClass="bg-violet-500"
                />
            </div>

            <div className="bg-base-300 shadow-lg rounded-lg p-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">Monthly Sales Analytics</h2>
                <BarChart data={salesData} />
            </div>
            {isNoticeModalOpen && <UpdateNoticeModal onClose={() => setNoticeModalOpen(false)} />}
        </div>
    );
};

export default SuperAdminDashboard;