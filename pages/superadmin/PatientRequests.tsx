
import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { 
    getAllPatientRequests, 
    updatePatientRequestStatus, 
    searchPublicInventory, 
    completePatientRequestWithResult 
} from '../../services/mockApi';
import { PatientRequest, PublicInventoryResult } from '../../types';
import { MagnifyingGlassIcon, BuildingStorefrontIcon, CheckIcon, SparklesIcon } from '../../constants';

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
                alert("Request completed and SMS sent!");
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
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-lg shadow-lg">
                    <SparklesIcon className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Agent Request Queue</h1>
                    <p className="text-slate-500">Human-assisted fulfillment for patient medicine discoveries.</p>
                </div>
            </div>

            {!handlingRequest ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <DataTable<PatientRequest>
                        columns={columns}
                        data={requests.filter(r => r.status !== 'pending_payment')}
                        renderRow={(req) => (
                            <tr key={req.id} className={req.status === 'in_queue' ? 'bg-indigo-50/30' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{req.medicineName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-mono font-bold">${req.amountPaid}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                                        req.status === 'in_queue' ? 'bg-amber-100 text-amber-700' :
                                        req.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                        'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {req.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                                    {new Date(req.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {req.status === 'in_queue' && (
                                        <button 
                                            onClick={() => handleStartProcessing(req)}
                                            className="px-4 py-1.5 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition-transform active:scale-95 font-bold"
                                        >
                                            Handle Request
                                        </button>
                                    )}
                                    {req.status === 'processing' && (
                                        <button 
                                            onClick={() => setHandlingRequest(req)}
                                            className="px-4 py-1.5 bg-blue-500 text-white rounded shadow hover:bg-blue-600 font-bold"
                                        >
                                            Resume
                                        </button>
                                    )}
                                    {req.status === 'completed' && (
                                        <span className="text-emerald-500 flex items-center gap-1 font-bold">
                                            <CheckIcon className="w-4 h-4"/> Fulfilled
                                        </span>
                                    )}
                                </td>
                            </tr>
                        )}
                    />
                </div>
            ) : (
                <div className="bg-slate-50 border-2 border-indigo-200 rounded-2xl p-8 animate-slide-in-up relative">
                    <button 
                        onClick={() => setHandlingRequest(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
                    >
                        [ Back to Queue ]
                    </button>
                    
                    <div className="mb-8">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Active Workspace</span>
                        <h2 className="text-2xl font-black text-slate-800 mt-1">Fulfilling: {handlingRequest.medicineName}</h2>
                        <p className="text-slate-500 text-sm">Patient ID: {handlingRequest.patientId} | Paid: ${handlingRequest.amountPaid}</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search pharmacies manually..."
                                className="flex-1 p-4 bg-white border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <button 
                                onClick={() => handleManualSearch(searchQuery)}
                                disabled={searchLoading}
                                className="px-8 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2"
                            >
                                <MagnifyingGlassIcon className="w-5 h-5"/>
                                {searchLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {searchResults.length > 0 ? searchResults.map(res => (
                                <div key={res.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-indigo-300 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{res.pharmacyName}</h3>
                                        <p className="text-sm text-slate-500">{res.address}</p>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Available</span>
                                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">${res.price}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleComplete(res)}
                                        className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
                                    >
                                        Send to Patient
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 italic text-slate-400">
                                    No manual pharmacy results for your search. Try changing the name or batch.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientRequests;
