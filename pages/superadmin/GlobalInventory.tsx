
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { getAllInventory, getPharmacies, toggleRecallStatus } from '../../services/mockApi';
import { InventoryItem, Pharmacy, UserRole } from '../../types';
import { ExclamationTriangleIcon, BuildingStorefrontIcon, XIcon } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const GlobalInventory: React.FC = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [pharmacyMap, setPharmacyMap] = useState<Map<number, Pharmacy>>(new Map());
    
    // Modal State
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // SECURITY FIX: Block access if not Super Admin
    if (user?.role !== UserRole.SUPER_ADMIN) {
        return <Navigate to="/dashboard" />;
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        getAllInventory().then(setInventory);
        getPharmacies().then(data => {
            // Map ID to the full Pharmacy object for detailed lookup
            // FIX: Explicitly type the Map and cast the entries to resolve type mismatch errors.
            const map = new Map<number, Pharmacy>(data.map(p => [p.id, p] as [number, Pharmacy]));
            setPharmacyMap(map);
        });
    }

    const handleRecall = async (e: React.MouseEvent, itemId: number) => {
        e.stopPropagation(); // Prevent row click
        if (window.confirm("Toggle recall status for this batch? This will block sales across the pharmacy.")) {
            await toggleRecallStatus(itemId);
            fetchData();
        }
    }

    const handleRowClick = (item: InventoryItem) => {
        const pharmacy = pharmacyMap.get(item.pharmacyId) || null;
        setSelectedItem(item);
        setSelectedPharmacy(pharmacy);
        setIsDetailsOpen(true);
    };

    const isExpired = (dateString: string) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        return new Date(dateString) < today;
    };

    const columns = [
        { key: 'medicineName', header: 'Medicine Name' },
        { key: 'pharmacy', header: 'Pharmacy' },
        { key: 'batchNumber', header: 'Batch' },
        { key: 'stock', header: 'Stock' },
        { key: 'expiryDate', header: 'Expiry Date' },
        { key: 'actions', header: 'EFDA Actions' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Global Inventory Control</h1>
            
            <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="font-bold text-red-700">Expired Item (Critical)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
                    <span>Low Stock</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-50 ring-2 ring-red-500 rounded"></div>
                    <span>Recalled Batch</span>
                </div>
            </div>

            <DataTable<InventoryItem>
                columns={columns}
                data={inventory}
                renderRow={(item) => {
                    const pharmacy = pharmacyMap.get(item.pharmacyId);
                    const expired = isExpired(item.expiryDate);
                    
                    // COMPLIANCE RULE: Bright Red Background for Expired Items
                    let rowClass = "cursor-pointer transition-colors hover:bg-slate-50";
                    if (item.isRecalled) {
                        rowClass = 'bg-red-50 ring-2 ring-red-500 ring-inset cursor-pointer';
                    } else if (expired) {
                        rowClass = 'bg-red-600 text-white font-bold cursor-pointer hover:bg-red-700';
                    } else if (item.stock < 50) {
                        rowClass = 'bg-amber-100/50 cursor-pointer hover:bg-amber-100';
                    }

                    return (
                        <tr key={item.id} className={rowClass} onClick={() => handleRowClick(item)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold">{item.medicineName}</div>
                                {item.isRecalled && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-white text-red-700 shadow-sm mt-1">RECALLED</span>}
                                {expired && !item.isRecalled && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-white text-red-700 shadow-sm mt-1">EXPIRED</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {pharmacy ? (
                                    <>
                                        <div className="text-sm font-medium">{pharmacy.name}</div>
                                        <div className={`text-xs ${expired ? 'text-white/80' : 'opacity-80'}`}>{pharmacy.email}</div>
                                    </>
                                ) : (
                                    <span className="text-sm opacity-50">Unknown Pharmacy</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{item.batchNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{item.stock}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {item.expiryDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                    onClick={(e) => handleRecall(e, item.id)} 
                                    className={`${item.isRecalled ? 'text-green-700 hover:text-green-900 bg-green-100 px-2 py-1 rounded' : 'text-red-600 hover:text-red-800 bg-white border border-red-200 px-2 py-1 rounded'} flex items-center gap-1 shadow-sm`} 
                                    title="Toggle EFDA Recall"
                                >
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    {item.isRecalled ? 'Revoke Recall' : 'Recall Batch'}
                                </button>
                            </td>
                        </tr>
                    )
                }}
            />

            {/* Pharmacy Details Popup (Read-Only) */}
            {isDetailsOpen && selectedPharmacy && selectedItem && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                        <div className="bg-primary p-6 text-white flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <BuildingStorefrontIcon className="w-6 h-6"/> 
                                    {selectedPharmacy.name}
                                </h2>
                                <p className="text-primary-100 text-sm mt-1">Inventory Source Detail (Read-Only)</p>
                            </div>
                            <button onClick={() => setIsDetailsOpen(false)} className="text-white/80 hover:text-white">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pharmacy Information</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-600">Email:</span>
                                        <span className="font-medium text-slate-800">{selectedPharmacy.email}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-600">Phone:</span>
                                        <span className="font-medium text-slate-800">{selectedPharmacy.phone}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-600">Address:</span>
                                        <span className="font-medium text-slate-800 text-right">{selectedPharmacy.address}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-600">Registered Staff:</span>
                                        <span className="font-medium text-slate-800">{selectedPharmacy.staff}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-600">Subscription Plan:</span>
                                        <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase ${selectedPharmacy.plan === 'Platinum' ? 'bg-sky-100 text-sky-800' : 'bg-green-100 text-green-800'}`}>
                                            {selectedPharmacy.plan}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Item</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-800">{selectedItem.medicineName}</span>
                                    <span className="font-mono text-sm bg-white px-2 py-1 rounded border">Batch: {selectedItem.batchNumber}</span>
                                </div>
                                <div className="mt-2 text-sm flex justify-between text-slate-600">
                                    <span>Stock: {selectedItem.stock}</span>
                                    <span className={isExpired(selectedItem.expiryDate) ? 'text-red-600 font-bold' : ''}>
                                        Expires: {selectedItem.expiryDate}
                                        {isExpired(selectedItem.expiryDate) && ' (EXPIRED)'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t flex justify-end">
                            <button onClick={() => setIsDetailsOpen(false)} className="px-6 py-2 bg-white border border-slate-300 rounded-md font-bold text-slate-700 hover:bg-slate-100">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalInventory;
