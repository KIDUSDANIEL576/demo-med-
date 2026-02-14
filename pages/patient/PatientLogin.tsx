
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fade-in border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Patient Sign In</h1>
                    <p className="text-slate-500 mt-2">Find medicine near you instantly.</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleInitiate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">Phone Number</label>
                            <input 
                                type="tel" 
                                required 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="09..."
                            />
                        </div>
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        <button 
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                        >
                            {loading ? 'Sending Code...' : 'Next'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6 text-center">
                        <p className="text-sm text-slate-600">Enter the code sent to <span className="font-bold">{phone}</span></p>
                        <input 
                            type="text" 
                            required 
                            maxLength={6}
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            className="w-full p-4 text-center text-3xl font-bold tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="000000"
                        />
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        <button 
                            disabled={loading}
                            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg"
                        >
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-400 hover:underline">Change Phone Number</button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t text-center space-y-4">
                    <div className="text-sm">
                        <span className="text-slate-500">New here? </span>
                        <Link to="/patient-signup" className="text-indigo-600 font-bold hover:underline">Register Account</Link>
                    </div>
                    <div className="text-sm">
                        <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In with Credentials</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientLogin;
