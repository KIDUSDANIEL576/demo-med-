
import React, { useState, useMemo } from 'react';
import { getPrescriptionByCode } from '../../services/mockApi';
import { Prescription } from '../../types';
import { useInventory } from '../../contexts/InventoryContext';
import { Search, FileText, User, Building2, Calendar, CheckCircle2, AlertCircle, ShoppingCart, X, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PrescriptionLookup: React.FC = () => {
    const [code, setCode] = useState('');
    const [prescription, setPrescription] = useState<Prescription | null | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const { inventory, processSale } = useInventory();
    const [saleStatus, setSaleStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaleStatus(null);
        setPrescription(undefined);
        const result = await getPrescriptionByCode(code);
        setPrescription(result);
        setLoading(false);
    };

    const inventoryCheck = useMemo(() => {
        if (!prescription) return null;
        
        const medicineInInventory = inventory.find(item => prescription.details.toLowerCase().includes(item.medicineName.toLowerCase()));
        
        if (!medicineInInventory) {
            return { available: false, message: 'Medicine not available in inventory.' };
        }

        const quantityRequired = 10; 
        if (medicineInInventory.stock < quantityRequired) {
            return { available: false, message: `Insufficient stock. Required: ${quantityRequired}, Available: ${medicineInInventory.stock}` };
        }

        return { available: true, message: `Stock available: ${medicineInInventory.stock}` };
    }, [prescription, inventory]);

    const handleMakeSale = async () => {
        if (!prescription) return;
        setSaleStatus(null);
        setLoading(true);
        const result = await processSale(prescription);
        if (result.success) {
            setSaleStatus({ message: result.message, type: 'success' });
            setTimeout(() => {
                setPrescription(undefined);
                setSaleStatus(null);
                setCode('');
            }, 3000);
        } else {
            setSaleStatus({ message: result.message, type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-12">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                    <FileText className="w-4 h-4" />
                    Clinical Validation
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Prescription Lookup</h1>
                <p className="text-slate-400 font-medium text-lg">Verify and fulfill digital prescriptions from our network.</p>
            </div>
            
            <div className="bg-white shadow-sm rounded-[3rem] p-10 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32" />
                <form onSubmit={handleSearch} className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-grow group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter Prescription Code (e.g., RX-7H23K9D)"
                            className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 text-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !code}
                        className="w-full md:w-auto px-12 py-6 bg-primary text-white font-black rounded-[2rem] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:bg-slate-200 uppercase text-sm tracking-widest"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            <AnimatePresence mode="wait">
                {prescription === null && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 rounded-[2.5rem] p-12 text-center border border-red-100"
                    >
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-red-900 uppercase tracking-tighter">No Prescription Found</h2>
                        <p className="text-red-600 font-medium mt-2">Please verify the code and try again.</p>
                    </motion.div>
                )}

                {prescription && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-100"
                    >
                        <div className="bg-slate-900 p-12 text-white relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] -mr-32 -mt-32" />
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tighter uppercase">{prescription.clinicName}</h2>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Issuing Institution</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <User className="w-4 h-4 text-primary" />
                                        <span className="font-bold text-sm">Dr. {prescription.doctorName}</span>
                                    </div>
                                </div>
                                <div className="text-left md:text-right space-y-2">
                                     <div className="font-mono text-2xl bg-white/5 px-6 py-3 rounded-2xl border border-white/10 inline-block">
                                        {prescription.prescriptionCode}
                                     </div>
                                     <div className="flex items-center md:justify-end gap-2 text-slate-500">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Issued: {prescription.createdAt}</span>
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Information</p>
                                        <h3 className="text-2xl font-black text-slate-900">{prescription.patientName}</h3>
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
                                        <div className="flex items-center gap-3 text-primary">
                                            <Pill className="w-5 h-5" />
                                            <p className="text-sm font-black uppercase tracking-widest">Prescription Details</p>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{prescription.details}</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Validation</p>
                                        {inventoryCheck ? (
                                            <div className={`p-6 rounded-[2rem] flex items-center gap-4 border ${
                                                inventoryCheck.available 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                : 'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                                {inventoryCheck.available ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                                <span className="font-bold">{inventoryCheck.message}</span>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-slate-50 rounded-[2rem] animate-pulse flex items-center gap-4">
                                                <div className="w-6 h-6 bg-slate-200 rounded-full" />
                                                <div className="h-4 w-32 bg-slate-200 rounded" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <button
                                            onClick={handleMakeSale}
                                            disabled={!inventoryCheck?.available || loading}
                                            className="w-full py-6 bg-primary text-white font-black rounded-[2rem] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:bg-slate-200 uppercase text-sm tracking-widest flex items-center justify-center gap-3"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            {loading ? 'Processing...' : 'Fill Prescription & Make Sale'}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {saleStatus && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`p-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest ${
                                                        saleStatus.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                                    }`}
                                                >
                                                    {saleStatus.message}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrescriptionLookup;
