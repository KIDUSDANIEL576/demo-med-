
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { updateUserProfile, changePassword, getFeatureFlags } from '../../services/mockApi';
import { FeatureFlag } from '../../types';
import { Settings, User, Shield, Palette, Lock, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, Globe, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
                showStatusMessage("File too large. Max 5MB.", 'error');
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
                showStatusMessage("File too large. Max 2MB.", 'error');
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
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <Shield className="w-4 h-4" />
                        Global Administration
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Admin Settings</h1>
                    <p className="text-slate-400 font-medium text-lg">Manage global platform identity, security, and feature flags.</p>
                </div>

                <AnimatePresence>
                    {statusMessage && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm shadow-xl ${
                                statusType === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'
                            }`}
                        >
                            {statusType === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {statusMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Admin Profile */}
                    <motion.form 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleProfileSave} 
                        className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Admin Profile</h2>
                                <p className="text-slate-400 font-medium">Your personal administrative identity.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Display Name</label>
                                <input 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    required 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                            <button type="submit" className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 uppercase text-[10px] tracking-widest">
                                Save Profile
                            </button>
                        </div>
                    </motion.form>

                    {/* UI Customization */}
                    <motion.form 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleThemeSave} 
                        className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500">
                                <Palette className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Global Branding</h2>
                                <p className="text-slate-400 font-medium">Customize the platform's visual signature.</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Global Accent Color</label>
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <input 
                                                type="color" 
                                                id="themeColor" 
                                                value={color} 
                                                onChange={(e) => setColor(e.target.value)} 
                                                className="w-20 h-20 rounded-[2rem] border-none cursor-pointer bg-transparent"
                                            />
                                            <div 
                                                className="absolute inset-0 rounded-[2rem] pointer-events-none border-4 border-white shadow-inner"
                                                style={{ backgroundColor: color }}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm font-bold text-slate-700">Primary Theme</p>
                                            <p className="text-sm font-mono font-black text-primary">{color.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Logo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden group">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo Preview" className="max-h-full max-w-full object-contain p-2" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-slate-200" />
                                            )}
                                            <input type="file" onChange={handleLogoChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-bold text-slate-700">Platform Logo</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Max 2MB. SVG/PNG.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Background Atmosphere</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-full h-32 bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden group">
                                        {bgPreview ? (
                                            <img src={bgPreview} alt="BG Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="w-6 h-6 text-slate-200" />
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Upload Atmosphere</span>
                                            </div>
                                        )}
                                        <input type="file" onChange={handleBgChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                            <button type="submit" className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 uppercase text-[10px] tracking-widest">
                                Apply Theme
                            </button>
                        </div>
                    </motion.form>
                </div>

                <div className="space-y-12">
                    {/* Module Management */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tighter">Global Modules</h2>
                                    <p className="text-slate-400 text-xs font-medium">Feature flag control center.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10 group hover:bg-white/10 transition-all cursor-pointer" onClick={toggleLocator}>
                                    <div className="flex-1 pr-4">
                                        <h3 className="font-black text-sm uppercase tracking-widest">Patient Locator</h3>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">Public-facing medicine discovery module.</p>
                                    </div>
                                    {locatorEnabled ? <ToggleRight className="w-10 h-10 text-primary" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Security */}
                    <motion.form 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handlePasswordChange} 
                        className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Credentials</h2>
                                <p className="text-slate-400 text-xs font-medium">Update admin password.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <input 
                                type="password" 
                                value={currentPassword} 
                                onChange={e => setCurrentPassword(e.target.value)} 
                                placeholder="Current Password"
                                required 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 text-sm"
                            />
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={e => setNewPassword(e.target.value)} 
                                placeholder="New Password"
                                required 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 text-sm"
                            />
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                placeholder="Confirm New Password"
                                required 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 text-sm"
                            />
                        </div>

                        <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 uppercase text-[10px] tracking-widest">
                            Update Password
                        </button>
                    </motion.form>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
