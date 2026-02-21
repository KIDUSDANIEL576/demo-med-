
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { updateInventoryItem, deleteInventoryItem, addInventoryItem, getPharmacies, exportData } from '../../services/mockApi';
import { InventoryItem, InventoryCategory, Pharmacy, SubscriptionPlan } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePlanAccess } from '../../hooks/usePlanAccess'; 
import { Pill, Download, Upload, Plus, Pencil, Trash2, AlertTriangle, Package, Search as SearchIcon } from 'lucide-react';
import InventoryItemModal from '../../components/InventoryItemModal';
import BulkImportModal from '../../components/BulkImportModal';
import { useInventory } from '../../contexts/InventoryContext';
import { motion, AnimatePresence } from 'motion/react';

const isExpiringSoon = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const expiryDate = new Date(expiryDateStr);
    return expiryDate > today && expiryDate <= thirtyDaysFromNow;
};

const getRowClass = (item: InventoryItem) => {
    if (isExpiringSoon(item.expiryDate)) return 'bg-red-50/50';
    if (item.stock < 50) return 'bg-amber-50/50';
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
    const [searchQuery, setSearchQuery] = useState('');

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
        let result = inventory;
        
        if (filter === 'lowStock') {
            result = result.filter(item => item.stock < 50);
        } else if (filter === 'expiring') {
            result = result.filter(item => isExpiringSoon(item.expiryDate));
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item => 
                item.medicineName.toLowerCase().includes(q) || 
                item.brand?.toLowerCase().includes(q) ||
                item.sku?.toLowerCase().includes(q)
            );
        }
        
        return result;
    }, [inventory, filter, searchQuery]);
    
    const getLimit = (plan?: SubscriptionPlan) => {
        if (!plan) return 50; 
        switch (plan) {
            case SubscriptionPlan.BASIC: return 50;
            case SubscriptionPlan.STANDARD: return 100;
            case SubscriptionPlan.PLATINUM: return 999999; 
            default: return 50;
        }
    }

    const inventoryLimit = getLimit(pharmacy?.plan);
    const currentCount = inventory?.length || 0;
    const isLimitReached = currentCount >= inventoryLimit;

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
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Inventory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <Package className="w-4 h-4" />
                        Stock Management
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Inventory</h1>
                    <p className="text-slate-400 font-medium text-lg">Manage your clinical stock and supply chain.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs tracking-[0.2em] shadow-xl shadow-slate-900/20 flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        {currentCount} / {inventoryLimit > 10000 ? '∞' : inventoryLimit} SLOTS USED
                    </div>

                    {hasAccess('export_reports') && (
                        <button 
                            onClick={handleExport} 
                            className="p-4 bg-white border border-slate-100 text-slate-500 rounded-2xl hover:text-primary hover:shadow-lg transition-all"
                            title="Export Inventory"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    )}
                    
                    <button 
                        onClick={handleOpenImportSelector} 
                        disabled={isLimitReached}
                        className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 font-bold text-sm uppercase tracking-widest disabled:bg-slate-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add Items
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                        <AlertTriangle className="w-3 h-3" />
                        Expiring
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                        <AlertTriangle className="w-3 h-3" />
                        Low Stock
                    </div>
                </div>
            </div>

            <DataTable<InventoryItem>
                columns={columns}
                data={filteredInventory}
                renderRow={(item) => (
                    <>
                        <td className={`px-8 py-6 whitespace-nowrap ${getRowClass(item)}`}>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">{item.medicineName}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.sku || 'NO SKU'}</span>
                            </div>
                        </td>
                        <td className={`px-8 py-6 whitespace-nowrap text-xs font-bold text-slate-500 uppercase tracking-widest ${getRowClass(item)}`}>{item.category}</td>
                        <td className={`px-8 py-6 whitespace-nowrap text-xs font-mono text-slate-400 ${getRowClass(item)}`}>{item.batchNumber || '-'}</td>
                        <td className={`px-8 py-6 whitespace-nowrap ${getRowClass(item)}`}>
                            <span className={`px-3 py-1 rounded-lg text-xs font-black ${item.stock < 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                {item.stock}
                            </span>
                        </td>
                        <td className={`px-8 py-6 whitespace-nowrap text-sm font-black text-slate-900 ${getRowClass(item)}`}>${item.price.toFixed(2)}</td>
                        <td className={`px-8 py-6 whitespace-nowrap ${getRowClass(item)}`}>
                            <span className={`text-xs font-bold ${isExpiringSoon(item.expiryDate) ? 'text-red-600' : 'text-slate-500'}`}>
                                {item.expiryDate}
                            </span>
                        </td>
                        <td className={`px-8 py-6 whitespace-nowrap text-xs font-bold text-slate-500 ${getRowClass(item)}`}>{item.brand || '-'}</td>
                        <td className={`px-8 py-6 whitespace-nowrap ${getRowClass(item)}`}>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(item)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-primary transition-all hover:shadow-md">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-all hover:shadow-md">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </>
                )}
            />
            
            {/* Import Selector Modal */}
            <AnimatePresence>
                {isImportSelectorOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-50 p-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20" />
                            
                            <button onClick={() => setIsImportSelectorOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                                <Plus className="w-8 h-8 rotate-45" />
                            </button>

                            <div className="text-center mb-12 space-y-4">
                                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary/20">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Import Inventory</h2>
                                <p className="text-slate-400 font-medium">Choose your preferred method to update your stock.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <button onClick={handleSelectManual} className="flex flex-col items-center justify-center p-10 border border-slate-100 rounded-[2.5rem] hover:border-primary hover:bg-primary/5 transition-all group space-y-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all">
                                        <Pencil className="w-8 h-8 text-slate-400 group-hover:text-primary" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">Manual Entry</h3>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">Add items individually. Best for small updates.</p>
                                    </div>
                                </button>

                                <button onClick={handleSelectBulk} className="flex flex-col items-center justify-center p-10 border border-slate-100 rounded-[2.5rem] hover:border-emerald-500 hover:bg-emerald-50 transition-all group space-y-6 relative overflow-hidden">
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Platinum</div>
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all">
                                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">Bulk Upload</h3>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">Upload Excel files. Fast and efficient for large stock.</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
