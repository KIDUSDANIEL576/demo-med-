import React from 'react';

interface ReportAnalysisModalProps {
    onClose: () => void;
}

const ReportAnalysisModal: React.FC<ReportAnalysisModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Sales Report Analysis</h2>
                <div className="space-y-4 text-slate-600">
                    <p><strong>Performance Trend:</strong> Sales are up 15% this month, driven primarily by strong performance in the Painkiller category.</p>
                    <p><strong>Top Seller:</strong> 'Paracetamol 500mg' remains your top-selling product, accounting for 25% of total revenue.</p>
                    <p><strong>Dead Stock Alert:</strong> 'Aspirin 100mg' has low turnover. Consider a promotional discount to move stock before it expires.</p>
                    <p><strong>Recommendation:</strong> Based on current trends, we recommend increasing your stock of 'Ibuprofen 200mg' by 20% to meet anticipated demand.</p>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-primary text-white rounded">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ReportAnalysisModal;
