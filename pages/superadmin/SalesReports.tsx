
import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import DashboardCard from '../../components/DashboardCard';
import { getAllSales, getPharmacies, exportData } from '../../services/mockApi';
import { Sale, Pharmacy } from '../../types';
import { ArrowDownTrayIcon } from '../../constants';

// FIX: Update icon components to accept and spread props to allow style overrides from parent components.
const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l-2.293 2.293a1 1 0 01-1.414 0L4 12l2.293-2.293a1 1 0 011.414 0L10 12z" /></svg>;
const BuildingStorefrontIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;


const SuperAdminSalesReports: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [pharmacyMap, setPharmacyMap] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        getAllSales().then(setSales);
        getPharmacies().then(data => {
            setPharmacies(data);
            // FIX: Explicitly type the Map and cast the entries to resolve type mismatch errors.
            const map = new Map<number, string>(data.map(p => [p.id, p.name] as [number, string]));
            setPharmacyMap(map);
        });
    }, []);

    const analytics = useMemo(() => {
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
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Global Sales Reports</h1>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-md transition-colors"
                >
                    <ArrowDownTrayIcon className="w-5 h-5"/>
                    Export Full Report (Excel/CSV)
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard 
                    title="Total Revenue" 
                    value={`$${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<CurrencyDollarIcon />}
                    colorClass="bg-emerald-500"
                />
                <DashboardCard 
                    title="Top Selling Medicine" 
                    value={analytics.topSellingMedicine}
                    icon={<SparklesIcon />}
                    colorClass="bg-violet-500"
                />
                 <DashboardCard 
                    title="Top Performing Pharmacy" 
                    value={analytics.topPharmacy}
                    icon={<BuildingStorefrontIcon />}
                    colorClass="bg-sky-500"
                />
            </div>

            <DataTable<Sale>
                columns={columns}
                data={sales}
                renderRow={(sale) => (
                    <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sale.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{pharmacyMap.get(sale.pharmacyId) || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sale.medicineName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sale.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${sale.totalPrice.toFixed(2)}</td>
                    </tr>
                )}
            />
        </div>
    );
};

export default SuperAdminSalesReports;
