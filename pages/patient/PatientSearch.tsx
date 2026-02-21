
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { searchPublicInventory, initiatePaidRequest, confirmPaidRequest, getSearchSuggestions } from '../../services/mockApi';
import { suggestMedicinesForSymptoms, findNearbyPharmacies } from '../../services/aiService';
import { PublicInventoryResult, PatientRequest } from '../../types';
import { Search, Sparkles, MapPin, Navigation, CreditCard, CheckCircle2, ChevronRight, Info, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

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

    // Google Maps Grounding State
    const [nearbyPharmacies, setNearbyPharmacies] = useState<{ text: string, groundingChunks: any[] } | null>(null);
    const [mapsLoading, setMapsLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error("Error getting location:", error)
            );
        }
    }, []);

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
        if (query.length < 3) return;
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
        setNearbyPharmacies(null);
        
        try {
            // 1. Search our internal network
            const data = await searchPublicInventory(val);
            setResults(data);

            // 2. If we have location, search nearby pharmacies via Google Maps Grounding
            if (userLocation) {
                setMapsLoading(true);
                const mapsData = await findNearbyPharmacies({ 
                    latitude: userLocation.lat, 
                    longitude: userLocation.lng 
                }, val);
                setNearbyPharmacies(mapsData);
            }
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
            setMapsLoading(false);
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
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-12 pb-32">
            <AnimatePresence mode="wait">
                {step === 'search' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                    >
                        {/* Hero Section */}
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase"
                            >
                                <Sparkles className="w-4 h-4" />
                                AI-Powered Healthcare
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                                Find Your Medicine <br />
                                <span className="text-primary italic font-serif">Instantly.</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
                                Search across our network of verified pharmacies or describe your symptoms for intelligent guidance.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-3xl mx-auto group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-all duration-500" />
                                <div className="relative flex items-center bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-primary/5 p-2 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                                    <div className="pl-6 pr-4">
                                        <Search className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={query}
                                        onFocus={() => setShowSuggestions(true)}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                                        placeholder="Describe symptoms or enter medicine name..."
                                        className="flex-grow py-4 bg-transparent outline-none text-lg text-slate-800 placeholder:text-slate-400"
                                    />
                                    <div className="flex items-center gap-2 pr-2">
                                        <button
                                            onClick={handleAISuggestion}
                                            disabled={aiLoading || query.length < 3}
                                            className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all disabled:opacity-30"
                                            title="AI Symptom Guide"
                                        >
                                            <Sparkles className={`w-5 h-5 ${aiLoading ? 'animate-pulse' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleSearch(query)}
                                            disabled={loading}
                                            className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:bg-slate-300 flex items-center gap-2"
                                        >
                                            {loading ? 'Searching...' : 'Search'}
                                        </button>
                                    </div>
                                </div>

                                {/* Suggestions Dropdown */}
                                <AnimatePresence>
                                    {showSuggestions && suggestions.length > 0 && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2"
                                        >
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSearch(s)}
                                                    className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl font-semibold text-slate-700 transition-all flex items-center gap-3"
                                                >
                                                    <Search className="w-4 h-4 text-slate-300" />
                                                    {s}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* AI Help Banner */}
                            <AnimatePresence>
                                {aiHelp && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-6 p-5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-3xl shadow-xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-white/20 rounded-xl">
                                                <Sparkles className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider">AI Recommended Searches</p>
                                                <p className="text-lg font-bold">{aiHelp}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setAiHelp(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Results Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Internal Network Results */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        Verified Network Stock
                                    </h2>
                                    <span className="text-sm font-medium text-slate-400">{results.length} results</span>
                                </div>

                                <div className="space-y-4">
                                    {results.length > 0 ? (
                                        results.map((item, idx) => (
                                            <motion.div 
                                                key={item.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{item.medicineName}</h3>
                                                        {item.isRecalled && (
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">RECALLED</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                                        <MapPin className="w-4 h-4" />
                                                        {item.pharmacyName}
                                                    </div>
                                                    <p className="text-sm text-slate-400 font-medium">{item.address}</p>
                                                </div>
                                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price</div>
                                                        <div className="text-3xl font-black text-slate-900">${item.price}</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => startRequest(item)}
                                                        disabled={item.available === 'NO' || processing}
                                                        className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 active:scale-95 disabled:bg-slate-200"
                                                    >
                                                        Reserve
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        !loading && query && (
                                            <div className="bg-slate-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
                                                <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-500 font-medium">No stock found in our verified network for "{query}".</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Google Maps Grounding Results */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <Navigation className="w-6 h-6 text-primary" />
                                        Nearby Pharmacies
                                    </h2>
                                </div>

                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden min-h-[400px]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
                                    
                                    {mapsLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
                                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            <p className="text-slate-400 font-medium animate-pulse">Scanning nearby locations...</p>
                                        </div>
                                    ) : nearbyPharmacies ? (
                                        <div className="space-y-6 relative z-10">
                                            <div className="prose prose-invert prose-sm">
                                                <ReactMarkdown>{nearbyPharmacies.text}</ReactMarkdown>
                                            </div>
                                            
                                            <div className="space-y-3 pt-4 border-t border-white/10">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Verified Sources</p>
                                                {nearbyPharmacies.groundingChunks.map((chunk: any, i: number) => (
                                                    chunk.web && (
                                                        <a 
                                                            key={i}
                                                            href={chunk.web.uri}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold text-xs">
                                                                    {i + 1}
                                                                </div>
                                                                <span className="text-sm font-semibold text-slate-200 truncate max-w-[180px]">
                                                                    {chunk.web.title || "View on Maps"}
                                                                </span>
                                                            </div>
                                                            <Navigation className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full space-y-6 py-20 text-center">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                                                <MapPin className="w-10 h-10 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-slate-300 font-bold text-lg">Real-time Discovery</p>
                                                <p className="text-slate-500 text-sm mt-2">Search for medicine to see nearby pharmacies outside our network.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                
                {step === 'pay' && selectedItem && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="max-w-xl mx-auto"
                    >
                        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
                            <div className="bg-slate-900 p-12 text-white text-center relative">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                                <div className="relative z-10 space-y-4">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <CreditCard className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold uppercase tracking-tight">Secure Payment</h2>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">MedIntelliCare Escrow Protected</p>
                                </div>
                            </div>
                            <div className="p-12 space-y-10">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Medicine</span>
                                        <span className="text-xl font-black text-slate-900">{selectedItem.medicineName}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Provider</span>
                                        <span className="text-lg font-bold text-primary">{selectedItem.pharmacyName}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[2rem] flex justify-between items-center border border-slate-100">
                                    <div className="space-y-1">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Grand Total</span>
                                        <div className="text-sm text-slate-500">Includes service fee</div>
                                    </div>
                                    <span className="text-5xl font-black text-slate-900">${selectedItem.price}</span>
                                </div>
                                <div className="space-y-4">
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
                                        className="w-full py-6 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:bg-slate-300 text-lg"
                                    >
                                        {processing ? 'AUTHORIZING...' : 'PAY WITH TELEBIRR'}
                                    </button>
                                    <button onClick={() => setStep('search')} className="w-full py-4 text-slate-400 text-sm font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">
                                        Cancel Transaction
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'success' && activeRequest && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto text-center space-y-10 py-20"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
                            <div className="relative w-32 h-32 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto text-6xl shadow-2xl shadow-emerald-500/40">
                                <CheckCircle2 className="w-16 h-16" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">Stock Reserved!</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                                Your payment for <span className="text-primary font-bold">{selectedItem?.medicineName}</span> has been confirmed. 
                                The pharmacy has been notified to set aside your medication.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl max-w-md mx-auto space-y-4">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pickup Location</p>
                                    <p className="font-bold text-slate-800">{selectedItem?.pharmacyName}</p>
                                    <p className="text-sm text-slate-500">{selectedItem?.address}</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setStep('search'); setResults([]); setQuery(''); }}
                            className="px-12 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-2xl shadow-slate-900/20"
                        >
                            Return to Search
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientSearch;

