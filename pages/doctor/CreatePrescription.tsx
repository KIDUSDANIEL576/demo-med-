
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { createPrescription } from '../../services/mockApi';
import { draftPrescriptionWithAI } from '../../services/aiService';
import { Prescription } from '../../types';
import UpgradePlan from '../../components/UpgradePlan';
import { SparklesIcon } from '../../constants';

const CreatePrescription: React.FC = () => {
    const { user } = useAuth();
    const { hasAccess, loading, checkAccess } = usePlanAccess();
    
    const [patientName, setPatientName] = useState('');
    const [details, setDetails] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [generatedPrescription, setGeneratedPrescription] = useState<Prescription | null>(null);

    useEffect(() => {
        checkAccess('prescription_builder');
    }, []);

    const handleAIDraft = async () => {
        if (!symptoms.trim()) {
            alert("Please enter patient symptoms first.");
            return;
        }
        setAiLoading(true);
        try {
            const draft = await draftPrescriptionWithAI(symptoms);
            setDetails(draft || '');
        } catch (err) {
            alert("AI Drafting failed. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !patientName || !details) return;

        setSubmitLoading(true);
        const newPrescription = await createPrescription({
            doctorId: user.id,
            patientName,
            details,
        });
        setGeneratedPrescription(newPrescription);
        setPatientName('');
        setDetails('');
        setSymptoms('');
        setSubmitLoading(false);
    };
    
    const copyToClipboard = () => {
        if(generatedPrescription?.prescriptionCode){
            navigator.clipboard.writeText(generatedPrescription.prescriptionCode);
            alert("Code copied to clipboard!");
        }
    }
    
    const downloadPdf = () => {
        if (generatedPrescription) {
            window.open(`/#/prescription/print/${generatedPrescription.id}`, '_blank');
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse">Checking Clinical Access...</div>;

    if (!hasAccess('prescription_builder')) {
        return (
             <div className="p-8">
                 <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 shadow-md rounded-r-md">
                     <p className="text-red-700 font-medium">Access Denied: Your associated pharmacy must be on the Platinum plan to use the Prescription Builder.</p>
                 </div>
                 <UpgradePlan featureName="Prescription Builder" />
             </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Clinical Rx Builder</h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase border border-indigo-100">
                    <SparklesIcon className="w-4 h-4" /> AI Enabled
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-base-300 shadow-lg rounded-xl p-8 space-y-6 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="patientName" className="block text-sm font-bold text-slate-700 mb-1">Patient Full Name</label>
                            <input
                                type="text"
                                id="patientName"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>
                        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <label htmlFor="symptoms" className="block text-xs font-black text-indigo-700 uppercase tracking-widest mb-2">Patient Symptoms / Diagnosis</label>
                            <textarea
                                id="symptoms"
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                rows={3}
                                className="w-full p-3 bg-white border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Describe condition (e.g., severe allergy, hypertension follow-up)..."
                            />
                            <button
                                type="button"
                                onClick={handleAIDraft}
                                disabled={aiLoading || !symptoms}
                                className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white text-xs font-black uppercase rounded-lg hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                {aiLoading ? 'AI is drafting...' : 'Draft Rx with Gemini Intelligence'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="details" className="block text-sm font-bold text-slate-700 mb-1">Medication Details</label>
                        <textarea
                            id="details"
                            rows={10}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-900 font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Structured prescription format..."
                            required
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
                    >
                        {submitLoading ? 'Finalizing...' : 'Issue Final Prescription'}
                    </button>
                </div>
            </form>

            {generatedPrescription && (
                <div className="bg-emerald-50 border-2 border-emerald-400 p-8 rounded-2xl shadow-xl animate-fade-in text-center">
                    <h2 className="text-2xl font-black text-emerald-800 uppercase tracking-tight">Prescription Dispatched!</h2>
                    <p className="text-emerald-700 mt-2 font-medium">Unique Verification Code Generated</p>
                    <div className="my-6 p-6 bg-white rounded-2xl border-2 border-emerald-100 inline-block shadow-inner">
                        <p className="text-4xl font-mono font-black text-emerald-900 tracking-widest">{generatedPrescription.prescriptionCode}</p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button onClick={copyToClipboard} className="px-8 py-3 bg-emerald-600 text-white font-black uppercase rounded-xl hover:bg-emerald-700 shadow-lg transition-transform active:scale-95">Copy Code</button>
                        <button onClick={downloadPdf} className="px-8 py-3 bg-sky-600 text-white font-black uppercase rounded-xl hover:bg-sky-700 shadow-lg transition-transform active:scale-95">Download PDF</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePrescription;
