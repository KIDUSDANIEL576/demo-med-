
import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import { getAuditLogs, exportData } from '../../services/mockApi';
import { AuditLog } from '../../types';
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from '../../constants';

// Icons
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>;

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    useEffect(() => {
        getAuditLogs().then((data) => {
            setLogs(data);
            setLoading(false);
        });
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = 
                log.changedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.pharmacyName && log.pharmacyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                log.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.operation.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

            return matchesSearch && matchesSeverity;
        });
    }, [logs, searchTerm, severityFilter]);

    const handleExport = () => {
        const dataToExport = filteredLogs.map(log => ({
            'Timestamp': new Date(log.timestamp).toLocaleString(),
            'Severity': log.severity.toUpperCase(),
            'User': log.changedBy,
            'Pharmacy': log.pharmacyName || 'N/A',
            'Action': log.operation,
            'Table': log.tableName,
            'Old Data': JSON.stringify(log.oldData),
            'New Data': JSON.stringify(log.newData),
        }));
        exportData(dataToExport, `Audit_Log_Export_${new Date().toISOString().split('T')[0]}`);
    };

    const columns = [
        { key: 'timestamp', header: 'Timestamp' },
        { key: 'severity', header: 'Severity' },
        { key: 'pharmacyName', header: 'Pharmacy' },
        { key: 'changedBy', header: 'User' },
        { key: 'action', header: 'Action' },
        { key: 'details', header: 'Details' },
    ];

    if (loading) return <div className="p-8">Loading Security Audit...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-800 text-white rounded-full">
                        <ShieldCheckIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Revenue Leakage Audit</h1>
                        <p className="text-slate-500">Track sensitive changes like deleted sales or manual stock adjustments.</p>
                    </div>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium shadow-sm"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" /> Export Log
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-base-300 p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by User, Pharmacy, Action..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full p-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Filter Severity:</span>
                    <select 
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value as any)}
                        className="p-2 rounded-md border border-slate-300 bg-white focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="all">All Levels</option>
                        <option value="high">High Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="low">Low Risk</option>
                    </select>
                </div>
            </div>

            <DataTable<AuditLog>
                columns={columns}
                data={filteredLogs}
                renderRow={(log) => (
                    <tr key={log.id} className={log.severity === 'high' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-base-100'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase border ${
                                log.severity === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                                log.severity === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>
                                {log.severity}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {log.pharmacyName || <span className="text-slate-400 italic">System</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {log.changedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`font-mono text-xs px-2 py-1 rounded ${log.operation === 'DELETE' ? 'bg-red-200 text-red-900' : 'bg-slate-200'}`}>
                                {log.operation}
                            </span>
                            <span className="ml-2 text-slate-500">{log.tableName}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                            <details className="cursor-pointer group">
                                <summary className="text-primary hover:underline font-medium list-none flex items-center gap-1">
                                    <span className="group-open:hidden">Show Payload</span>
                                    <span className="hidden group-open:inline">Hide Payload</span>
                                </summary>
                                <div className="mt-2 p-2 bg-white border border-slate-200 rounded text-xs font-mono whitespace-pre-wrap max-w-md shadow-sm">
                                    {log.oldData && (
                                        <div className="mb-1">
                                            <span className="text-red-600 font-bold block border-b border-red-100 mb-1">PREVIOUS STATE:</span>
                                            {JSON.stringify(log.oldData, null, 2)}
                                        </div>
                                    )}
                                    {log.newData && (
                                        <div>
                                            <span className="text-green-600 font-bold block border-b border-green-100 mb-1 mt-2">NEW STATE:</span>
                                            {JSON.stringify(log.newData, null, 2)}
                                        </div>
                                    )}
                                </div>
                            </details>
                        </td>
                    </tr>
                )}
            />
        </div>
    );
};

export default AuditLogs;
