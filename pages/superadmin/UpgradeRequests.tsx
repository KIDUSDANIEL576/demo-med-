
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { getUpgradeRequests, approveUpgrade, rejectUpgrade, getPharmacies } from '../../services/mockApi';
import { UpgradeRequest, Pharmacy } from '../../types';

const UpgradeRequests: React.FC = () => {
    const [requests, setRequests] = useState<UpgradeRequest[]>([]);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const [reqs, pharms] = await Promise.all([getUpgradeRequests(), getPharmacies()]);
        setRequests(reqs);
        setPharmacies(pharms);
        setLoading(false);
    };
    
    const getPharmacyName = (req: UpgradeRequest) => {
        if (req.pharmacyName) return req.pharmacyName;
        const p = pharmacies.find(p => p.id === req.pharmacyId);
        return p ? p.name : `Unknown (ID: ${req.pharmacyId})`;
    }

    const handleApproveClick = (req: UpgradeRequest) => {
        setSelectedRequest(req);
        setAdminNote('');
        setApproveModalOpen(true);
    }

    const handleRejectClick = (req: UpgradeRequest) => {
        setSelectedRequest(req);
        setAdminNote('');
        setRejectModalOpen(true);
    };

    const submitApprove = async () => {
        if (selectedRequest) {
            await approveUpgrade(selectedRequest.id, adminNote);
            setApproveModalOpen(false);
            fetchRequests();
        }
    }

    const submitReject = async () => {
        if (selectedRequest) {
            await rejectUpgrade(selectedRequest.id, adminNote);
            setRejectModalOpen(false);
            fetchRequests();
        }
    }

    const columns = [
        { key: 'pharmacyName', header: 'Pharmacy' },
        { key: 'requestedPlan', header: 'Requested Plan' },
        { key: 'billingCycle', header: 'Cycle' },
        { key: 'requestDate', header: 'Date' },
        { key: 'status', header: 'Status' },
        { key: 'payment', header: 'Payment' },
        { key: 'actions', header: 'Actions' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Upgrade Requests</h1>
            <DataTable<UpgradeRequest>
                columns={columns}
                data={requests}
                renderRow={(req) => (
                    <tr key={req.id} className={req.status === 'pending' ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{getPharmacyName(req)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-primary font-bold">{req.requestedPlan}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 capitalize">{req.billingCycle || 'monthly'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {req.status}
                            </span>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                            {req.paymentTransactionId ? <span className="text-green-600 font-bold">Paid</span> : 'Pending/Manual'}
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {req.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleApproveClick(req)} 
                                        className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 text-sm font-bold transition-transform transform hover:scale-105"
                                        title="Approve Request"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleRejectClick(req)} 
                                        className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 text-sm font-bold transition-transform transform hover:scale-105"
                                        title="Reject Request"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                )}
            />

            {approveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border-t-4 border-green-500">
                        <h3 className="text-xl font-bold mb-4 text-green-700">Approve Upgrade</h3>
                        <p className="mb-4 text-slate-600">
                            Confirm upgrade to <strong>{selectedRequest?.requestedPlan}</strong> ({selectedRequest?.billingCycle}) for <strong>{selectedRequest ? getPharmacyName(selectedRequest) : ''}</strong>?
                        </p>
                        <p className="text-xs text-slate-500 mb-2">This will update the pharmacy's plan and extend their expiry date based on the billing cycle.</p>
                        <textarea 
                            className="w-full border p-2 rounded mb-4" 
                            placeholder="Optional note to user..." 
                            value={adminNote} 
                            onChange={e => setAdminNote(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setApproveModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded font-medium">Cancel</button>
                            <button onClick={submitApprove} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">Confirm Approve</button>
                        </div>
                    </div>
                </div>
            )}

            {rejectModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border-t-4 border-red-500">
                        <h3 className="text-xl font-bold mb-4 text-red-700">Reject Upgrade</h3>
                        <p className="mb-4 text-slate-600">Reason for rejection:</p>
                        <textarea 
                            className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-red-500 outline-none" 
                            placeholder="Enter reason for rejection (required)..." 
                            value={adminNote} 
                            onChange={e => setAdminNote(e.target.value)}
                            required
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded font-medium">Cancel</button>
                            <button onClick={submitReject} disabled={!adminNote} className="px-4 py-2 bg-red-600 text-white rounded font-bold disabled:bg-red-300 hover:bg-red-700">Reject Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpgradeRequests;
