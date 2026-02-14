
import React, { useState, useMemo } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../hooks/useAuth';
import { InventoryItem } from '../../types';
import { TrashIcon, ExclamationTriangleIcon } from '../../constants';

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
        setIsProcessing(true);
        setSaleStatus(null);
        
        const saleItems = cart.map(item => ({ itemId: item.id, quantity: item.quantity }));
        const result = await processManualSale(saleItems, user.name);
        
        setSaleStatus({ message: result.message, type: result.success ? 'success' : 'error' });
        
        if (result.success) {
            setCart([]);
            setTimeout(() => setSaleStatus(null), 4000);
        }
        setIsProcessing(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left side: Item Selection */}
            <div className="lg:col-span-2 bg-base-300 shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Add Items to Sale</h2>
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search for medicine..."
                        className="w-full p-3 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    {searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map(item => (
                                <li
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    className={`p-3 hover:bg-base-100 cursor-pointer flex justify-between items-center ${item.isRecalled ? 'bg-red-50' : ''}`}
                                >
                                    <div>
                                        <span className={item.isRecalled ? 'text-red-600 font-bold' : ''}>{item.medicineName}</span>
                                        {item.isRecalled && <span className="ml-2 text-xs text-red-500 font-bold uppercase border border-red-500 px-1 rounded">Recalled</span>}
                                    </div>
                                    <span className="text-slate-500">Stock: {item.stock}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Current Sale</h3>
                     {cart.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                           <p>Search for items to add them to the sale.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between bg-base-100 p-3 rounded-md">
                                    <div>
                                        <p className="font-semibold">{item.medicineName}</p>
                                        <p className="text-sm text-slate-500">${item.price.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            min="1"
                                            max={item.stock}
                                            className="w-16 text-center p-1 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                        />
                                        <p className="w-20 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: Summary & Checkout */}
            <div className="bg-base-300 shadow-lg rounded-lg p-6 flex flex-col">
                 <h2 className="text-xl font-semibold mb-4">Summary</h2>
                 <div className="space-y-4 flex-grow">
                     <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t">
                         <span>Total</span>
                         <span>${total.toFixed(2)}</span>
                     </div>
                 </div>
                 <button
                    onClick={handleCompleteSale}
                    disabled={cart.length === 0 || isProcessing}
                    className="w-full mt-6 py-3 px-4 bg-secondary text-white rounded-md text-lg font-bold hover:bg-secondary/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                 >
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                 </button>
                 {saleStatus && (
                    <div className={`mt-4 p-3 rounded-md text-center text-sm ${saleStatus.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {saleStatus.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesTerminal;
