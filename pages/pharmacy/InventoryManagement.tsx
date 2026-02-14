
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { updateInventoryItem, deleteInventoryItem, addInventoryItem, getPharmacies, exportData } from '../../services/mockApi';
import { InventoryItem, InventoryCategory, Pharmacy, SubscriptionPlan } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePlanAccess } from '../../hooks/usePlanAccess'; 
import { PencilIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentTextIcon } from '../../constants';
import InventoryItemModal from '../../components/InventoryItemModal';
import BulkImportModal from '../../components/BulkImportModal';
import { useInventory } from '../../contexts/InventoryContext';

const isExpiringSoon = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const expiryDate = new Date(expiryDateStr);
    return expiryDate > today && expiryDate <= thirtyDaysFromNow;
};

const getRowClass = (item: InventoryItem) => {
    if (isExpiringSoon(item.expiryDate)) return 'bg-red-100/50';
    if (item.stock < 50) return 'bg-amber-100/50';
    return '';
};

const InventoryManagement: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const { inventory, loading, fetchInventory } = useInventory();
    const { hasAccess, checkAccess } = usePlanAccess();
    
    // Modal States
    const [isImportSelectorOpen, setIsImportSelectorOpen] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);

    const filter = location.state?.filter;

    useEffect(() => {
        fetchInventory();
        checkAccess('export_reports');
        if (user?.pharmacyId) {
            getPharmacies().then(allPharmacies => {
                setPharmacy(allPharmacies.find(p => p.id === user.pharmacyId) || null);
            });
        }
    }, [fetchInventory, user?.pharmacyId, user?.id]);
    
    const filteredInventory = useMemo(() => {
        if (!inventory) return [];
        if (filter === 'lowStock') {
            return inventory.filter(item => item.stock < 50);
        }
        if (filter === 'expiring') {
            return inventory.filter(item => isExpiringSoon(item.expiryDate));
        }
        return inventory;
    }, [inventory, filter]);
    
    // FIX: Enforce specific limits per plan (50, 100, Unlimited)
    const getLimit = (plan?: SubscriptionPlan) => {
        if (!plan) return 50; // Default Basic
        switch (plan) {
            case SubscriptionPlan.BASIC: return 50;
            case SubscriptionPlan.STANDARD: return 100;
            case SubscriptionPlan.PLATINUM: return 999999; // Unlimited
            default: return 50;
        }
    }

    const inventoryLimit = getLimit(pharmacy?.plan);
    const currentCount = inventory?.length || 0;
    const isLimitReached = currentCount >= inventoryLimit;

    // --- Import Handlers ---
    const handleOpenImportSelector = () => {
        if (isLimitReached) {
            alert(`Inventory limit of ${inventoryLimit} reached. Upgrade plan for more space.`);
            return;
        }
        setIsImportSelectorOpen(true);
    };

    const handleSelectManual = () => {
        setIsImportSelectorOpen(false);
        setSelectedItem(null);
        setIsManualModalOpen(true);
    };

    const handleSelectBulk = () => {
        setIsImportSelectorOpen(false);
        setIsBulkModalOpen(true);
    };

    const handleExport = () => {
        if (!hasAccess('export_reports')) return;
        const dataToExport = filteredInventory.map(item => ({
            ID: item.id,
            Name: item.medicineName,
            Category: item.category,
            Brand: item.brand,
            SKU: item.sku,
            Batch: item.batchNumber,
            Stock: item.stock,
            Expiry: item.expiryDate,
            Price: item.price,
            Cost: item.costPrice
        }));
        exportData(dataToExport, `Inventory_Export_${new Date().toISOString().split('T')[0]}`);
    };

    const handleEdit = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsManualModalOpen(true);
    };

    const handleDelete = async (itemId: number) => {
        if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            const res = await deleteInventoryItem(itemId);
            if (res.success) {
                fetchInventory();
            } else {
                alert('Failed to delete item.');
            }
        }
    };

    const handleSaveManual = async (item: Omit<InventoryItem, 'id'> | InventoryItem) => {
        if (!user?.pharmacyId) return;
        
        const itemWithPharmacy = { ...item, pharmacyId: user.pharmacyId };
        
        if ('id' in itemWithPharmacy) {
            await updateInventoryItem(itemWithPharmacy as InventoryItem);
            fetchInventory();
            setIsManualModalOpen(false);
        } else {
            const result = await addInventoryItem(itemWithPharmacy as Omit<InventoryItem, 'id'>);
            if (result.success) {
                fetchInventory();
                setIsManualModalOpen(false);
            } else {
                const errorMsg = 'message' in result && typeof result.message === 'string' 
                    ? result.message 
                    : 'Failed to add item.';
                alert(errorMsg);
            }
        }
    };

    const columns = [
        { key: 'medicineName', header: 'Item Name' },
        { key: 'category', header: 'Category' },
        { key: 'batchNumber', header: 'Batch' },
        { key: 'stock', header: 'Stock' },
        { key: 'price', header: 'Price' },
        { key: 'expiryDate', header: 'Expiry' },
        { key: 'brand', header: 'Brand' },
        { key: 'actions', header: 'Actions' },
    ];

    if (loading) {
        return <div className="text-center p-8">Loading inventory...</div>
    }

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
                <div className="flex items-center gap-4">
                     <div className="bg-slate-800 text-white px-4 py-2 rounded-lg font-mono text-sm font-bold tracking-wider shadow-md">
                        [ {currentCount} ITEMS • LIMIT {inventoryLimit > 10000 ? '∞' : inventoryLimit} ]
                     </div>

                     {hasAccess('export_reports') && (
                        <button 
                            onClick={handleExport} 
                            title="Export Inventory"
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 flex items-center gap-2 font-medium"
                        >
                            <ArrowDownTrayIcon /> Export
                        </button>
                     )}
                     
                    {/* Main Action Button */}
                    <button 
                        onClick={handleOpenImportSelector} 
                        disabled={isLimitReached}
                        title={isLimitReached ? `Inventory limit reached.` : "Add or Import Items"}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2 disabled:bg-primary/70 disabled:cursor-not-allowed font-bold shadow-md"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" /> Import Inventory
                    </button>
                </div>
            </div>

            {/* Import Selector Modal */}
            {isImportSelectorOpen && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
                        <button onClick={() => setIsImportSelectorOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">&times;</button>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">How would you like to add items?</h2>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <button onClick={handleSelectManual} className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group">
                                <div className="p-4 bg-slate-100 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                                    <DocumentTextIcon className="w-8 h-8 text-slate-600 group-hover:text-primary" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-700 group-hover:text-primary">Manual Entry</h3>
                                <p className="text-xs text-slate-500 text-center mt-2">Add items one by one. Good for small adjustments.</p>
                            </button>

                            <button onClick={handleSelectBulk} className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl">PLATINUM</div>
                                <div className="p-4 bg-slate-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                                    <ArrowUpTrayIcon className="w-8 h-8 text-slate-600 group-hover:text-green-700" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-700 group-hover:text-green-800">Bulk Import</h3>
                                <p className="text-xs text-slate-500 text-center mt-2">Upload Excel (.xlsx). Fast & efficient.</p>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Color Benchmark Legend */}
            <div className="flex gap-4 mb-2 text-sm bg-base-200/50 p-2 rounded-md">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span className="font-bold text-red-800">Expiring Soon (&lt;30 days)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
                    <span className="font-bold text-amber-800">Low Stock (&lt;50)</span>
                </div>
            </div>

            <DataTable<InventoryItem>
                columns={columns}
                data={filteredInventory}
                renderRow={(item) => (
                    <tr key={item.id} className={getRowClass(item)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.medicineName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{item.batchNumber || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{item.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.expiryDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.brand || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><PencilIcon/></button>
                                <button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800" title="Delete"><TrashIcon/></button>
                            </div>
                        </td>
                    </tr>
                )}
            />
            
            {/* Manual Import Modal */}
            {isManualModalOpen && (
                <InventoryItemModal
                    item={selectedItem}
                    onClose={() => setIsManualModalOpen(false)}
                    onSave={handleSaveManual}
                />
            )}

            {/* Bulk Import Modal */}
            {isBulkModalOpen && (
                <BulkImportModal 
                    onClose={() => setIsBulkModalOpen(false)}
                    onSuccess={() => {
                        fetchInventory();
                        alert("Bulk import successful!");
                    }}
                />
            )}
        </div>
    );
};

export default InventoryManagement;
