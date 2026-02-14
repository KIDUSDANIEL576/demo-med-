
import React, { useState } from 'react';
import { Pharmacy } from '../types';
import { createPharmacyAdmin } from '../services/mockApi';

interface CreateAdminModalProps {
    pharmacy: Pharmacy;
    onClose: () => void;
    onSave: () => void;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ pharmacy, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) {
            setError('All fields are required.');
            return;
        }
        setLoading(true);

        try {
            await createPharmacyAdmin({
                name,
                email,
                pharmacyId: pharmacy.id,
                plan: pharmacy.plan,
                password, // Pass the password correctly
            });
            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to create admin user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Create Admin for {pharmacy.name}</h2>
                <p className="text-sm text-slate-500 mb-6">Create the primary admin user account for this pharmacy. They can use these credentials to log in and manage their pharmacy.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Admin Full Name" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                    <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Login Email" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                    <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                    
                    {error && <p className="text-sm text-center text-red-200 bg-red-800/50 p-2 rounded-md">{error}</p>}
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded disabled:bg-primary/70">
                            {loading ? 'Creating...' : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAdminModal;