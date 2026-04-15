
import React, { useState } from 'react';
import { InventoryItem, StockMovementType, StockMovement } from '../types';
import { motion } from 'motion/react';
import { Plus, Minus, AlertCircle, History } from 'lucide-react';

interface StockMovementModalProps {
    item: InventoryItem;
    onClose: () => void;
    onSave: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ item, onClose, onSave }) => {
    const [type, setType] = useState<StockMovementType>(StockMovementType.ADJUSTMENT);
    const [quantity, setQuantity] = useState<number>(0);
    const [reason, setReason] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For StockMovement, quantity is usually positive, but we can handle it based on type.
        // However, the recordStockMovement in mockApi handles adjustment by adding the quantity.
        // So if it's a loss, quantity should be negative.
        onSave({
            organizationId: item.pharmacyId,
            medicineId: String(item.id), // In this mock, item.id is used to find the batch
            batchId: `batch-${item.id}`, // Mapping used in updateInventoryItem
            type,
            quantity,
            referenceId: reason
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-50 p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                    <Plus className="w-8 h-8 rotate-45" />
                </button>

                <div className="text-center mb-8 space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary/20">
                        <History className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Stock Adjustment</h2>
                    <p className="text-slate-400 font-medium text-sm">Recording movement for <span className="text-primary font-bold">{item.medicineName}</span></p>
                </div>

                <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Stock</p>
                        <p className="text-2xl font-black text-slate-900">{item.stock}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch</p>
                        <p className="text-sm font-bold text-slate-600">{item.batchNumber}</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Movement Type</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value as StockMovementType)}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        >
                            <option value={StockMovementType.ADJUSTMENT}>Adjustment (Damage/Loss)</option>
                            <option value={StockMovementType.RETURN}>Return</option>
                            <option value={StockMovementType.TRANSFER}>Transfer</option>
                            <option value={StockMovementType.PURCHASE}>Purchase (Restock)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Quantity Change</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                placeholder="e.g. -5 or 10"
                                required 
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 pr-12"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {quantity < 0 ? <Minus className="w-5 h-5 text-red-500" /> : <Plus className="w-5 h-5 text-emerald-500" />}
                            </div>
                        </div>
                        <div className="flex items-start gap-2 mt-3 px-2">
                            <AlertCircle className="w-3 h-3 text-slate-300 mt-0.5" />
                            <p className="text-[10px] text-slate-400 leading-relaxed italic">Use negative numbers for stock reduction (e.g., -5 for damage) and positive for additions.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Reason / Reference</label>
                        <input 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Damaged during handling"
                            required 
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold uppercase text-xs tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                        <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">Record Movement</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default StockMovementModal;
