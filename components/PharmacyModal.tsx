
import React, { useState, useEffect } from 'react';
import { Pharmacy, SubscriptionPlan } from '../types';

interface PharmacyModalProps {
    pharmacy: Pharmacy | null;
    onClose: () => void;
    onSave: (pharmacy: Omit<Pharmacy, 'id'> | Pharmacy) => void;
}

const PharmacyModal: React.FC<PharmacyModalProps> = ({ pharmacy, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        staff: 0,
        plan: SubscriptionPlan.BASIC,
        planStartDate: new Date().toISOString().split('T')[0],
        planExpiryDate: '',
        createdAt: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (pharmacy) {
            setFormData({
                name: pharmacy.name,
                email: pharmacy.email,
                phone: pharmacy.phone,
                address: pharmacy.address,
                staff: pharmacy.staff,
                plan: pharmacy.plan,
                planStartDate: pharmacy.planStartDate,
                planExpiryDate: pharmacy.planExpiryDate,
                createdAt: pharmacy.createdAt,
            });
        } else {
            // Reset form for adding new pharmacy
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                staff: 0,
                plan: SubscriptionPlan.BASIC,
                planStartDate: new Date().toISOString().split('T')[0],
                planExpiryDate: '',
                createdAt: new Date().toISOString().split('T')[0],
            });
        }
    }, [pharmacy]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'staff' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSave = {
            ...formData,
            // Allow Mock API to handle inventory limit logic, but ensure required fields are present
            inventory_limit: 0, 
            createdBy: '1',
            lastLogin: pharmacy ? pharmacy.lastLogin : 'Never',
        };

        if (pharmacy) {
            onSave({ ...pharmacy, ...dataToSave });
        } else {
            onSave(dataToSave);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">{pharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        <input name="staff" type="number" value={formData.staff} onChange={handleChange} placeholder="Staff Count" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                    </div>
                    <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                    
                    <div className="border-t border-slate-300 my-4 pt-4">
                        <h3 className="font-semibold text-slate-700 mb-2">Plan & Dates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs text-slate-500 mb-1">Subscription Plan</label>
                                <select name="plan" value={formData.plan} onChange={handleChange} className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                                    {Object.values(SubscriptionPlan).map(plan => <option key={plan} value={plan}>{plan}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Date Added</label>
                                <input name="createdAt" type="date" value={formData.createdAt} onChange={handleChange} required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Plan Start Date</label>
                                <input name="planStartDate" type="date" value={formData.planStartDate} onChange={handleChange} required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Plan Expiry Date</label>
                                <input name="planExpiryDate" type="date" value={formData.planExpiryDate} onChange={handleChange} required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                        </div>
                    </div>
                   
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors font-semibold">{pharmacy ? 'Save Changes' : 'Add Pharmacy'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PharmacyModal;
