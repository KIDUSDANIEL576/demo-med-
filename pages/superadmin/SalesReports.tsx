
import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import DashboardCard from '../../components/DashboardCard';
import { getAllSales, getPharmacies, exportData, getPlatformSales } from '../../services/mockApi';
import { Sale, Pharmacy, PlatformSale } from '../../types';
import { ArrowDownTrayIcon, CreditCardIcon, TrendingUpIcon, UserCheckIcon } from '../../constants';

// FIX: Update icon components to accept and spread props to allow style overrides from parent components.
const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l-2.293 2.293a1 1 0 01-1.414 0L4 12l2.293-2.293a1 1 0 011.414 0L10 12z" /></svg>;
const BuildingStorefrontIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;


const SuperAdminSalesReports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'platform' | 'pharmacy'>('platform');
    const [sales, setSales] = useState<Sale[]>([]);
    const [platformSales, setPlatformSales] = useState<PlatformSale[]>([]);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [pharmacyMap, setPharmacyMap] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        getAllSales().then(setSales);
        getPlatformSales().then(setPlatformSales);
        getPharmacies().then(data => {
            setPharmacies(data);
            const map = new Map<number, string>(data.map(p => [p.id, p.name] as [number, string]));
            setPharmacyMap(map);
        });
    }, []);

    const platformAnalytics = useMemo(() => {
        const total = platformSales.reduce((sum, s) => sum + s.amount, 0);
        const subscriptions = platformSales.filter(s => s.type === 'subscription').reduce((sum, s) => sum + s.amount, 0);
        const patientFees = platformSales.filter(s => s.type === 'patient_fee').reduce((sum, s) => sum + s.amount, 0);
        return { total, subscriptions, patientFees };
    }, [platformSales]);

    const pharmacyAnalytics = useMemo(() => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);

        const medicineCounts = sales.reduce((acc, sale) => {
            acc[sale.medicineName] = (acc[sale.medicineName] || 0) + sale.quantity;
            return acc;
        }, {} as Record<string, number>);
        const topSellingMedicine = Object.keys(medicineCounts).reduce((a, b) => medicineCounts[a] > medicineCounts[b] ? a : b, 'N/A');

        const pharmacySales = sales.reduce((acc, sale) => {
            acc[sale.pharmacyId] = (acc[sale.pharmacyId] || 0) + sale.totalPrice;
            return acc;
        }, {} as Record<number, number>);
        const topPharmacyId = Object.keys(pharmacySales).reduce((a, b) => pharmacySales[parseInt(a)] > pharmacySales[parseInt(b)] ? a : b, '0');
        const topPharmacy = pharmacyMap.get(parseInt(topPharmacyId)) || 'N/A';
        
        return { totalRevenue, topSellingMedicine, topPharmacy };
    }, [sales, pharmacyMap]);

    // FIX: Functional Export Button logic
    const handleExport = () => {
        if (sales.length === 0) {
            alert("No sales data available to export.");
            return;
        }
        
        const exportDataFormatted = sales.map(sale => ({
            'Date': sale.date,
            'Time': sale.timestamp,
            'Pharmacy Name': pharmacyMap.get(sale.pharmacyId) || 'Unknown',
            'Medicine': sale.medicineName,
            'Quantity': sale.quantity,
            'Unit Price': (sale.totalPrice / sale.quantity).toFixed(2),
            'Total Price': sale.totalPrice.toFixed(2),
            'Profit': sale.profitMargin.toFixed(2),
            'Sold By': sale.soldBy
        }));

        exportData(exportDataFormatted, `Global_Sales_Report_${new Date().toISOString().split('T')[0]}`);
    };

    const columns = [
        { key: 'date', header: 'Date' },
        { key: 'pharmacy', header: 'Pharmacy' },
        { key: 'medicineName', header: 'Medicine Sold' },
        { key: 'quantity', header: 'Quantity' },
        { key: 'totalPrice', header: 'Total Price' },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Financial Intelligence</h1>
                    <p className="text-slate-500 font-medium">Comprehensive analysis of platform and network revenue streams.</p>
                </div>
                
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('platform')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'platform' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Platform Revenue
                    </button>
                    <button 
                        onClick={() => setActiveTab('pharmacy')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pharmacy' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Network Sales
                    </button>
                </div>
            </div>

            {activeTab === 'platform' ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <DashboardCard 
                            title="Total MRR" 
                            value={`$${platformAnalytics.total.toLocaleString()}`}
                            icon={<TrendingUpIcon />}
                            colorClass="bg-indigo-600"
                        />
                        <DashboardCard 
                            title="Subscription Revenue" 
                            value={`$${platformAnalytics.subscriptions.toLocaleString()}`}
                            icon={<CreditCardIcon />}
                            colorClass="bg-emerald-500"
                        />
                        <DashboardCard 
                            title="Patient Approval Fees" 
                            value={`$${platformAnalytics.patientFees.toLocaleString()}`}
                            icon={<UserCheckIcon />}
                            colorClass="bg-amber-500"
                        />
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="font-black text-slate-900 uppercase tracking-tight">Platform Transaction Ledger</h3>
                            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Export Ledger
                            </button>
                        </div>
                        <DataTable<PlatformSale>
                            columns={[
                                { key: 'date', header: 'Date' },
                                { key: 'entityName', header: 'Client/Entity' },
                                { key: 'type', header: 'Type' },
                                { key: 'plan', header: 'Plan/Tier' },
                                { key: 'amount', header: 'Amount' },
                                { key: 'status', header: 'Status' },
                            ]}
                            data={platformSales}
                            renderRow={(sale) => (
                                <>
                                    <td className="px-8 py-5 whitespace-nowrap text-xs font-mono text-slate-400">{sale.date}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-900">{sale.entityName}</td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sale.type === 'subscription' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {sale.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-slate-600">{sale.plan}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-900">${sale.amount.toFixed(2)}</td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {sale.status}
                                        </span>
                                    </td>
                                </>
                            )}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <DashboardCard 
                            title="Network Gross Volume" 
                            value={`$${pharmacyAnalytics.totalRevenue.toLocaleString()}`}
                            icon={<CurrencyDollarIcon />}
                            colorClass="bg-emerald-500"
                        />
                        <DashboardCard 
                            title="Top Product" 
                            value={pharmacyAnalytics.topSellingMedicine}
                            icon={<SparklesIcon />}
                            colorClass="bg-violet-500"
                        />
                        <DashboardCard 
                            title="Star Performer" 
                            value={pharmacyAnalytics.topPharmacy}
                            icon={<BuildingStorefrontIcon />}
                            colorClass="bg-sky-500"
                        />
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="font-black text-slate-900 uppercase tracking-tight">Network Sales Stream</h3>
                            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Export Stream
                            </button>
                        </div>
                        <DataTable<Sale>
                            columns={columns}
                            data={sales}
                            renderRow={(sale) => (
                                <>
                                    <td className="px-8 py-5 whitespace-nowrap text-xs font-mono text-slate-400">{sale.date}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-900">{pharmacyMap.get(sale.pharmacyId) || 'Unknown'}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-600">{sale.medicineName}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-500">{sale.quantity}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-900">${sale.totalPrice.toFixed(2)}</td>
                                </>
                            )}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminSalesReports;
