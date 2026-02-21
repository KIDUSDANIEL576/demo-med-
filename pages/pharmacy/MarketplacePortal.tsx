
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
    Building2, 
    Sparkles, 
    ShoppingCart, 
    ArrowLeft, 
    Check,
    AlertTriangle,
    Search,
    BarChart3,
    TrendingUp,
    Package,
    Truck,
    ChevronRight,
    Plus,
    Trash2
} from 'lucide-react';
import UpgradePlan from '../../components/UpgradePlan';
import { motion, AnimatePresence } from 'motion/react';

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
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(i => i.product.id !== productId));
    };

    const handleCheckout = async () => {
        if (!user || !user.pharmacyId || cart.length === 0) return;
        
        const pharmacyId = user.pharmacyId;
        const pharmacyName = user.name;

        setLoading(true);
        try {
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
        } catch (err) {
            alert("Failed to place order.");
        } finally {
            setLoading(false);
        }
    };

    if (!isPlatinum) return <UpgradePlan featureName="B2B Supply Marketplace" />;

    if (loading && view === 'suppliers') {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bootstrapping B2B Intelligence...</p>
            </div>
        );
    }

    const filteredProducts = products.filter(p => p.medicineName.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <Building2 className="w-4 h-4" />
                        Supply Chain Network
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">B2B Marketplace</h1>
                    <p className="text-slate-400 font-medium text-lg">Verified supplier network and regional demand intelligence.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button 
                        onClick={() => setView('orders')} 
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                            view === 'orders' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 border border-slate-100 hover:text-primary'
                        }`}
                    >
                        <BarChart3 className="w-5 h-5" />
                        My Supply Chain
                    </button>
                    <button 
                        onClick={() => setView('cart')} 
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all relative ${
                            view === 'cart' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white text-slate-500 border border-slate-100 hover:text-primary'
                        }`}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Cart
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'suppliers' && (
                    <motion.div 
                        key="suppliers"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[100px] -mr-40 -mt-40" />
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                                                <TrendingUp className="w-4 h-4" />
                                                Live Intelligence
                                            </div>
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Regional Demand Signals</h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {demandSignals.map((signal) => (
                                            <div key={signal.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md hover:bg-white/10 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="font-black text-xl block">{signal.medicineName}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trend: <span className="text-emerald-400">{signal.trend}</span></span>
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg ${
                                                        signal.intensity === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                                                    }`}>
                                                        {signal.intensity}
                                                    </span>
                                                </div>
                                                {signal.estimatedShortageDate && (
                                                    <div className="flex items-center gap-2 text-red-400">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Est. Shortage: {signal.estimatedShortageDate}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col space-y-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Verified Partners</h3>
                                    <p className="text-sm text-slate-400 font-medium">Top-tier pharmaceutical suppliers.</p>
                                </div>
                                <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                                    {suppliers.filter(s => s.status === 'approved').map(sup => (
                                        <div key={sup.id} className="p-5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg hover:border-primary/20 border border-transparent transition-all cursor-pointer group">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-black text-slate-900 group-hover:text-primary transition-colors">{sup.tradeName}</span>
                                                <div className="flex items-center gap-1 text-emerald-600">
                                                    <Check className="w-3 h-3" />
                                                    <span className="text-[10px] font-black uppercase">{sup.reliabilityScore}%</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{sup.distributionRegions.join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setView('catalog')} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 uppercase text-xs tracking-widest flex items-center justify-center gap-3">
                                    <Package className="w-5 h-5" />
                                    Browse Global Catalog
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Supply Opportunities</h2>
                                    <p className="text-slate-400 font-medium">Direct procurement from verified manufacturers.</p>
                                </div>
                                <div className="relative w-full md:w-80 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search catalog..." 
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProducts.slice(0, 6).map(p => {
                                    const supplier = suppliers.find(s => s.id === p.supplierId);
                                    return (
                                        <motion.div 
                                            key={p.id} 
                                            whileHover={{ y: -5 }}
                                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="space-y-1">
                                                        <h3 className="font-black text-xl text-slate-900 leading-tight">{p.medicineName}</h3>
                                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{supplier?.tradeName}</p>
                                                    </div>
                                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">${p.price}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MOQ</p>
                                                        <p className="text-sm font-black text-slate-900">{p.moq} Units</p>
                                                    </div>
                                                    <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Time</p>
                                                        <p className="text-sm font-black text-slate-900">{p.leadTimeDays} Days</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => addToCart(p)}
                                                className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 relative z-10"
                                            >
                                                <Plus className="w-4 h-4" /> Add to Cart
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'catalog' && (
                    <motion.div 
                        key="catalog"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <button onClick={() => setView('suppliers')} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Intelligence
                        </button>
                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Supplier</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">MOQ</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredProducts.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-slate-900">{p.medicineName}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.strength} • {p.dosageForm}</div>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                {suppliers.find(s => s.id === p.supplierId)?.tradeName}
                                            </td>
                                            <td className="px-8 py-6 font-black text-slate-900">${p.price}</td>
                                            <td className="px-8 py-6 text-xs font-black text-slate-400">{p.moq} Units</td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => addToCart(p)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all">
                                                    <ShoppingCart className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {view === 'cart' && (
                    <motion.div 
                        key="cart"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <button onClick={() => setView('suppliers')} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Continue Procurement
                        </button>
                        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="p-12 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Purchase Order</h2>
                                    <p className="text-slate-400 font-medium">Review your supply chain requirements.</p>
                                </div>
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <ShoppingCart className="w-8 h-8" />
                                </div>
                            </div>
                            <div className="p-12 space-y-6">
                                {cart.length > 0 ? cart.map(item => (
                                    <div key={item.product.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                                        <div className="flex-1">
                                            <p className="font-black text-lg text-slate-900">{item.product.medicineName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.product.packSize} • {item.product.strength}</p>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                                                <p className="font-black text-slate-900">{item.qty}</p>
                                            </div>
                                            <div className="text-right w-24">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                                                <p className="font-black text-primary text-lg">${(item.product.price * item.qty).toFixed(2)}</p>
                                            </div>
                                            <button onClick={() => removeFromCart(item.product.id)} className="p-3 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 space-y-4">
                                        <Package className="w-16 h-16 text-slate-100 mx-auto" />
                                        <p className="text-slate-400 font-medium italic">Your procurement cart is empty.</p>
                                    </div>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <div className="p-12 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Investment</p>
                                        <p className="text-5xl font-black text-white tracking-tighter">${cart.reduce((s, i) => s + (i.product.price * i.qty), 0).toFixed(2)}</p>
                                    </div>
                                    <button 
                                        onClick={handleCheckout}
                                        className="w-full md:w-auto px-12 py-6 bg-primary text-white font-black rounded-[2rem] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 uppercase text-sm tracking-widest flex items-center justify-center gap-3"
                                    >
                                        <Check className="w-5 h-5" />
                                        Confirm & Place Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {view === 'orders' && (
                    <motion.div 
                        key="orders"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <button onClick={() => setView('suppliers')} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
                        </button>
                        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Supplier</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {orders.map(o => (
                                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6 font-mono text-xs text-slate-400">{o.id}</td>
                                            <td className="px-8 py-6 font-black text-slate-900">{o.supplierName}</td>
                                            <td className="px-8 py-6 font-black text-primary">${o.totalAmount.toFixed(2)}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                    o.status === MarketplaceOrderStatus.SUBMITTED ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    o.status === MarketplaceOrderStatus.CONFIRMED ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                                                    'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                }`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarketplacePortal;
