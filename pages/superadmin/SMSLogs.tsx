
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { getSMSLogs } from '../../services/mockApi';
import { SMSLog } from '../../types';
import { ChatBubbleBottomCenterTextIcon } from '../../constants';

const SMSLogs: React.FC = () => {
    const [logs, setLogs] = useState<SMSLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSMSLogs().then(data => {
            setLogs(data);
            setLoading(false);
        });
    }, []);

    const columns = [
        { key: 'timestamp', header: 'Timestamp' },
        { key: 'phone', header: 'Recipient' },
        { key: 'message', header: 'Message Content' },
        { key: 'status', header: 'Status' },
    ];

    if (loading) return <div className="p-8">Loading SMS Logs...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-800 text-white rounded-full">
                    <ChatBubbleBottomCenterTextIcon className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">SMS Delivery Logs</h1>
                    <p className="text-slate-500">Audit trail for all patient notifications sent via the delivery stub.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <DataTable<SMSLog>
                    columns={columns}
                    data={logs}
                    renderRow={(log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                                {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                                {log.phone}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-lg">
                                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 font-mono text-xs whitespace-pre-wrap">
                                    {log.message}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                                    log.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {log.status}
                                </span>
                            </td>
                        </tr>
                    )}
                />
            </div>
        </div>
    );
};

export default SMSLogs;
