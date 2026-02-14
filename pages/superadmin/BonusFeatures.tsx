
import React, { useState, useEffect } from 'react';
import { getPharmacies, getTenantFeatureOverrides, setTenantFeatureOverride, deleteTenantFeatureOverride, getDoctors } from '../../services/mockApi';
import { Pharmacy, TenantFeatureOverride, User } from '../../types';
import { MagnifyingGlassIcon, TrashIcon, SparklesIcon, PencilIcon } from '../../constants';

// NOTE: FOR PRODUCTION BACKEND ARCHITECTURE
// To achieve "best performance" as requested, the backend for this module 
// should be implemented using Python 'uv' (FastAPI with uvloop) or Rust 
// to ensure near-zero latency for feature flag resolution. 
// The frontend implementation below uses Optimistic UI updates to simulate this speed.

const EXTENDED_BONUS_FEATURES = [
    { key: 'sales_module', label: 'Prescription Lookup' }, 
    { key: 'export_reports', label: 'Advanced Analytics' }, 
    { key: 'prescription_builder', label: 'Rx Builder' },
    { key: 'api_access', label: 'API Access Port' }, 
    { key: 'marketplace', label: 'B2B Marketplace' }, // Added Marketplace
    { key: 'priority_support', label: 'Priority Support' },
    { key: 'custom_branding', label: 'Custom Branding' }
];

const BonusFeatures: React.FC = () => {
    const [clients, setClients] = useState<(Pharmacy | User)[]>([]); // Pharmacies and Doctors
    const [overrides, setOverrides] = useState<TenantFeatureOverride[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [selectedClient, setSelectedClient] = useState<Pharmacy | User | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    
    // Form State for new/edit bonus
    const [newBonusKey, setNewBonusKey] = useState(EXTENDED_BONUS_FEATURES[0].key);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState('');
    const [isEditingBonus, setIsEditingBonus] = useState(false);

    // Revoke Confirmation State
    const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [pharmacies, doctors, overridesData] = await Promise.all([
            getPharmacies(),
            getDoctors(),
            getTenantFeatureOverrides()
        ]);
        
        // Combine Pharmacies and Doctors into a single "Client" list for the table
        const combinedClients = [
            ...pharmacies.map(p => ({ ...p, clientType: 'Pharmacy' })),
            ...doctors.map(d => ({ ...d, clientType: 'Doctor' }))
        ];
        
        setClients(combinedClients);
        setOverrides(overridesData);
        setLoading(false);
    };

    const getClientOverrides = (clientId: number | string) => {
        return overrides.filter(o => String(o.pharmacyId) === String(clientId));
    };

    const handleOpenManage = (client: Pharmacy | User) => {
        setSelectedClient(client);
        setNewBonusKey(EXTENDED_BONUS_FEATURES[0].key);
        setStartDate(new Date().toISOString().split('T')[0]);
        // Default expiry 30 days
        const future = new Date();
        future.setDate(future.getDate() + 30);
        setExpiryDate(future.toISOString().split('T')[0]);
        setIsEditingBonus(false);
        setIsManageModalOpen(true);
    };

    const handleEditBonus = (bonus: TenantFeatureOverride) => {
        setNewBonusKey(bonus.featureKey);
        setStartDate(bonus.startDate || new Date().toISOString().split('T')[0]);
        setExpiryDate(bonus.expiryDate || '');
        setIsEditingBonus(true);
    };

    const handleAddOrUpdateBonus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) return;

        // OPTIMISTIC UPDATE: Update UI immediately before API Call
        const tempId = `temp-${Date.now()}`;
        const newOverrideObj: TenantFeatureOverride = {
            id: tempId,
            pharmacyId: selectedClient.id,
            featureKey: newBonusKey,
            enabled: true,
            startDate,
            expiryDate,
            createdBy: '1'
        };

        // If editing, remove old one first visually
        if (isEditingBonus) {
             setOverrides(prev => prev.map(o => o.featureKey === newBonusKey && String(o.pharmacyId) === String(selectedClient.id) ? newOverrideObj : o));
        } else {
             setOverrides(prev => [...prev, newOverrideObj]);
        }

        // Reset form immediately
        if (isEditingBonus) {
             setIsEditingBonus(false);
             setNewBonusKey(EXTENDED_BONUS_FEATURES[0].key);
        }

        // Async API Call
        await setTenantFeatureOverride(
            selectedClient.id,
            newBonusKey,
            true,
            startDate,
            expiryDate
        );
        
        // Background refresh to ensure consistency
        getTenantFeatureOverrides().then(setOverrides);
    };

    const handleInitiateRevoke = (overrideId: string) => {
        setRevokeTargetId(overrideId);
    };

    const confirmRevoke = async () => {
        if (!revokeTargetId) return;
        
        // OPTIMISTIC UPDATE: Remove immediately
        setOverrides(prev => prev.filter(o => o.id !== revokeTargetId));
        
        // Close modal immediately
        setRevokeTargetId(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);

        // API Call in background
        await deleteTenantFeatureOverride(revokeTargetId);
        // Sync
        getTenantFeatureOverrides().then(setOverrides);
    };

    const cancelRevoke = () => {
        setRevokeTargetId(null);
    };

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading client data...</div>;

    return (
        <div className="space-y-8 animate-fade-in relative">
            {showSuccessToast && (
                <div className="fixed top-4 right-4 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl animate-fade-in flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-bold">Bonus feature revoked successfully.</span>
                </div>
            )}

            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white shadow-lg">
                    <SparklesIcon className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Bonus Feature Manager</h1>
                    <p className="text-slate-500">Grant temporary access to premium features for specific clients.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-base-300 p-4 rounded-lg shadow flex items-center gap-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search clients by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none w-full text-slate-700 placeholder-slate-400"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => {
                    const activeBonuses = getClientOverrides(client.id);
                    const isDoctor = (client as any).clientType === 'Doctor';
                    const plan = (client as any).plan || 'N/A';

                    return (
                        <div key={client.id} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${isDoctor ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {(client as any).clientType}
                                    </span>
                                    <span className="text-xs text-slate-400">Plan: {plan}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 truncate" title={client.name}>{client.name}</h3>
                                <p className="text-sm text-slate-500 mb-4 truncate">{client.email}</p>
                                
                                <div className="bg-slate-50 rounded-lg p-3 min-h-[80px]">
                                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Active Bonuses</p>
                                    {activeBonuses.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {activeBonuses.map(bonus => {
                                                const featureLabel = EXTENDED_BONUS_FEATURES.find(f => f.key === bonus.featureKey)?.label || bonus.featureKey;
                                                return (
                                                    <span key={bonus.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200" title={`Expires: ${bonus.expiryDate || 'Never'}`}>
                                                        {featureLabel}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No active bonuses</p>
                                    )}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleOpenManage(client)}
                                className="mt-4 w-full py-2 bg-slate-800 text-white rounded-md font-bold text-sm hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                            >
                                <SparklesIcon className="w-4 h-4" /> Manage Bonuses
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Manage Bonuses Modal */}
            {isManageModalOpen && selectedClient && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Manage Bonuses: {selectedClient.name}</h2>
                            <p className="text-sm text-slate-500">Add or revoke feature grants for this client.</p>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            {/* Add/Edit New Bonus Form */}
                            <div className={`border p-4 rounded-lg transition-colors ${isEditingBonus ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-100'}`}>
                                <h3 className={`text-sm font-bold mb-3 uppercase tracking-wide ${isEditingBonus ? 'text-blue-900' : 'text-amber-900'}`}>
                                    {isEditingBonus ? 'Edit Active Grant' : 'Grant New Feature'}
                                </h3>
                                <form onSubmit={handleAddOrUpdateBonus} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-800 mb-1">Feature</label>
                                            <select 
                                                value={newBonusKey}
                                                onChange={e => setNewBonusKey(e.target.value)}
                                                className="w-full p-2 rounded border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                                                disabled={isEditingBonus} 
                                            >
                                                {EXTENDED_BONUS_FEATURES.map(f => (
                                                    <option key={f.key} value={f.key}>{f.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-800 mb-1">Start Date</label>
                                            <input 
                                                type="date" 
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                                className="w-full p-2 rounded border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-800 mb-1">Expiry Date (Optional)</label>
                                            <input 
                                                type="date" 
                                                value={expiryDate}
                                                onChange={e => setExpiryDate(e.target.value)}
                                                className="w-full p-2 rounded border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className={`flex-1 py-2 text-white rounded font-bold transition-colors shadow-sm ${isEditingBonus ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                                            {isEditingBonus ? 'Update Grant' : 'Grant Bonus Access'}
                                        </button>
                                        {isEditingBonus && (
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setIsEditingBonus(false);
                                                    setNewBonusKey(EXTENDED_BONUS_FEATURES[0].key);
                                                    setStartDate(new Date().toISOString().split('T')[0]);
                                                    const future = new Date();
                                                    future.setDate(future.getDate() + 30);
                                                    setExpiryDate(future.toISOString().split('T')[0]);
                                                }} 
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Active List */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Active Feature Grants</h3>
                                <div className="space-y-2">
                                    {getClientOverrides(selectedClient.id).length > 0 ? (
                                        getClientOverrides(selectedClient.id).map(bonus => {
                                            const featureLabel = EXTENDED_BONUS_FEATURES.find(f => f.key === bonus.featureKey)?.label || bonus.featureKey;
                                            return (
                                                <div key={bonus.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                    <div>
                                                        <span className="font-bold text-slate-800">{featureLabel}</span>
                                                        <div className="text-xs text-slate-500 mt-1 flex gap-4">
                                                            <span>Start: {bonus.startDate || 'Immediate'}</span>
                                                            <span className={bonus.expiryDate ? 'text-orange-600' : 'text-green-600'}>
                                                                Ends: {bonus.expiryDate || 'Never'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleEditBonus(bonus)}
                                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                                            title="Edit Bonus Dates"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleInitiateRevoke(bonus.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                            title="Revoke Bonus"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <p className="text-slate-400 text-sm">No active bonuses for this client.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button 
                                onClick={() => setIsManageModalOpen(false)}
                                className="px-6 py-2 bg-white border border-gray-300 rounded-md font-bold text-slate-700 hover:bg-gray-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revoke Confirmation Modal */}
            {revokeTargetId && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center animate-fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <TrashIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Revoke</h3>
                            <p className="text-sm text-slate-600 mb-6">
                                Are you sure you want to revoke this bonus feature? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={cancelRevoke}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmRevoke}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
                                >
                                    Confirm Revoke
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BonusFeatures;
