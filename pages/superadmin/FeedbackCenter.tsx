
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { getUserSuggestions, getUsers, updateUserSuggestion } from '../../services/mockApi';
import { UserSuggestion, User } from '../../types';

const priorityStyles = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
};

const statusStyles = {
    new: 'bg-gray-200 text-gray-800',
    reviewed: 'bg-blue-200 text-blue-800',
    planned: 'bg-purple-200 text-purple-800',
    resolved: 'bg-green-200 text-green-800',
};

const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);

const FeedbackCenter: React.FC = () => {
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
    const [users, setUsers] = useState<Map<string, User>>(new Map());
    const [loading, setLoading] = useState(true);
    
    // Reply Modal
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<UserSuggestion | null>(null);
    const [replyMessage, setReplyMessage] = useState('');

    const fetchFeedback = async () => {
        setLoading(true);
        const [suggestionsData, usersData] = await Promise.all([
            getUserSuggestions(),
            getUsers(),
        ]);
        setSuggestions(suggestionsData);
        setUsers(new Map(usersData.map(u => [u.id, u])));
        setLoading(false);
    };

    useEffect(() => {
        fetchFeedback();
    }, []);
    
    const handleStatusChange = async (suggestion: UserSuggestion, newStatus: UserSuggestion['status']) => {
        const updatedSuggestion = { ...suggestion, status: newStatus };
        await updateUserSuggestion(updatedSuggestion);
        setSuggestions(prev => prev.map(s => s.id === suggestion.id ? updatedSuggestion : s));
    };

    const handleOpenReply = (suggestion: UserSuggestion) => {
        setSelectedSuggestion(suggestion);
        setReplyMessage(suggestion.admin_reply || '');
        setReplyModalOpen(true);
    };

    const handleSendReply = async () => {
        if (!selectedSuggestion) return;
        
        const updatedSuggestion = { ...selectedSuggestion, admin_reply: replyMessage, status: 'reviewed' as const };
        await updateUserSuggestion(updatedSuggestion);
        setSuggestions(prev => prev.map(s => s.id === selectedSuggestion.id ? updatedSuggestion : s));
        
        setReplyModalOpen(false);
        setReplyMessage('');
    };

    const columns = [
        { key: 'user', header: 'User' },
        { key: 'message', header: 'Suggestion' },
        { key: 'priority', header: 'Priority' },
        { key: 'status', header: 'Status' },
        { key: 'actions', header: 'Actions' },
    ];
    
    if (loading) {
        return <div className="text-center p-8">Loading feedback...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Feedback Center</h1>

            <DataTable<UserSuggestion>
                columns={columns}
                data={suggestions}
                renderRow={(suggestion) => {
                    const user = users.get(suggestion.user_id);
                    return (
                        <tr key={suggestion.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{user?.name || 'Unknown User'}</div>
                                <div className="text-xs text-slate-500">{suggestion.user_role}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                                <p>{suggestion.message}</p>
                                {suggestion.admin_reply && (
                                    <div className="mt-2 p-2 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 flex items-start gap-1">
                                        <span className="font-bold">Reply:</span> {suggestion.admin_reply}
                                    </div>
                                )}
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${priorityStyles[suggestion.priority]}`}>
                                    {suggestion.priority}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <select 
                                    value={suggestion.status} 
                                    onChange={(e) => handleStatusChange(suggestion, e.target.value as UserSuggestion['status'])}
                                    className={`px-2 py-1 text-xs font-semibold rounded-full border-none capitalize cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-primary ${statusStyles[suggestion.status]}`}
                                >
                                    <option value="new">New</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="planned">Planned</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button 
                                    onClick={() => handleOpenReply(suggestion)}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                    title="Reply to User"
                                >
                                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    )
                }}
            />

            {/* Reply Modal */}
            {replyModalOpen && selectedSuggestion && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-2 text-slate-800">Reply to Feedback</h3>
                        <p className="text-sm text-slate-500 mb-4 italic">"{selectedSuggestion.message}"</p>
                        
                        <textarea
                            className="w-full border border-slate-300 rounded p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            rows={4}
                            placeholder="Type your response to the user..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        
                        <div className="flex justify-end gap-2 mt-4">
                            <button 
                                onClick={() => setReplyModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-slate-700 rounded hover:bg-gray-300 font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendReply}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 font-bold"
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackCenter;
