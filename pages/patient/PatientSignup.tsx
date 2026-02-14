
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerPatientUser } from '../../services/mockApi';

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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 animate-fade-in border border-slate-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                        ✓
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Review Pending</h1>
                    <div className="text-slate-500 leading-relaxed space-y-4">
                        <p>Thank you for signing up, <span className="font-bold text-slate-800">{formData.name}</span>.</p>
                        <p>Your account is currently <span className="font-bold text-indigo-600">under review</span> by our administration team for verified access.</p>
                        <p>You will be notified once your profile has been approved.</p>
                    </div>
                    <Link to="/login" className="block w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 animate-fade-in border border-slate-100">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">JOIN THE NETWORK</h1>
                    <p className="text-slate-500 mt-2 font-medium">Create your verified patient identity.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                            <input name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="John Doe" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                            <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="0911..." />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                        <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="john@example.com" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
                            <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl border border-red-100 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:bg-slate-300"
                    >
                        {loading ? 'SUBMITTING...' : 'CREATE ACCOUNT'}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                    <div className="text-sm">
                        <span className="text-slate-400 font-medium">Already have an account? </span>
                        <Link to="/login" className="text-indigo-600 font-black hover:underline uppercase tracking-tighter">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientSignup;
