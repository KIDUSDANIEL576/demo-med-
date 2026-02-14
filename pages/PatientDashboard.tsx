
import React, { useState } from 'react';
import { searchPublicInventory } from '../services/mockApi';

const PatientDashboard: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setLoading(true);
        setHasSearched(true);
        const data = await searchPublicInventory(query);
        setResults(data);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Public Header */}
            <header className="bg-white shadow-sm py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-primary font-bold text-xl">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                            <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="currentColor"/>
                        </svg>
                        MedIntelliCare <span className="text-slate-400 font-normal">Patient Connect</span>
                    </div>
                    <a href="/#/login" className="text-sm font-medium text-slate-600 hover:text-primary">Pharmacy/Doctor Login</a>
                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Find Medicine Near You
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-slate-500">
                        Check availability of essential medicines in real-time across our network of pharmacies.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-12">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter medicine name (e.g., Amoxicillin)"
                            className="w-full p-4 pr-32 text-lg border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors disabled:bg-gray-300"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {hasSearched && (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            {results.length > 0 ? `Found ${results.length} results` : 'No results found'}
                        </h2>
                        <div className="space-y-4">
                            {results.map((item, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{item.medicineName}</h3>
                                            <p className="text-slate-600 font-medium mt-1">{item.pharmacyName}</p>
                                            <p className="text-sm text-slate-500">{item.pharmacyAddress}</p>
                                        </div>
                                        <div className="text-right">
                                            {item.isRecalled ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                    ⚠️ RECALLED
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.stockStatus === 'HIGH' ? 'bg-green-100 text-green-800' : 
                                                    item.stockStatus === 'MEDIUM' ? 'bg-blue-100 text-blue-800' : 
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {item.stockStatus === 'HIGH' ? 'In Stock' : 
                                                     item.stockStatus === 'MEDIUM' ? 'Available' : 
                                                     'Low Stock - Available Here'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-white py-8 border-t mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                    &copy; 2025 MedIntelliCare. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default PatientDashboard;
