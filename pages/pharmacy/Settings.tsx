
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SubscriptionPlan } from '../../types';
import { changePassword } from '../../services/mockApi';
import { Settings, Palette, Globe, Lock, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PharmacySettings: React.FC = () => {
    const { user } = useAuth();
    const { primaryColor, setPrimaryColor, logoUrl, setLogoUrl } = useTheme();

    const [color, setColor] = useState(primaryColor || '#007E85');
    const [logo, setLogo] = useState<string | null>(null); 
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
        setColor(primaryColor || '#007E85');
        setLogoPreview(logoUrl);
    }, [primaryColor, logoUrl]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { 
                showStatusMessage("File is too large. Max 2MB.", 'error');
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
        
        setPrimaryColor(color);
        if (logo) {
            setLogoUrl(logo);
        }
        
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
            showStatusMessage("Password changed successfully!", 'success');
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
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <Settings className="w-4 h-4" />
                        System Configuration
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Pharmacy Settings</h1>
                    <p className="text-slate-400 font-medium text-lg">Manage your pharmacy's identity, security, and network preferences.</p>
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
                    {/* UI Customization */}
                    <motion.form 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleCustomizationSave} 
                        className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Palette className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Visual Identity</h2>
                                <p className="text-slate-400 font-medium">Customize how your pharmacy appears to staff and patients.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pharmacy Logo</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-32 h-32 bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden group">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo Preview" className="max-h-full max-w-full object-contain p-4" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-slate-200" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <input 
                                            type="file" 
                                            onChange={handleFileChange} 
                                            accept="image/png, image/jpeg, image/svg+xml" 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm font-bold text-slate-700">Upload Brand Logo</p>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Recommended: SVG or high-res PNG. Max file size 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Brand Color</label>
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
                                        <p className="text-sm font-bold text-slate-700">Primary Accent</p>
                                        <p className="text-sm font-mono font-black text-primary">{color.toUpperCase()}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Used for buttons, highlights, and active states.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                            <button type="submit" className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 uppercase text-[10px] tracking-widest">
                                Save Visual Identity
                            </button>
                        </div>
                    </motion.form>

                    {/* Security */}
                    <motion.form 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handlePasswordChange} 
                        className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Security & Access</h2>
                                <p className="text-slate-400 font-medium">Update your administrative credentials.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Password</label>
                                <input 
                                    type="password" 
                                    value={currentPassword} 
                                    onChange={e => setCurrentPassword(e.target.value)} 
                                    required 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">New Password</label>
                                <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={e => setNewPassword(e.target.value)} 
                                    required 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                    required 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                            <button type="submit" className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 uppercase text-[10px] tracking-widest">
                                Update Credentials
                            </button>
                        </div>
                    </motion.form>
                </div>

                <div className="space-y-12">
                    {/* Network Preferences */}
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
                                    <h2 className="text-xl font-black uppercase tracking-tighter">Global Network</h2>
                                    <p className="text-slate-400 text-xs font-medium">Inventory sharing preferences.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                    <div className="flex-1 pr-4">
                                        <h3 className="font-black text-sm uppercase tracking-widest">Share Inventory</h3>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">Allow other pharmacies to see your stock levels for discovery.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={shareInventory} onChange={handleOptInChange} disabled={!isPlatinum} className="sr-only peer" />
                                        <div className="w-14 h-8 bg-white/10 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                {!isPlatinum && (
                                    <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-start gap-4">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Platinum Required</p>
                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Global network features are exclusive to Platinum partners.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Platform Trust */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Platform Trust</h2>
                                <p className="text-slate-400 text-xs font-medium">Compliance and security status.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Encryption</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Logging</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2FA Status</span>
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Disabled</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PharmacySettings;
