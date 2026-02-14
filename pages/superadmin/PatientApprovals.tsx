
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import { getPatientApprovalQueue, updatePatientStatus } from '../../services/mockApi';
import { Patient, PatientStatus } from '../../types';
import { CheckIcon, XIcon, UsersIcon } from '../../constants';

const PatientApprovals: React.FC = () => {
    const [queue, setQueue] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<PatientStatus | null>(null);
    const [targetId, setTargetId] = useState<string | null>(null);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        setLoading(true);
        const data = await getPatientApprovalQueue();
        setQueue(data);
        setLoading(false);
    };

    const initiateAction = (id: string, status: PatientStatus) => {
        setTargetId(id);
        setPendingAction(status);
        setIsConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!targetId || !pendingAction) return;
        
        setActionLoading(true);
        try {
            await updatePatientStatus(targetId, pendingAction);
            await fetchQueue();
            setIsConfirmOpen(false);
        } catch (error) {
            console.error("Action failed:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setActionLoading(false);
            setTargetId(null);
            setPendingAction(null);
        }
    };

    const columns = [
        { key: 'name', header: 'Full Name' },
        { key: 'contact', header: 'Contact Details' },
        { key: 'createdAt', header: 'Signup Date' },
        { key: 'status', header: 'Status' },
        { key: 'plan', header: 'Plan' },
        { key: 'actions', header: 'Actions' },
    ];

    if (loading) return <div className="p-8 font-mono animate-pulse">Syncing Approval Queue...</div>;

    const modalConfig = {
        title: pendingAction === PatientStatus.ACTIVE ? "Approve Request?" : pendingAction === PatientStatus.REJECTED ? "Reject Request?" : "Reset Request?",
        message: pendingAction === PatientStatus.ACTIVE 
            ? "Are you sure you want to approve this patient's medicine request?" 
            : pendingAction === PatientStatus.REJECTED 
                ? "Are you sure you want to reject this patient's medicine request?" 
                : "Are you sure you want to reset this request to review?",
        confirmText: pendingAction === PatientStatus.ACTIVE ? "Confirm Approve" : pendingAction === PatientStatus.REJECTED ? "Confirm Reject" : "Confirm Reset",
        isDangerous: pendingAction !== PatientStatus.ACTIVE
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Patient Approval Queue</h1>
                    <p className="text-slate-500 font-medium">Verify and activate patient identities to enable platform access.</p>
                </div>
                <div className="bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-indigo-600" />
                    <span className="font-black text-slate-800">{queue.filter(p => p.status === PatientStatus.PENDING_APPROVAL).length} Pending</span>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <DataTable<Patient>
                    columns={columns}
                    data={queue}
                    renderRow={(patient) => (
                        <tr key={patient.id} className={patient.status === PatientStatus.PENDING_APPROVAL ? 'bg-indigo-50/20' : 'hover:bg-slate-50 transition-colors'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-black text-slate-800">{patient.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">ID: {patient.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-slate-700">{patient.email}</div>
                                <div className="text-xs text-slate-500">{patient.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                                {new Date(patient.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    patient.status === PatientStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' :
                                    patient.status === PatientStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700 animate-pulse'
                                }`}>
                                    {patient.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg border border-slate-200">
                                    {patient.plan.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                {patient.status === PatientStatus.PENDING_APPROVAL && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => initiateAction(patient.id, PatientStatus.ACTIVE)}
                                            disabled={isConfirmOpen}
                                            className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Approve Patient"
                                        >
                                            <CheckIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => initiateAction(patient.id, PatientStatus.REJECTED)}
                                            disabled={isConfirmOpen}
                                            className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Reject Patient"
                                        >
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                {(patient.status === PatientStatus.ACTIVE || patient.status === PatientStatus.REJECTED) && (
                                    <button 
                                        onClick={() => initiateAction(patient.id, PatientStatus.PENDING_APPROVAL)}
                                        disabled={isConfirmOpen}
                                        className="text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-tighter transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reset to Review
                                    </button>
                                )}
                            </td>
                        </tr>
                    )}
                />
            </div>

            <ConfirmationModal 
                isOpen={isConfirmOpen}
                onClose={() => !actionLoading && setIsConfirmOpen(false)}
                onConfirm={handleConfirmAction}
                isLoading={actionLoading}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                isDangerous={modalConfig.isDangerous}
            />
        </div>
    );
};

export default PatientApprovals;
