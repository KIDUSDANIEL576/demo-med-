
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateDoctorProfile, changePassword } from '../../services/mockApi';
import { User, SubscriptionPlan } from '../../types';

const DoctorProfile: React.FC = () => {
    const { user, setUser } = useAuth(); // Using setUser to refresh context user
    const [formData, setFormData] = useState<Partial<User>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [sigPreview, setSigPreview] = useState<string | null>(null);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (user) {
            const storedLogo = localStorage.getItem(`logo_${user.id}`);
            const storedSig = localStorage.getItem(`sig_${user.id}`);
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone,
                clinicName: user.clinicName,
                clinicAddress: user.clinicAddress,
                plan: user.plan,
            });
            if(storedLogo) setLogoPreview(storedLogo);
            if(storedSig) setSigPreview(storedSig);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            const updatedUser = await updateDoctorProfile({ ...user, ...formData });
            // Update the user object in the global context
            setUser(updatedUser); 
            setMessage({ text: "Profile updated successfully!", type: 'success' });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (newPassword !== confirmPassword) {
            setMessage({ text: "New passwords do not match!", type: 'error' });
            return;
        }

        try {
            await changePassword(user.id, currentPassword, newPassword);
            setMessage({ text: "Password changed successfully!", type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Doctor Profile & Settings</h1>
                 {message && (
                    <div className={`px-4 py-2 rounded-md animate-fade-in ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="bg-base-300 shadow-lg rounded-lg p-8 space-y-6">
                 <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Clinic Information</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Clinic Name</label>
                        <input name="clinicName" value={formData.clinicName || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Clinic Phone</label>
                        <input name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Clinic Address</label>
                        <input name="clinicAddress" value={formData.clinicAddress || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"/>
                    </div>
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

                 <div className="pt-6">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Plan Management</h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Subscription Plan</label>
                        <select 
                            name="plan" 
                            value={formData.plan || ''} 
                            onChange={handleChange} 
                            className="mt-1 block w-full md:w-1/2 p-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                            {Object.values(SubscriptionPlan).map(plan => <option key={plan} value={plan}>{plan}</option>)}
                        </select>
                    </div>
                 </div>

                 <div className="pt-4">
                     <button type="submit" className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                        Save Profile
                    </button>
                 </div>
            </form>
             <div className="bg-base-300 shadow-lg rounded-lg p-8">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                    <div>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" required className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"/>
                    </div>
                    <div>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"/>
                    </div>
                     <div>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"/>
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DoctorProfile;
