import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import { UserSuggestion } from '../types';
import { addUserSuggestion } from '../services/mockApi';

interface FeedbackModalProps {
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const { user } = useAuth();
    const { addNotice } = useNotification();
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message || !user) return;
        setLoading(true);

        const suggestion: Omit<UserSuggestion, 'id' | 'status' | 'attachment_url'> = {
            user_id: user.id,
            tenant_id: user.pharmacyId ? String(user.pharmacyId) : user.id,
            user_role: user.role,
            version_tag: 'current', // placeholder
            message,
            priority,
        };
        await addUserSuggestion(suggestion);
        await addNotice('New Feedback Received', `User ${user.name} submitted new feedback.`);
        
        setLoading(false);
        setSubmitted(true);
        setTimeout(onClose, 2000);
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Suggest a Feature</h2>
                {submitted ? (
                    <div className="text-center py-10">
                        <p className="text-xl font-semibold text-green-600">Thank you for your feedback!</p>
                        <p className="text-slate-500">Your suggestion has been sent to the admin team.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-500 mb-6">Have an idea for a new feature or an improvement? Let us know!</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700">Suggestion / Feedback</label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your idea..."
                                    required
                                    rows={5}
                                    className="mt-1 p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                />
                            </div>
                             <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priority</label>
                                <select 
                                    id="priority"
                                    value={priority} 
                                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                                    className="mt-1 p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded disabled:bg-primary/70">
                                    {loading ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;