
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { updateUserProfile, changePassword, getFeatureFlags } from '../../services/mockApi';
import { FeatureFlag } from '../../types';

const AdminSettings: React.FC = () => {
    const { user, setUser } = useAuth();
    const { primaryColor, setPrimaryColor, setLogoUrl, setBackgroundUrl } = useTheme();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [color, setColor] = useState(primaryColor || '#007E85');
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'success' | 'error'>('success');
    
    const [bgPreview, setBgPreview] = useState<string | null>(localStorage.getItem('superadmin_background'));
    const [logoPreview, setLogoPreview] = useState<string | null>(localStorage.getItem('superadmin_logo'));

    const [locatorEnabled, setLocatorEnabled] = useState(true);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        getFeatureFlags().then(flags => {
            const locator = flags.find(f => f.feature_key === 'public_locator_module');
            if (locator) setLocatorEnabled(locator.default_enabled);
        });
    }, []);

    const showStatusMessage = (message: string, type: 'success' | 'error' = 'success') => {
        setStatusMessage(message);
        setStatusType(type);
        setTimeout(() => setStatusMessage(''), 3000);
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            const updatedUser = { ...user, name, email };
            await updateUserProfile(updatedUser);
            setUser(updatedUser);
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            showStatusMessage('Profile updated successfully!');
        }
    };
    
    const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { 
                alert("File is too large. Please select an image under 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                localStorage.setItem('superadmin_background', base64String);
                setBgPreview(base64String);
                setBackgroundUrl(base64String);
                showStatusMessage('Background applied instantly!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (file.size > 2 * 1024 * 1024) { 
                alert("File is too large. Please select an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                localStorage.setItem('superadmin_logo', base64String);
                setLogoPreview(base64String);
                setLogoUrl(base64String);
                showStatusMessage('System Logo applied instantly!');
            };
            reader.readAsDataURL(file);
        }
    }

    const handleThemeSave = (e: React.FormEvent) => {
        e.preventDefault();
        setPrimaryColor(color);
        localStorage.setItem('superadmin_color', color);
        showStatusMessage('Theme color updated!');
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
            showStatusMessage("Password changed successfully!", 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showStatusMessage(error.message, 'error');
        }
    };

    const toggleLocator = () => {
        setLocatorEnabled(!locatorEnabled);
        showStatusMessage(`Patient Locator ${!locatorEnabled ? 'Enabled' : 'Disabled'}`);
        // In a real app, this would hit an API to update feature_flags table
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Admin Settings</h1>
                {statusMessage && (
                    <div className={`px-4 py-2 rounded-md animate-fade-in ${statusType === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {statusMessage}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                     <form onSubmit={handleProfileSave} className="bg-base-300 shadow-lg rounded-lg p-8">
                        <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-4">Admin Profile</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Display Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"/>
                            </div>
                        </div>
                         <div className="mt-6 pt-6 border-t border-base-200 flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors">
                                Save Profile
                            </button>
                        </div>
                    </form>

                    <div className="bg-base-300 shadow-lg rounded-lg p-8">
                        <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-4">Module Management</h2>
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                            <div>
                                <h3 className="font-bold text-slate-800">Patient Locator Module</h3>
                                <p className="text-xs text-slate-500">Allow patients to search medication availability.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={locatorEnabled} onChange={toggleLocator} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>

                     <form onSubmit={handleThemeSave} className="bg-base-300 shadow-lg rounded-lg p-8">
                        <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-4">UI Customization</h2>
                         <div>
                            <label htmlFor="themeColor" className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
                            <div className="flex items-center gap-4">
                                 <input type="color" id="themeColor" value={color} onChange={(e) => setColor(e.target.value)} className="p-1 h-12 w-12 block bg-white border border-gray-300 cursor-pointer rounded-lg"/>
                                 <div className="flex-grow p-3 rounded-md text-center text-white font-bold" style={{ backgroundColor: color }}>
                                     {color.toUpperCase()}
                                 </div>
                            </div>
                        </div>
                         <div className="mt-4">
                             <label className="block text-sm font-medium text-slate-700 mb-2">Background Image (Instant Apply)</label>
                              <input type="file" onChange={handleBgChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                             {bgPreview && <img src={bgPreview} alt="BG Preview" className="mt-2 h-24 w-auto rounded-md object-cover border"/>}
                         </div>
                         <div className="mt-4">
                             <label className="block text-sm font-medium text-slate-700 mb-2">System Logo (Instant Apply)</label>
                              <input type="file" onChange={handleLogoChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                             {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 h-16 w-auto p-1 border rounded bg-white"/>}
                         </div>
                         <div className="mt-6 pt-6 border-t border-base-200 flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors">
                                Apply Color
                            </button>
                        </div>
                    </form>
                </div>
                
                <form onSubmit={handlePasswordChange} className="bg-base-300 shadow-lg rounded-lg p-8">
                    <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b pb-4">Change Password</h2>
                    <div className="space-y-4">
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
                        <div className="pt-6 flex justify-end">
                            <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                                Update Password
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
