import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface DoctorModalProps {
    doctor: User | null;
    onClose: () => void;
    onSave: (doctor: Partial<User>) => void;
}

const DoctorModal: React.FC<DoctorModalProps> = ({ doctor, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        email: '',
        phone: '',
        clinicName: '',
        clinicAddress: '',
        clinicLogoUrl: '',
        eSignatureUrl: '',
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [sigPreview, setSigPreview] = useState<string | null>(null);

    useEffect(() => {
        if (doctor) {
            const storedLogo = localStorage.getItem(`logo_${doctor.id}`);
            const storedSig = localStorage.getItem(`sig_${doctor.id}`);
            setFormData(doctor);
            if (storedLogo) setLogoPreview(storedLogo);
            if (storedSig) setSigPreview(storedSig);
        }
    }, [doctor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData({ ...formData, [e.target.name]: base64String });
                if (e.target.name === 'clinicLogoUrl') setLogoPreview(base64String);
                if (e.target.name === 'eSignatureUrl') setSigPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">{doctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Full Name" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        <input name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="Email" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        <input name="clinicName" value={formData.clinicName || ''} onChange={handleChange} placeholder="Clinic Name" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                    </div>
                    <input name="clinicAddress" value={formData.clinicAddress || ''} onChange={handleChange} placeholder="Clinic Address" required className="p-2 w-full bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Clinic Logo</label>
                            <input type="file" name="clinicLogoUrl" onChange={handleFileChange} accept="image/*" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                            {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 h-16 w-auto bg-white p-1 border rounded"/>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">E-Signature</label>
                            <input type="file" name="eSignatureUrl" onChange={handleFileChange} accept="image/*" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                            {sigPreview && <img src={sigPreview} alt="Signature Preview" className="mt-2 h-16 w-auto bg-white p-1 border rounded"/>}
                        </div>
                    </div>
                   
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">{doctor ? 'Save Changes' : 'Add Doctor'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorModal;