
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Phone, ShieldCheck, ChevronLeft, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PatientLogin = () => {
    const { initiatePatientLogin, verifyPatientSession } = useAuth();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<1 | 2>(1); // 1: Phone, 2: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await initiatePatientLogin(phone);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await verifyPatientSession(phone, otp);
            navigate('/patient');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] p-6">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -z-10" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                
                <div className="text-center mb-12 space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary/20">
                        <Pill className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Patient Portal</h1>
                        <p className="text-slate-400 font-medium mt-1">Access your healthcare network</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleInitiate} 
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input 
                                        type="tel" 
                                        required 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        className="w-full p-5 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg font-bold"
                                        placeholder="09..."
                                    />
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl">{error}</p>}
                            <button 
                                disabled={loading}
                                className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:bg-slate-200"
                            >
                                {loading ? 'Sending Code...' : 'Get Access Code'}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleVerify} 
                            className="space-y-8 text-center"
                        >
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl inline-flex items-center gap-2 text-sm font-bold">
                                    <ShieldCheck className="w-4 h-4" />
                                    Code sent to {phone}
                                </div>
                                <input 
                                    type="text" 
                                    required 
                                    maxLength={6}
                                    autoFocus
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    className="w-full p-6 text-center text-4xl font-black tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                    placeholder="000000"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
                            <div className="space-y-4">
                                <button 
                                    disabled={loading}
                                    className="w-full py-5 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:bg-slate-200"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors mx-auto">
                                    <ChevronLeft className="w-4 h-4" />
                                    Change Phone Number
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-12 pt-8 border-t border-slate-50 text-center space-y-6">
                    <div className="text-sm">
                        <span className="text-slate-400 font-medium">New to MedIntelliCare? </span>
                        <Link to="/patient-signup" className="text-primary font-bold hover:underline uppercase tracking-tighter">Register</Link>
                    </div>
                    <div className="text-xs">
                        <Link to="/login" className="text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest">Staff Portal Login</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PatientLogin;

