import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface UpdateNoticeModalProps {
    onClose: () => void;
}

const UpdateNoticeModal: React.FC<UpdateNoticeModalProps> = ({ onClose }) => {
    const { addNotice } = useNotification();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;
        
        setLoading(true);
        await addNotice(title, message);
        setLoading(false);
        setSent(true);

        setTimeout(() => {
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Send Update Notice</h2>
                {sent ? (
                    <div className="text-center py-10">
                        <p className="text-xl font-semibold text-green-600">Notice Sent Successfully!</p>
                        <p className="text-slate-500">All users will be notified shortly.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-500 mb-6">This message will be broadcast to all Pharmacy and Doctor accounts.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Notice Title (e.g., Scheduled Maintenance)"
                                required
                                className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message here..."
                                required
                                rows={5}
                                className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded disabled:bg-primary/70">
                                    {loading ? 'Sending...' : 'Send Notice'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default UpdateNoticeModal;