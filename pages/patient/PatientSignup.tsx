
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerPatientUser } from '../../services/mockApi';
import { UserPlus, CheckCircle2, Pill, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const PatientSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        setLoading(true);
        try {
            await registerPatientUser(formData);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Signup failed.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8 border border-slate-100"
                >
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto text-5xl shadow-inner">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Review Pending</h1>
                        <div className="text-slate-500 font-medium leading-relaxed space-y-4">
                            <p>Thank you for signing up, <span className="font-bold text-slate-800">{formData.name}</span>.</p>
                            <p>Your account is currently <span className="font-bold text-primary">under review</span> by our administration team for verified access.</p>
                            <p>You will be notified once your profile has been approved.</p>
                        </div>
                    </div>
                    <Link to="/login" className="block w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20">
                        Back to Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] p-6">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -z-10" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20" />
                
                <div className="text-center mb-12 space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary/20">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Join the Network</h1>
                        <p className="text-slate-400 font-medium mt-1">Create your verified patient identity</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                            <input name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                            <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold" placeholder="0911..." />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                        <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold" placeholder="john@example.com" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Password</label>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Confirm Password</label>
                            <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold" />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-2xl border border-red-100 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:bg-slate-200 text-lg flex items-center justify-center gap-3"
                    >
                        {loading ? 'SUBMITTING...' : 'CREATE ACCOUNT'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                    <div className="text-sm">
                        <span className="text-slate-400 font-medium">Already have an account? </span>
                        <Link to="/patient-login" className="text-primary font-bold hover:underline uppercase tracking-tighter">Sign In</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PatientSignup;

