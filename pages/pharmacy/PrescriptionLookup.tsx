
import React, { useState, useMemo } from 'react';
import { getPrescriptionByCode } from '../../services/mockApi';
import { Prescription } from '../../types';
import { useInventory } from '../../contexts/InventoryContext';

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

        const quantityRequired = 10; // Same hardcoded quantity as API
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Prescription Lookup</h1>
            
            <div className="bg-base-300 shadow-lg rounded-lg p-6">
                <form onSubmit={handleSearch} className="flex items-center space-x-4">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter Prescription Code (e.g., RX-7H23K9D)"
                        className="flex-grow p-3 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {prescription === undefined && null}
            {prescription === null && <div className="text-center p-6 bg-base-300 rounded-lg shadow-md">No prescription found for this code.</div>}
            {prescription && (
                <div className="bg-base-300 shadow-2xl rounded-lg p-8 animate-fade-in border-t-4 border-primary">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-primary">{prescription.clinicName}</h2>
                            <p className="text-slate-600">{prescription.doctorName}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-mono text-lg bg-base-200 px-3 py-1 rounded-md">{prescription.prescriptionCode}</p>
                             <p className="text-sm text-slate-500 mt-1">Issued: {prescription.createdAt}</p>
                        </div>
                    </div>
                    <hr className="my-6"/>
                    <div>
                        <h3 className="text-lg font-semibold">Patient: {prescription.patientName}</h3>
                        <div className="mt-4 bg-base-100 p-4 rounded-lg">
                            <p className="text-slate-800 font-medium">Prescription Details:</p>
                            <p className="text-slate-600 whitespace-pre-wrap">{prescription.details}</p>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-2">Inventory Check</h3>
                        {inventoryCheck ? (
                            <div className={`p-3 rounded-md text-sm ${inventoryCheck.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {inventoryCheck.message}
                            </div>
                        ) : <p className="p-3 bg-gray-100 rounded-md text-sm">Checking inventory...</p>}
                        
                        <button
                            onClick={handleMakeSale}
                            disabled={!inventoryCheck?.available || loading}
                            className="w-full mt-4 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Fill Prescription & Make Sale'}
                        </button>
                    </div>
                    {saleStatus && (
                        <div className={`mt-4 p-3 rounded-md text-center ${saleStatus.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {saleStatus.message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PrescriptionLookup;