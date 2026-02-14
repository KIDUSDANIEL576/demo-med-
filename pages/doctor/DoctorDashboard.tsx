
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardCard from '../../components/DashboardCard';
import { getDoctorDashboardData, mockPrescriptions } from '../../services/mockApi';
import DataTable from '../../components/DataTable';
import { Prescription } from '../../types';

// FIX: Update icon components to accept and spread props to allow style overrides from parent components.
const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const HashtagIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>;
const CodeBracketIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>;

const DoctorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ prescriptionsCreated: 0, lastPrescriptionCode: '' });
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

    useEffect(() => {
        if (user) {
            getDoctorDashboardData(user.id).then(setStats);
            setPrescriptions(mockPrescriptions.filter(p => p.doctorId === user.id));
        }
    }, [user]);

    const columns = [
        { key: 'createdAt', header: 'Date' },
        { key: 'patientName', header: 'Patient Name' },
        { key: 'prescriptionCode', header: 'Code' },
        { key: 'details', header: 'Details' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800">Doctor's Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard 
                    title="Prescriptions Created" 
                    value={stats.prescriptionsCreated}
                    icon={<DocumentTextIcon />}
                    colorClass="bg-sky-500"
                />
                <DashboardCard 
                    title="Last Prescription Code" 
                    value={stats.lastPrescriptionCode}
                    icon={<HashtagIcon />}
                    colorClass="bg-emerald-500"
                />
                
                {/* API ACCESS PORT - DISABLED COMPLIANCE CARD */}
                <div className="bg-base-200 rounded-lg shadow-inner p-6 flex items-center justify-between opacity-60 cursor-not-allowed border-2 border-dashed border-slate-300 relative overflow-hidden group hover:opacity-70 transition-opacity">
                    <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">API Access Port</p>
                            <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold shadow-sm">Coming Soon</span>
                        </div>
                        <p className="text-xl font-bold text-slate-400 mt-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                            </svg>
                            Locked
                        </p>
                    </div>
                    <div className="p-4 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors">
                        <CodeBracketIcon className="h-8 w-8 text-white" />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-slate-800">Recent Prescriptions</h2>
                 {/* FIX: Explicitly provide the 'Prescription' type to the DataTable component to fix type inference issues with the 'renderRow' prop. */}
                 <DataTable<Prescription>
                    columns={columns}
                    data={prescriptions}
                    renderRow={(p) => (
                        <tr key={p.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.createdAt}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.patientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">{p.prescriptionCode}</td>
                            <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-xs">{p.details}</td>
                        </tr>
                    )}
                 />
            </div>
        </div>
    );
};

export default DoctorDashboard;
