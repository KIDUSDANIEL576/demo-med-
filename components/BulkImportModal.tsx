
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionPlan, Pharmacy, InventoryItem, InventoryCategory } from '../types';
import { getPharmacyById, addInventoryItemsBulk } from '../services/mockApi';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, CheckIcon, ExclamationTriangleIcon } from '../constants';

interface BulkImportModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Check Plan/Download, 2: Upload/Preview, 3: Success
    const [parsedData, setParsedData] = useState<Partial<InventoryItem>[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (user?.pharmacyId) {
            getPharmacyById(Number(user.pharmacyId)).then(setPharmacy);
        }
    }, [user]);

    const isPlatinum = pharmacy?.plan === SubscriptionPlan.PLATINUM;

    const handleDownloadTemplate = () => {
        // Create a worksheet
        const wsData = [
            ["Item Name", "Category", "Batch Number", "Stock", "Expiry Date (YYYY-MM-DD)", "Cost Price", "Selling Price", "Brand", "SKU"],
            ["Amoxicillin 500mg", "Antibiotic", "B-123", 100, "2025-12-31", 5.00, 12.50, "GSK", "SKU-001"]
        ];
        
        const wb = (window as any).XLSX.utils.book_new();
        const ws = (window as any).XLSX.utils.aoa_to_sheet(wsData);
        (window as any).XLSX.utils.book_append_sheet(wb, ws, "Inventory Template");
        (window as any).XLSX.writeFile(wb, "MedIntelliCare_Inventory_Template.xlsx");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = (window as any).XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = (window as any).XLSX.utils.sheet_to_json(ws, { header: 1 });
                
                validateAndParse(data);
            } catch (err) {
                setValidationErrors(["Failed to parse file. Ensure it is a valid Excel file."]);
            }
        };
        reader.readAsBinaryString(file);
    };

    const validateAndParse = (rows: any[]) => {
        const headers = rows[0] as string[];
        // Basic header check
        if (!headers.includes("Item Name") || !headers.includes("SKU") || !headers.includes("Stock")) {
            setValidationErrors(["Invalid template format. Missing required columns."]);
            return;
        }

        const validItems: Partial<InventoryItem>[] = [];
        const errors: string[] = [];

        // Skip header row
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const item: any = {
                medicineName: row[0],
                category: row[1] || 'Other',
                batchNumber: row[2],
                stock: parseInt(row[3]),
                expiryDate: row[4],
                costPrice: parseFloat(row[5]),
                price: parseFloat(row[6]),
                brand: row[7],
                sku: row[8]
            };

            // Basic Validations
            if (!item.medicineName) errors.push(`Row ${i + 1}: Missing Item Name`);
            if (!item.batchNumber) errors.push(`Row ${i + 1}: Missing Batch Number`);
            if (isNaN(item.stock) || item.stock < 0) errors.push(`Row ${i + 1}: Invalid Stock`);
            if (!item.expiryDate) errors.push(`Row ${i + 1}: Missing Expiry Date`);
            if (isNaN(item.price) || item.price < 0) errors.push(`Row ${i + 1}: Invalid Selling Price`);
            if (!item.sku) errors.push(`Row ${i + 1}: Missing SKU`);

            validItems.push(item);
        }

        setParsedData(validItems);
        setValidationErrors(errors);
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!pharmacy || !user) return;
        setLoading(true);
        try {
            await addInventoryItemsBulk(parsedData, pharmacy.id, user.name);
            setStep(3);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            setValidationErrors(["Upload failed on server."]);
        } finally {
            setLoading(false);
        }
    };

    if (!pharmacy) return null;

    // --- GATE: Upgrade Required ---
    if (!isPlatinum) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md text-center border-t-4 border-gray-400">
                    <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Upgrade Required</h2>
                    <p className="text-slate-600 mb-6">
                        Bulk inventory import via Excel is an exclusive feature of the <span className="font-bold text-sky-600">Platinum Plan</span>.
                    </p>
                    <div className="flex flex-col gap-3">
                        <a href="/#/dashboard/upgrade-plans" className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                            Upgrade to Platinum
                        </a>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-700 font-medium">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN FLOW: Platinum User ---
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Bulk Inventory Import</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="text-center space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-left">
                                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                    <ArrowDownTrayIcon className="w-5 h-5"/> Step 1: Download Template
                                </h3>
                                <p className="text-sm text-blue-700 mb-4">
                                    Use our strict Excel template to ensure your data is imported correctly. 
                                    Do not change the header row.
                                </p>
                                <button onClick={handleDownloadTemplate} className="px-4 py-2 bg-white border border-blue-300 text-blue-700 font-bold rounded shadow-sm hover:bg-blue-50">
                                    Download .xlsx Template
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 hover:bg-gray-50 transition-colors relative">
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls" 
                                    onChange={handleFileUpload} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-3" />
                                    <p className="font-bold text-gray-600">Click to Upload Filled Template</p>
                                    <p className="text-sm text-gray-400">.xlsx files only</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">Preview & Validation</h3>
                                <div className="text-sm">
                                    <span className="font-bold text-green-600">{parsedData.length} Valid</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className={`font-bold ${validationErrors.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                        {validationErrors.length} Errors
                                    </span>
                                </div>
                            </div>

                            {validationErrors.length > 0 ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-5 h-5"/> Fix Issues Before Importing
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                        {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                    <button onClick={() => setStep(1)} className="mt-4 text-sm text-red-800 underline">Upload a fixed file</button>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <CheckIcon className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                    <p className="text-green-800 font-bold">File looks good!</p>
                                    <p className="text-sm text-green-700">Ready to import {parsedData.length} items.</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                                <button onClick={() => setStep(1)} className="px-4 py-2 bg-gray-200 rounded font-medium text-gray-700 hover:bg-gray-300">Back</button>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={validationErrors.length > 0 || loading}
                                    className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                                >
                                    {loading ? 'Importing...' : 'Confirm Import'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <CheckIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Import Successful!</h3>
                            <p className="text-gray-500 mt-2">Your inventory has been updated.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
