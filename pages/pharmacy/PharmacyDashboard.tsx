
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardCard from '../../components/DashboardCard';
import { getPharmacyAdminDashboardData } from '../../services/mockApi';

const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const ArchiveBoxXMarkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m0 10l8 4m-8-4v-2.5a1.5 1.5 0 013 0V17m0 0V9.5a1.5 1.5 0 013 0V17m10-5l-3-3m0 0l-3 3m3-3v12" /></svg>;
const DocumentCheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;

const PharmacyDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSalesToday: 0, lowStockItems: 0, prescriptionsFilled: 0, expiringItems: 0 });

    useEffect(() => {
        if (user?.pharmacyId) {
            getPharmacyAdminDashboardData(Number(user.pharmacyId)).then(setStats);
        }
    }, [user]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">Pharmacy Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="cursor-pointer" onClick={() => navigate('/dashboard/sales')}>
                    <DashboardCard 
                        title="Sales Today" 
                        value={`$${stats.totalSalesToday.toFixed(2)}`}
                        icon={<CurrencyDollarIcon />}
                        colorClass="bg-emerald-500"
                    />
                </div>
                 <div className="cursor-pointer" onClick={() => navigate('/dashboard/inventory', { state: { filter: 'lowStock' } })}>
                    <DashboardCard 
                        title="Low Stock Items" 
                        value={stats.lowStockItems}
                        icon={<ArchiveBoxXMarkIcon />}
                        colorClass="bg-amber-500"
                    />
                </div>
                 <div className="cursor-pointer" onClick={() => navigate('/dashboard/inventory', { state: { filter: 'expiring' } })}>
                    <DashboardCard 
                        title="Expiring Soon" 
                        value={stats.expiringItems}
                        icon={<BellIcon />}
                        colorClass="bg-red-500"
                    />
                </div>
                <div className="cursor-pointer" onClick={() => navigate('/dashboard/prescription-lookup')}>
                    <DashboardCard 
                        title="Prescriptions Filled" 
                        value={stats.prescriptionsFilled}
                        icon={<DocumentCheckIcon />}
                        colorClass="bg-sky-500"
                    />
                </div>
            </div>

             <div className="bg-base-300 shadow-lg rounded-lg p-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">Sales & Inventory Overview</h2>
                <p className="text-slate-600">
                    Charts showing sales trends and inventory levels would be displayed here. (Placeholder for recharts integration)
                </p>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
