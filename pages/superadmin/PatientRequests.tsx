
import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { 
    getAllPatientRequests, 
    updatePatientRequestStatus, 
    searchPublicInventory, 
    completePatientRequestWithResult 
} from '../../services/mockApi';
import { PatientRequest, PublicInventoryResult } from '../../types';
import { Search, Building2, Check, Sparkles, Clock, DollarSign, ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PatientRequests: React.FC = () => {
    const [requests, setRequests] = useState<PatientRequest[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Agent workflow state
    const [handlingRequest, setHandlingRequest] = useState<PatientRequest | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PublicInventoryResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const data = await getAllPatientRequests();
        setRequests(data);
        setLoading(false);
    };

    const handleStartProcessing = async (req: PatientRequest) => {
        await updatePatientRequestStatus(req.id, 'processing');
        setHandlingRequest(req);
        setSearchQuery(req.medicineName);
        handleManualSearch(req.medicineName);
        fetchRequests();
    };

    const handleManualSearch = async (query: string) => {
        setSearchLoading(true);
        const data = await searchPublicInventory(query);
        setSearchResults(data);
        setSearchLoading(false);
    };

    const handleComplete = async (result: PublicInventoryResult) => {
        if (!handlingRequest) return;
        
        if (window.confirm(`Complete request and notify patient via SMS about ${result.pharmacyName}?`)) {
            try {
                await completePatientRequestWithResult(handlingRequest.id, result);
                setHandlingRequest(null);
                fetchRequests();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const columns = [
        { key: 'medicineName', header: 'Medicine Requested' },
        { key: 'amountPaid', header: 'Payment' },
        { key: 'status', header: 'Status' },
        { key: 'createdAt', header: 'Date' },
        { key: 'actions', header: 'Ops Action' },
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <Sparkles className="w-4 h-4" />
                        Human-Assisted Fulfillment
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Agent Request Queue</h1>
                    <p className="text-slate-400 font-medium text-lg">Manage and fulfill complex patient medicine discovery requests.</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!handlingRequest ? (
                    <motion.div 
                        key="queue"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden"
                    >
                        <DataTable<PatientRequest>
                            columns={columns}
                            data={requests.filter(r => r.status !== 'pending_payment')}
                            renderRow={(req) => (
                                <>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="font-black text-slate-900">{req.medicineName}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {req.id.substring(0, 8)}</div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-emerald-600 font-black">
                                            <DollarSign className="w-3 h-3" />
                                            <span>{req.amountPaid}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            req.status === 'in_queue' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            req.status === 'processing' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-xs font-mono">{new Date(req.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        {req.status === 'in_queue' && (
                                            <button 
                                                onClick={() => handleStartProcessing(req)}
                                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                                            >
                                                Handle Request
                                            </button>
                                        )}
                                        {req.status === 'processing' && (
                                            <button 
                                                onClick={() => setHandlingRequest(req)}
                                                className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                                            >
                                                Resume
                                            </button>
                                        )}
                                        {req.status === 'completed' && (
                                            <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                                <Check className="w-4 h-4" /> Fulfilled
                                            </div>
                                        )}
                                    </td>
                                </>
                            )}
                        />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="workspace"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-50 border border-primary/20 rounded-[3rem] p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                        
                        <button 
                            onClick={() => setHandlingRequest(null)}
                            className="absolute top-8 right-8 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Queue
                        </button>
                        
                        <div className="mb-12 relative z-10">
                            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                                <Send className="w-4 h-4" />
                                Active Workspace
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Fulfilling: {handlingRequest.medicineName}</h2>
                            <div className="flex items-center gap-6 mt-4 text-slate-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    Patient ID: {handlingRequest.patientId.substring(0, 8)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Paid: ${handlingRequest.amountPaid}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="flex gap-4">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search pharmacies manually..."
                                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                                    />
                                </div>
                                <button 
                                    onClick={() => handleManualSearch(searchQuery)}
                                    disabled={searchLoading}
                                    className="px-10 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-slate-900/10 uppercase text-xs tracking-widest"
                                >
                                    {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                    {searchLoading ? 'Searching...' : 'Execute Search'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {searchResults.length > 0 ? searchResults.map(res => (
                                        <motion.div 
                                            key={res.id} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:border-primary/20 transition-all hover:shadow-xl group"
                                        >
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                    <Building2 className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl text-slate-900">{res.pharmacyName}</h3>
                                                    <p className="text-sm text-slate-400 font-medium">{res.address}</p>
                                                    <div className="mt-4 flex gap-3">
                                                        <span className="text-[10px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 uppercase tracking-widest">Available</span>
                                                        <span className="text-[10px] font-black px-3 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 uppercase tracking-widest">${res.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleComplete(res)}
                                                className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
                                            >
                                                <Send className="w-4 h-4" />
                                                Send to Patient
                                            </button>
                                        </motion.div>
                                    )) : (
                                        <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
                                            <AlertCircle className="w-12 h-12 text-slate-200" />
                                            <p className="text-slate-400 font-medium italic">No manual pharmacy results for your search. Try changing the name or batch.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientRequests;
