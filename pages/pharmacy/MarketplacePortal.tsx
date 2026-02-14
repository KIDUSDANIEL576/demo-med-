
import React, { useState, useEffect } from 'react';
import { 
    getSuppliers, 
    getMarketplaceProducts, 
    placeMarketplaceOrder, 
    getDemandSignals,
    getPharmacyMarketplaceOrders
} from '../../services/mockApi';
import { 
    PharmaceuticalCompany, 
    SupplierProduct, 
    MarketplaceOrder, 
    MarketplaceOrderStatus,
    DemandSignal,
    SubscriptionPlan
} from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { 
    BuildingStorefrontIcon, 
    SparklesIcon, 
    ShoppingCartIcon, 
    ArrowLeftIcon, 
    CheckIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    ChartBarIcon
} from '../../constants';
import UpgradePlan from '../../components/UpgradePlan';

const MarketplacePortal: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'suppliers' | 'catalog' | 'cart' | 'orders'>('suppliers');
    const [suppliers, setSuppliers] = useState<PharmaceuticalCompany[]>([]);
    const [products, setProducts] = useState<SupplierProduct[]>([]);
    const [demandSignals, setDemandSignals] = useState<DemandSignal[]>([]);
    const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
    const [cart, setCart] = useState<{product: SupplierProduct, qty: number}[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Platinum Check
    const isPlatinum = user?.plan === SubscriptionPlan.PLATINUM;

    useEffect(() => {
        if (isPlatinum) {
            loadBaseData();
        }
    }, [isPlatinum]);

    const loadBaseData = async () => {
        setLoading(true);
        const [s, p, d, o] = await Promise.all([
            getSuppliers(),
            getMarketplaceProducts(),
            getDemandSignals(),
            getPharmacyMarketplaceOrders(user?.pharmacyId || '')
        ]);
        setSuppliers(s || []);
        setProducts(p || []);
        setDemandSignals(d || []);
        setOrders(o || []);
        setLoading(false);
    };

    const addToCart = (product: SupplierProduct) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? {...item, qty: item.qty + product.moq} : item);
            }
            return [...prev, { product, qty: product.moq }];
        });
        alert(`${product.medicineName} added to cart!`);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(i => i.product.id !== productId));
    };

    /**
     * FIX: Updated handleCheckout with explicit non-null narrowing to resolve 'unknown' type assignment 
     * issues when passing user data to placeMarketplaceOrder.
     */
    const handleCheckout = async () => {
        if (!user || !user.pharmacyId || cart.length === 0) return;
        
        const pharmacyId = user.pharmacyId;
        const pharmacyName = user.name;

        setLoading(true);
        try {
            // Group by supplier
            const supplierIds = Array.from(new Set(cart.map(i => i.product.supplierId)));
            
            for (const sId of supplierIds) {
                const items = cart.filter(i => i.product.supplierId === sId);
                const supplier = suppliers.find(s => s.id === sId);
                
                await placeMarketplaceOrder({
                    pharmacyId: pharmacyId as string | number,
                    pharmacyName: pharmacyName as string,
                    supplierId: sId,
                    supplierName: supplier?.tradeName || 'Unknown Supplier',
                    totalAmount: items.reduce((sum, i) => sum + (i.product.price * i.qty), 0),
                    paymentMethod: 'bank_transfer',
                    items: items.map(i => ({
                        id: `item-${Date.now()}`,
                        productId: i.product.id,
                        medicineName: i.product.medicineName,
                        quantity: i.qty,
                        unitPrice: i.product.price
                    }))
                });
            }
            
            setCart([]);
            setView('orders');
            loadBaseData();
            alert("Orders placed successfully!");
        } catch (err) {
            alert("Failed to place order.");
        } finally {
            setLoading(false);
        }
    };

    if (!isPlatinum) return <UpgradePlan featureName="B2B Supply Marketplace" />;

    if (loading && view === 'suppliers') return <div className="p-8 text-indigo-600 font-black animate-pulse">BOOTSTRAPPING B2B SUPPLY INTELLIGENCE...</div>;

    const filteredProducts = products.filter(p => p.medicineName.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">B2B Marketplace</h1>
                    <p className="text-slate-500 font-medium">Verified Supplier Network & Intelligence</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setView('orders')} className={`px-5 py-2 rounded-xl font-bold border transition-all flex items-center gap-2 ${view === 'orders' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                        <ChartBarIcon className="w-5 h-5" /> My Supply Chain
                    </button>
                    <button onClick={() => setView('cart')} className={`px-5 py-2 rounded-xl font-bold border transition-all flex items-center gap-2 ${view === 'cart' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                        <ShoppingCartIcon className="w-5 h-5" /> Cart ({cart.length})
                    </button>
                </div>
            </div>

            {/* View Switcher */}
            {view === 'suppliers' && (
                <div className="space-y-10">
                    {/* Intelligence Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><SparklesIcon className="w-48 h-48"/></div>
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-indigo-400">
                                <ChartBarIcon className="w-6 h-6" /> DEMAND INTELLIGENCE (REGIONAL)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {demandSignals.map((signal) => (
                                    <div key={signal.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-lg">{signal.medicineName}</span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${signal.intensity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}>
                                                {signal.intensity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">Trend: <span className="text-emerald-400 font-bold uppercase">{signal.trend}</span></p>
                                        {signal.estimatedShortageDate && (
                                            <p className="text-[10px] text-red-400 mt-2 font-black uppercase tracking-widest">Est. Shortage: {signal.estimatedShortageDate}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl flex flex-col">
                            <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tighter">Verified Suppliers</h3>
                            <div className="space-y-4 flex-1 overflow-y-auto">
                                {suppliers.filter(s => s.status === 'approved').map(sup => (
                                    <div key={sup.id} className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-500 transition-all cursor-pointer">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-black text-slate-800">{sup.tradeName}</span>
                                            <span className="text-xs font-bold text-indigo-600">{sup.reliabilityScore}% Reliability</span>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate">{sup.distributionRegions.join(', ')}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setView('catalog')} className="mt-6 w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all">
                                BROWSE GLOBAL CATALOG
                            </button>
                        </div>
                    </div>

                    {/* Catalog Preview */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Supply Opportunities</h2>
                            <div className="relative w-64">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search catalog..." 
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.slice(0, 6).map(p => {
                                const supplier = suppliers.find(s => s.id === p.supplierId);
                                return (
                                    <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-black text-lg text-slate-800 leading-tight">{p.medicineName}</h3>
                                                    <p className="text-xs text-indigo-600 font-bold uppercase">{supplier?.tradeName}</p>
                                                </div>
                                                <span className="text-2xl font-black text-slate-900">${p.price}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-6">
                                                <div className="bg-slate-50 p-2 rounded-xl text-center">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">MOQ</p>
                                                    <p className="text-xs font-black text-slate-800">{p.moq} Units</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded-xl text-center">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Lead Time</p>
                                                    <p className="text-xs font-black text-slate-800">{p.leadTimeDays} Days</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => addToCart(p)}
                                            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCartIcon className="w-4 h-4" /> ADD TO CART
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {view === 'catalog' && (
                <div className="space-y-6">
                    <button onClick={() => setView('suppliers')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600">
                        <ArrowLeftIcon className="w-5 h-5" /> BACK TO DASHBOARD
                    </button>
                    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Product Details</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Supplier</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Price (Unit)</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">MOQ</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{p.medicineName}</div>
                                            <div className="text-xs text-slate-400">{p.strength} • {p.dosageForm}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                            {suppliers.find(s => s.id === p.supplierId)?.tradeName}
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-900">${p.price}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{p.moq} Units</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => addToCart(p)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                                                <ShoppingCartIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'cart' && (
                <div className="max-w-4xl mx-auto space-y-8">
                    <button onClick={() => setView('suppliers')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600">
                        <ArrowLeftIcon className="w-5 h-5" /> CONTINUE BROWSING
                    </button>
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Your Purchase Order</h2>
                        </div>
                        <div className="p-8 space-y-4">
                            {cart.length > 0 ? cart.map(item => (
                                <div key={item.product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800">{item.product.medicineName}</p>
                                        <p className="text-xs text-slate-400">{item.product.packSize} • {item.product.strength}</p>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Quantity</p>
                                            <p className="font-black text-slate-800">{item.qty}</p>
                                        </div>
                                        <div className="text-right w-24">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Subtotal</p>
                                            <p className="font-black text-indigo-600">${(item.product.price * item.qty).toFixed(2)}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600">
                                            <ExclamationTriangleIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 italic text-slate-400">Cart is empty. Discover essential supplies.</div>
                            )}
                        </div>
                        {cart.length > 0 && (
                            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Investment</p>
                                    <p className="text-3xl font-black text-white">${cart.reduce((s, i) => s + (i.product.price * i.qty), 0).toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    className="px-10 py-4 bg-indigo-500 text-white font-black rounded-2xl hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20"
                                >
                                    CONFIRM & PLACE ORDER
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'orders' && (
                <div className="space-y-6">
                    <button onClick={() => setView('suppliers')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600">
                        <ArrowLeftIcon className="w-5 h-5" /> BACK TO MARKETPLACE
                    </button>
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black uppercase">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase">Supplier</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase">Amount</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.map(o => (
                                    <tr key={o.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-sm text-slate-500">{o.id}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{o.supplierName}</td>
                                        <td className="px-6 py-4 font-black text-indigo-600">${o.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                                o.status === MarketplaceOrderStatus.SUBMITTED ? 'bg-amber-100 text-amber-700' :
                                                o.status === MarketplaceOrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketplacePortal;
