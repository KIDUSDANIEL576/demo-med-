
import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryCategory } from '../types';

interface InventoryItemModalProps {
    item: InventoryItem | null;
    onClose: () => void;
    onSave: (item: Omit<InventoryItem, 'id'> | InventoryItem) => void;
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        medicineName: '',
        category: InventoryCategory.OTHER,
        stock: 0,
        costPrice: 0,
        price: 0,
        expiryDate: '',
        supplier: '',
        supplierInfo: '',
        batchNumber: '',
        brand: '',
        sku: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                medicineName: item.medicineName,
                category: item.category,
                stock: item.stock,
                costPrice: item.costPrice,
                price: item.price,
                expiryDate: item.expiryDate,
                supplier: item.supplier,
                supplierInfo: item.supplierInfo,
                batchNumber: item.batchNumber || '',
                brand: item.brand || '',
                sku: item.sku || ''
            });
        }
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = ['stock', 'costPrice', 'price'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (item) {
            onSave({ ...item, ...formData });
        } else {
            // FIX: Add a dummy pharmacyId to satisfy the onSave type signature.
            // The parent component will overwrite this with the correct ID.
            onSave({ ...formData, pharmacyId: 0 });
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{item ? 'Edit Inventory Item' : 'Add New Item'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                             <label className="block text-sm font-medium text-slate-700">Item Name</label>
                             <input name="medicineName" value={formData.medicineName} onChange={handleChange} placeholder="Medicine / Item Name" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900" />
                        </div>
                        
                        <div>
                             <label className="block text-sm font-medium text-slate-700">Category</label>
                             <select name="category" value={formData.category} onChange={handleChange} className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900">
                                {Object.values(InventoryCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                             </select>
                        </div>
                        
                         <div>
                             <label className="block text-sm font-medium text-slate-700">Batch Number</label>
                             <input name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="e.g., B12345" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900" />
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-slate-700">Stock</label>
                             <input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="0" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900" />
                        </div>
                        
                         <div>
                             <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                             <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900" />
                        </div>
                        
                         <div>
                             <label className="block text-sm font-medium text-slate-700">Cost Price</label>
                             <input name="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={handleChange} placeholder="0.00" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900" />
                        </div>
                        
                         <div>
                             <label className="block text-sm font-medium text-slate-700">Selling Price</label>
                             <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900" />
                        </div>
                        
                         <div>
                             <label className="block text-sm font-medium text-slate-700">Brand / Supplier</label>
                             <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand Name" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900" />
                        </div>
                        
                         <div>
                             <label className="block text-sm font-medium text-slate-700">SKU</label>
                             <input name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU-001" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900" />
                        </div>
                    </div>
                    
                    {/* Legacy Fields hidden or mapped if needed, keeping simple for now */}
                    <input type="hidden" name="supplier" value={formData.brand} /> 
                   
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">{item ? 'Save Changes' : 'Add Item'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryItemModal;
