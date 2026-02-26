
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addPharmacy, createPharmacyAdmin } from '../../services/mockApi';
import { SubscriptionPlan } from '../../types';
import { Building2, Mail, Lock, Phone, MapPin, ArrowRight, Pill, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PharmacyRegistration: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Pharmacy Info, 2: Admin Info, 3: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [pharmacyData, setPharmacyData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        plan: SubscriptionPlan.BASIC,
    });

    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handlePharmacyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setPharmacyData({ ...pharmacyData, [e.target.name]: e.target.value });
    };

    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminData({ ...adminData, [e.target.name]: e.target.value });
    };

    const nextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create Pharmacy
            const newPharmacyId = Math.floor(Math.random() * 1000) + 500;
            const pharmacyToSave = {
                ...pharmacyData,
                id: newPharmacyId,
                staff: 1,
                inventory_limit: pharmacyData.plan === SubscriptionPlan.ENTERPRISE ? 999999 : (pharmacyData.plan === SubscriptionPlan.PRO ? 100 : 50),
                createdBy: 'self-registered',
                planStartDate: new Date().toISOString().split('T')[0],
                planExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                createdAt: new Date().toISOString().split('T')[0],
                lastLogin: 'Never',
                isDeleted: false
            };

            await addPharmacy(pharmacyToSave);

            // 2. Create Admin User
            await createPharmacyAdmin({
                name: adminData.name,
                email: adminData.email,
                password: adminData.password,
                pharmacyId: newPharmacyId,
                plan: pharmacyData.plan
            });

            setStep(3);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10 translate-x-[-20%] translate-y-[-20%]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-secondary/5 blur-[120px] rounded-full -z-10 translate-x-[20%] translate-y-[20%]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20" />
                
                <div className="text-center mb-12 space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary/20">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Pharmacy Registration</h1>
                        <p className="text-slate-400 font-medium mt-1">Join the MedIntelliCare professional network.</p>
                    </div>
                </div>

                <div className="flex justify-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${step >= 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>1</div>
                        <div className={`w-12 h-1 bg-slate-100 rounded-full overflow-hidden`}>
                            <div className={`h-full bg-primary transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${step >= 2 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>2</div>
                        <div className={`w-12 h-1 bg-slate-100 rounded-full overflow-hidden`}>
                            <div className={`h-full bg-primary transition-all duration-500 ${step >= 3 ? 'w-full' : 'w-0'}`} />
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${step >= 3 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400'}`}>3</div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={nextStep} 
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Pharmacy Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input name="name" value={pharmacyData.name} onChange={handlePharmacyChange} required placeholder="Abbebe Pharmacy" className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Business Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input name="email" type="email" value={pharmacyData.email} onChange={handlePharmacyChange} required placeholder="contact@pharmacy.com" className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input name="phone" value={pharmacyData.phone} onChange={handlePharmacyChange} required placeholder="+251..." className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Subscription Plan</label>
                                    <select name="plan" value={pharmacyData.plan} onChange={handlePharmacyChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800">
                                        <option value={SubscriptionPlan.BASIC}>Basic Plan (Free Trial)</option>
                                        <option value={SubscriptionPlan.PRO}>Pro Plan</option>
                                        <option value={SubscriptionPlan.ENTERPRISE}>Enterprise Plan</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Business Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input name="address" value={pharmacyData.address} onChange={handlePharmacyChange} required placeholder="Addis Ababa, Ethiopia" className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800" />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                                Next: Admin Credentials
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleSubmit} 
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Admin Full Name</label>
                                    <input name="name" value={adminData.name} onChange={handleAdminChange} required placeholder="John Doe" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Admin Login Email</label>
                                    <input name="email" type="email" value={adminData.email} onChange={handleAdminChange} required placeholder="admin@pharmacy.com" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Create Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input name="password" type="password" value={adminData.password} onChange={handleAdminChange} required placeholder="••••••••" className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800" />
                                    </div>
                                </div>
                            </div>

                            {error && <p className="text-sm text-center text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>}

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Back</button>
                                <button type="submit" disabled={loading} className="flex-[2] py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:bg-slate-200">
                                    {loading ? 'Processing...' : 'Complete Registration'}
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8 py-10"
                        >
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-xl shadow-emerald-500/10">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Welcome Aboard!</h2>
                                <p className="text-slate-500 font-medium mt-2">Your pharmacy has been registered successfully. You can now log in with your admin credentials.</p>
                            </div>
                            <Link to="/login" className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                                Go to Login
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                    <p className="text-sm text-slate-400 font-medium">
                        Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PharmacyRegistration;
