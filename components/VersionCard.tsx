
import React, { useState } from 'react';
import { SystemVersion } from '../types';

interface VersionCardProps {
    version: SystemVersion;
    onManage: (version: SystemVersion) => void;
    onActivate: (version: SystemVersion) => void;
    onDeactivate: (version: SystemVersion) => void;
    onDelete: (version: SystemVersion) => void;
}

const statusStyles = {
    active: 'bg-green-100 text-green-800',
    scheduled: 'bg-sky-100 text-sky-800',
    archived: 'bg-slate-100 text-slate-800',
    draft: 'bg-amber-100 text-amber-800',
};

// Simple Meatball Menu Icon
const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);

const VersionCard: React.FC<VersionCardProps> = ({ version, onManage, onActivate, onDeactivate, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="bg-base-300 rounded-lg shadow-lg p-6 flex flex-col justify-between animate-slide-in-up relative">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-primary">{version.version_name}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[version.status]}`}>{version.status}</span>
                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <EllipsisVerticalIcon className="w-6 h-6 text-slate-500" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-md shadow-xl z-20 overflow-hidden flex flex-col animate-fade-in">
                                    <button 
                                        onClick={() => { setIsMenuOpen(false); onManage(version); }}
                                        className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-100"
                                    >
                                        Edit / Draft
                                    </button>
                                    
                                    {version.status !== 'active' && (
                                        <button 
                                            onClick={() => { setIsMenuOpen(false); onActivate(version); }}
                                            className="text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium"
                                        >
                                            Activate
                                        </button>
                                    )}
                                    
                                    {version.status === 'active' && (
                                        <button 
                                            onClick={() => { setIsMenuOpen(false); onDeactivate(version); }}
                                            className="text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
                                        >
                                            Deactivate
                                        </button>
                                    )}
                                    
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button 
                                        onClick={() => { setIsMenuOpen(false); onDelete(version); }}
                                        className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-4 font-mono">
                    {version.status === 'scheduled' ? `Scheduled for: ${version.launch_date}` : `Released: ${version.launch_date}`}
                </p>
                
                <p className="text-sm text-slate-600 mb-4 border-l-4 border-primary/20 pl-3">{version.announcement}</p>

                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Features Included:</h4>
                    <ul className="space-y-1">
                        {(version.features_included || []).map((feature, index) => (
                            <li key={index} className="text-sm text-slate-500 list-disc list-inside">{feature}</li>
                        ))}
                    </ul>
                </div>
                
                {version.interest_poll_enabled && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-1 rounded">Active Poll</span>
                        <p className="text-xs text-slate-500 mt-1 truncate">{version.poll_question || "Poll enabled"}</p>
                    </div>
                )}
            </div>
            
            {isMenuOpen && <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>}
        </div>
    );
};

export default VersionCard;
