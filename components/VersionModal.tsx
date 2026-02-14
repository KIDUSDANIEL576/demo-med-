
import React, { useState, useEffect } from 'react';
import { SystemVersion } from '../types';
import { TrashIcon } from '../constants';

interface VersionModalProps {
    version: SystemVersion | null;
    onClose: () => void;
    onSave: (version: Omit<SystemVersion, 'id'> | SystemVersion) => void;
}

const VersionModal: React.FC<VersionModalProps> = ({ version, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        version_name: '',
        launch_date: '',
        features_included: '', // Storing as a comma-separated string for simplicity
        status: 'draft' as SystemVersion['status'],
        announcement: '',
        interest_poll_enabled: false,
        poll_question: '',
        poll_options: [] as { label: string; votes: number }[]
    });
    
    // Local state for adding new poll options
    const [newOption, setNewOption] = useState('');

    useEffect(() => {
        if (version) {
            setFormData({
                version_name: version.version_name,
                launch_date: version.launch_date,
                features_included: version.features_included.join(', '),
                status: version.status,
                announcement: version.announcement,
                interest_poll_enabled: version.interest_poll_enabled,
                poll_question: version.poll_question || '',
                poll_options: version.poll_options || []
            });
        }
    }, [version]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddOption = () => {
        if (!newOption.trim()) return;
        setFormData(prev => ({
            ...prev,
            poll_options: [...prev.poll_options, { label: newOption, votes: 0 }]
        }));
        setNewOption('');
    };

    const handleRemoveOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            poll_options: prev.poll_options.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            features_included: formData.features_included.split(',').map(f => f.trim()).filter(f => f !== ''),
        };

        if (version) {
            onSave({ ...version, ...dataToSave });
        } else {
            onSave(dataToSave);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{version ? 'Edit System Version' : 'Create New Version'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-xl font-bold">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Version Name</label>
                            <input name="version_name" value={formData.version_name} onChange={handleChange} placeholder="e.g., 4.0 Pegasus" required className="p-2 w-full bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Release / Schedule Date</label>
                            <input name="launch_date" type="date" value={formData.launch_date} onChange={handleChange} required className="p-2 w-full bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Announcement / Description</label>
                        <textarea name="announcement" value={formData.announcement} onChange={handleChange} placeholder="Describe the update..." required rows={3} className="p-2 w-full bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Features (comma-separated)</label>
                        <textarea name="features_included" value={formData.features_included} onChange={handleChange} placeholder="Feature A, Feature B, Bug Fixes..." required rows={2} className="p-2 w-full bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Version Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="p-2 w-full bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-primary outline-none">
                               <option value="draft">Draft (Saved, Not Public)</option>
                               <option value="scheduled">Scheduled (Auto-Publish)</option>
                               <option value="active">Active (Live Now)</option>
                               <option value="archived">Archived</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 mt-6 cursor-pointer">
                            <input type="checkbox" name="interest_poll_enabled" checked={formData.interest_poll_enabled} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="font-medium text-slate-800">Enable Interest Poll</span>
                        </label>
                    </div>

                    {/* Interest Poll Section */}
                    {formData.interest_poll_enabled && (
                        <div className="bg-violet-50 p-4 rounded-lg border border-violet-200 animate-fade-in">
                            <h3 className="text-md font-bold text-violet-800 mb-3">Poll Configuration</h3>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-violet-700 uppercase mb-1">Poll Question</label>
                                <input 
                                    name="poll_question" 
                                    value={formData.poll_question} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Which feature should we build next?" 
                                    className="p-2 w-full bg-white border border-violet-300 rounded-md focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                            </div>

                            <label className="block text-xs font-bold text-violet-700 uppercase mb-1">Poll Options</label>
                            <div className="space-y-2 mb-3">
                                {formData.poll_options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="flex-grow p-2 bg-white border border-violet-200 rounded text-sm text-slate-700">
                                            {opt.label}
                                        </div>
                                        <button type="button" onClick={() => handleRemoveOption(idx)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newOption} 
                                    onChange={(e) => setNewOption(e.target.value)} 
                                    placeholder="Type option and click Add..." 
                                    className="flex-grow p-2 bg-white border border-violet-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddOption}
                                    className="px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-md hover:bg-violet-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-slate-700 font-bold rounded hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded hover:bg-primary/90 shadow-md">
                            {formData.status === 'draft' ? 'Save Draft' : 'Publish Version'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VersionModal;
