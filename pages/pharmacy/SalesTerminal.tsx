
import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../hooks/useAuth';
import { InventoryItem, User } from '../../types';
import { TrashIcon, ExclamationTriangleIcon } from '../../constants';
import { getStaff } from '../../services/mockApi';
import { User as UserIcon, ShoppingCart, Search, CreditCard, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// A simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

interface CartItem extends InventoryItem {
    quantity: number;
}

const SalesTerminal: React.FC = () => {
    const { user } = useAuth();
    const { inventory, processManualSale } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [saleStatus, setSaleStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [staff, setStaff] = useState<User[]>([]);
    const [selectedClerk, setSelectedClerk] = useState<string>('');

    useEffect(() => {
        if (user?.pharmacyId) {
            getStaff(Number(user.pharmacyId)).then(setStaff);
        }
    }, [user]);

    const handleSearch = useMemo(() =>
        debounce((term: string) => {
            if (term.length < 2) {
                setSearchResults([]);
                return;
            }
            const results = inventory.filter(item =>
                item.medicineName.toLowerCase().includes(term.toLowerCase()) && item.stock > 0
            );
            setSearchResults(results);
        }, 300), [inventory]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        handleSearch(term);
    };

    const addToCart = (item: InventoryItem) => {
        if (item.isRecalled) {
            setSaleStatus({ message: `Cannot add ${item.medicineName}: RECALLED BATCH`, type: 'error' });
            setTimeout(() => setSaleStatus(null), 3000);
            return;
        }
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            updateQuantity(item.id, existingItem.quantity + 1);
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };
    
    const updateQuantity = (itemId: number, quantity: number) => {
        const itemInInventory = inventory.find(i => i.id === itemId);
        if (!itemInInventory) return;

        const newQuantity = Math.max(1, Math.min(quantity, itemInInventory.stock));

        setCart(cart.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (itemId: number) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const total = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    const handleCompleteSale = async () => {
        if (cart.length === 0 || !user) return;
        if (!selectedClerk) {
            setSaleStatus({ message: 'Please select a clerk before completing the sale.', type: 'error' });
            return;
        }
        setIsProcessing(true);
        setSaleStatus(null);
        
        const saleItems = cart.map(item => ({ itemId: item.id, quantity: item.quantity }));
        const result = await processManualSale(saleItems, selectedClerk);
        
        setSaleStatus({ message: result.message, type: result.success ? 'success' : 'error' });
        
        if (result.success) {
            setCart([]);
            setSelectedClerk('');
            setTimeout(() => setSaleStatus(null), 4000);
        }
        setIsProcessing(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <ShoppingCart className="w-4 h-4" />
                        Point of Sale
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Sales Terminal</h1>
                    <p className="text-slate-400 font-medium">Process transactions and update inventory in real-time.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Item Selection */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search for medicine by name or SKU..."
                                className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                            />
                            {searchResults.length > 0 && (
                                <ul className="absolute z-20 w-full bg-white border border-slate-100 rounded-2xl mt-2 shadow-2xl max-h-80 overflow-y-auto p-2">
                                    {searchResults.map(item => (
                                        <li
                                            key={item.id}
                                            onClick={() => addToCart(item)}
                                            className={`p-4 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center transition-colors ${item.isRecalled ? 'bg-red-50' : ''}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`font-black text-sm ${item.isRecalled ? 'text-red-600' : 'text-slate-900'}`}>{item.medicineName}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sku}</span>
                                                {item.isRecalled && <span className="mt-1 text-[8px] text-red-500 font-black uppercase border border-red-500 px-2 py-0.5 rounded-full w-fit">Recalled</span>}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-slate-900">${item.price.toFixed(2)}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Stock: {item.stock}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Current Cart</h3>
                            {cart.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem] space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                                        <ShoppingCart className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-medium">Search for items to add them to the sale.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all">
                                            <div className="flex-1">
                                                <p className="font-black text-slate-900">{item.medicineName}</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">${item.price.toFixed(2)} / unit</p>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-100">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary font-black"
                                                    >-</button>
                                                    <input
                                                        type="number"
                                                        value={item.quantity || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            updateQuantity(item.id, isNaN(val) ? 0 : val);
                                                        }}
                                                        className="w-12 text-center font-black text-slate-900 bg-transparent outline-none"
                                                    />
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary font-black"
                                                    >+</button>
                                                </div>
                                                <p className="w-24 text-right font-black text-lg text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                                                <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Summary & Checkout */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[60px] -mr-20 -mt-20" />
                        
                        <h2 className="text-2xl font-black tracking-tight uppercase mb-8 relative z-10">Checkout</h2>
                        
                        <div className="space-y-6 relative z-10 flex-grow">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Select Clerk</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <select 
                                        value={selectedClerk}
                                        onChange={(e) => setSelectedClerk(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 outline-none transition-all font-bold text-white appearance-none"
                                    >
                                        <option value="" className="text-slate-900">Choose Clerk...</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.name} className="text-slate-900">{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                                    <span className="font-mono">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-xs font-bold uppercase tracking-widest">Tax (0%)</span>
                                    <span className="font-mono">$0.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <span className="text-lg font-black uppercase tracking-tighter">Total Amount</span>
                                    <span className="text-3xl font-black text-primary tracking-tighter">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCompleteSale}
                            disabled={cart.length === 0 || isProcessing}
                            className="w-full mt-10 py-6 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CreditCard className="w-5 h-5" />
                            )}
                            {isProcessing ? 'Processing...' : 'Complete Sale'}
                        </button>

                        {saleStatus && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-6 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
                                    saleStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                            >
                                <AlertCircle className="w-4 h-4" />
                                {saleStatus.message}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesTerminal;
