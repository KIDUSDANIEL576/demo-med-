
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SubscriptionPlan } from '../../types';
import { changePassword } from '../../services/mockApi';

const PharmacySettings: React.FC = () => {
    const { user } = useAuth();
    const { primaryColor, setPrimaryColor, logoUrl, setLogoUrl } = useTheme();

    const [color, setColor] = useState(primaryColor || '#007E85');
    const [logo, setLogo] = useState<string | null>(null); // For new base64 upload
    const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'success' | 'error'>('success');
    const [shareInventory, setShareInventory] = useState(false);
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const isPlatinum = user?.plan === SubscriptionPlan.PLATINUM;

    useEffect(() => {
        // Sync local state if context changes from another source (e.g., initial load in App.tsx)
        setColor(primaryColor || '#007E85');
        setLogoPreview(logoUrl);
    }, [primaryColor, logoUrl]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("File is too large. Please select an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogo(base64String);
                setLogoPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const showStatusMessage = (message: string, type: 'success' | 'error' = 'success') => {
        setStatusMessage(message);
        setStatusType(type);
        setTimeout(() => setStatusMessage(''), 3000);
    }

    const handleCustomizationSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.pharmacyId) return;
        
        // Update theme context immediately
        setPrimaryColor(color);
        if (logo) {
            setLogoUrl(logo);
        }
        
        // Persist to localStorage
        localStorage.setItem(`pharmacy_color_${user.pharmacyId}`, color);
        if (logo) {
            localStorage.setItem(`pharmacy_logo_${user.pharmacyId}`, logo);
        }
        showStatusMessage("Customization saved successfully!");
    };


    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (newPassword !== confirmPassword) {
            showStatusMessage("New passwords do not match!", 'error');
            return;
        }

        try {
            await changePassword(user.id, currentPassword, newPassword);
            showStatusMessage("Password changed successfully! Please use new password on next login.", 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showStatusMessage(error.message, 'error');
        }
    }
    
    const handleOptInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShareInventory(e.target.checked);
        showStatusMessage(e.target.checked ? "Opted-in to Global Network" : "Opted-out of Global Network");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-slate-800">Pharmacy Settings</h1>
                 {statusMessage && (
                    <div className={`px-4 py-2 rounded-md animate-fade-in ${statusType === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {statusMessage}
                    </div>
                )}
            </div>
            
            <form onSubmit={handleCustomizationSave} className="bg-base-300 shadow-lg rounded-lg p-8">
                <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-4">UI Customization</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Pharmacy Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-base-200 rounded-md flex items-center justify-center border-2 border-dashed">
                                {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="max-h-full max-w-full object-contain p-1" /> : <span className="text-xs text-slate-500">Preview</span>}
                            </div>
                            <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/svg+xml" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                        </div>
                         <p className="text-xs text-slate-500 mt-2">Recommended: SVG or PNG format, max 2MB.</p>
                    </div>
                     <div>
                        <label htmlFor="themeColor" className="block text-sm font-medium text-slate-700 mb-2">Theme Color</label>
                        <div className="flex items-center gap-4">
                             <input type="color" id="themeColor" value={color} onChange={(e) => setColor(e.target.value)} className="p-1 h-12 w-12 block bg-white border border-gray-300 cursor-pointer rounded-lg"/>
                             <div className="flex-grow p-3 rounded-md text-center text-white font-bold" style={{ backgroundColor: color }}>
                                 {color.toUpperCase()}
                             </div>
                        </div>
                         <p className="text-xs text-slate-500 mt-2">This color will be used for primary buttons and highlights.</p>
                    </div>
                </div>
                 <div className="mt-8 pt-6 border-t border-base-200 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors">
                        Save Customization
                    </button>
                </div>
            </form>
            
            <div className="bg-base-300 shadow-lg rounded-lg p-8">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-semibold text-slate-700">Global Inventory Network</h2>
                    {!isPlatinum && <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded uppercase">Platinum Only</span>}
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-slate-800">Share Inventory Availability</h3>
                        <p className="text-sm text-slate-500">Allow other pharmacies in the network to see if you have specific medicines in stock.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={shareInventory} onChange={handleOptInChange} disabled={!isPlatinum} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                 </div>
            </div>

            <form onSubmit={handlePasswordChange} className="bg-base-300 shadow-lg rounded-lg p-8">
                <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-4">Change Password</h2>
                <div className="space-y-4 max-w-sm">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"/>
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                            Update Password
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PharmacySettings;
