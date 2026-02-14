
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { searchPublicInventory, initiatePaidRequest, confirmPaidRequest, getSearchSuggestions } from '../../services/mockApi';
import { suggestMedicinesForSymptoms } from '../../services/aiService';
import { PublicInventoryResult, PatientRequest } from '../../types';
import { MagnifyingGlassIcon, SparklesIcon } from '../../constants';

const PatientSearch = () => {
    const { patient } = useAuth();
    const [query, setQuery] = useState('');
    const [aiHelp, setAiHelp] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [results, setResults] = useState<PublicInventoryResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState<PublicInventoryResult | null>(null);
    const [activeRequest, setActiveRequest] = useState<PatientRequest | null>(null);
    const [step, setStep] = useState<'search' | 'pay' | 'success'>('search');

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length > 1) {
                const data = await getSearchSuggestions(query);
                setSuggestions(data);
            } else {
                setSuggestions([]);
            }
        };
        fetchSuggestions();
    }, [query]);

    const handleAISuggestion = async () => {
        if (query.length < 5) return;
        setAiLoading(true);
        try {
            const meds = await suggestMedicinesForSymptoms(query);
            setAiHelp(meds || null);
        } catch (err) {
            console.error(err);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSearch = async (val: string) => {
        setQuery(val);
        setShowSuggestions(false);
        setLoading(true);
        setAiHelp(null);
        try {
            const data = await searchPublicInventory(val);
            setResults(data);
        } catch (err) {
            alert("Search failed.");
        } finally {
            setLoading(false);
        }
    };

    const startRequest = async (item: PublicInventoryResult) => {
        if (!patient) {
            alert("Please sign in to make a request.");
            return;
        }
        setProcessing(true);
        try {
            const request = await initiatePaidRequest(patient.id, item);
            setSelectedItem(item);
            setActiveRequest(request);
            setStep('pay');
        } catch (err) {
            alert("Failed to initiate request.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 animate-fade-in pb-32">
            {step === 'search' && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Intelligent Discovery</h1>
                        <p className="mt-4 text-slate-500 text-lg font-medium">Search for medications or describe symptoms for AI-guided matches.</p>
                    </div>

                    <div className="relative max-w-2xl mx-auto z-50">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onFocus={() => setShowSuggestions(true)}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                                placeholder="Describe symptoms or enter medicine name..."
                                className="w-full p-6 pr-44 bg-white border-2 border-slate-100 rounded-[2rem] shadow-2xl focus:ring-8 focus:ring-indigo-500/5 outline-none text-lg transition-all"
                            />
                            <div className="absolute right-2 top-2 bottom-2 flex gap-1">
                                <button
                                    onClick={handleAISuggestion}
                                    disabled={aiLoading || query.length < 5}
                                    className="px-4 bg-indigo-50 text-indigo-600 font-black rounded-2xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                    title="AI Symptom Guide"
                                >
                                    <SparklesIcon className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => handleSearch(query)}
                                    disabled={loading}
                                    className="px-8 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-colors disabled:bg-slate-300 flex items-center gap-2"
                                >
                                    SEARCH
                                </button>
                            </div>

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(s)}
                                            className="w-full text-left p-4 hover:bg-slate-50 font-bold text-slate-700 transition-colors border-b border-slate-50 last:border-0"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {aiHelp && (
                            <div className="mt-4 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-slide-in-up">
                                <div className="flex items-center gap-3">
                                    <SparklesIcon className="w-5 h-5 text-indigo-200" />
                                    <p className="text-sm font-bold">AI Recommended Searches: <span className="underline decoration-indigo-300">{aiHelp}</span></p>
                                </div>
                                <button onClick={() => setAiHelp(null)} className="text-white/50 hover:text-white">&times;</button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {results.map((item) => (
                            <div key={item.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all flex justify-between items-center group">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">{item.medicineName}</h3>
                                    <p className="text-indigo-600 font-bold mt-1 uppercase tracking-widest text-xs">{item.pharmacyName}</p>
                                    <p className="text-sm text-slate-400 font-medium mt-1">{item.address}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-4">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Price</div>
                                    <div className="text-4xl font-black text-slate-900">${item.price}</div>
                                    <button 
                                        onClick={() => startRequest(item)}
                                        disabled={item.available === 'NO' || processing}
                                        className="px-8 py-3 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                    >
                                        RESERVE STOCK
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {step === 'pay' && selectedItem && (
                 <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in-up border border-slate-100">
                    <div className="bg-slate-900 p-10 text-white text-center">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Secure Checkout</h2>
                        <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Transaction Security: High</p>
                    </div>
                    <div className="p-10 space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-4">
                                <span className="text-slate-400 font-bold uppercase tracking-widest">Medicine</span>
                                <span className="font-black text-slate-800">{selectedItem.medicineName}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-4">
                                <span className="text-slate-400 font-bold uppercase tracking-widest">Clinic/Pharma</span>
                                <span className="font-black text-slate-800">{selectedItem.pharmacyName}</span>
                            </div>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-3xl flex justify-between items-center border border-indigo-100">
                            <span className="font-black text-indigo-900 uppercase tracking-widest text-xs">Total</span>
                            <span className="text-3xl font-black text-indigo-600">${selectedItem.price}</span>
                        </div>
                        <div className="space-y-4 pt-4">
                            <button 
                                onClick={async () => {
                                    if (!activeRequest) return;
                                    setProcessing(true);
                                    const txId = `TEL-${Date.now()}`;
                                    await confirmPaidRequest(activeRequest.id, txId);
                                    setStep('success');
                                    setProcessing(false);
                                }}
                                disabled={processing}
                                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:bg-slate-300"
                            >
                                {processing ? 'AUTHORIZING...' : 'PAY WITH TELEBIRR'}
                            </button>
                            <button onClick={() => setStep('search')} className="w-full text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel Request</button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'success' && activeRequest && (
                <div className="max-w-md mx-auto text-center space-y-8 animate-fade-in py-10">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner border-4 border-white shadow-emerald-500/20">
                        ✓
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">ORDER IN QUEUE</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Payment verified. Your request for <span className="text-indigo-600 font-bold">{selectedItem?.medicineName}</span> is now prioritized at <span className="font-bold text-slate-800">{selectedItem?.pharmacyName}</span>.
                        </p>
                    </div>
                    <button 
                        onClick={() => { setStep('search'); setResults([]); setQuery(''); }}
                        className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20"
                    >
                        START NEW SEARCH
                    </button>
                </div>
            )}
        </div>
    );
};

export default PatientSearch;
