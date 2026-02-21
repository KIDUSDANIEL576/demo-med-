
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PatientSearch from './patient/PatientSearch';
import { LogOut, Search, History, Settings, User, Bell, Home, Pill, MapPin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PatientDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { path: '/patient', icon: Home, label: 'Overview' },
        { path: '/patient/search', icon: Search, label: 'Find Medicine' },
        { path: '/patient/orders', icon: History, label: 'My Orders' },
        { path: '/patient/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans text-slate-900">
            {/* Elegant Header */}
            <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-6'
            }`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link to="/patient" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                            <Pill className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tighter leading-none">MedIntelliCare</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Patient Portal</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link 
                                key={item.path}
                                to={item.path}
                                className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-primary ${
                                    location.pathname === item.path ? 'text-primary' : 'text-slate-400'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                        <button 
                            onClick={() => { logout(); navigate('/login'); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow pt-32">
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<PatientOverview />} />
                        <Route path="/search" element={<PatientSearch />} />
                        <Route path="/orders" element={<PatientOrders />} />
                        <Route path="/profile" element={<PatientProfile />} />
                    </Routes>
                </AnimatePresence>
            </main>

            <footer className="bg-white py-12 border-t mt-20">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 opacity-50">
                        <Pill className="w-5 h-5" />
                        <span className="font-bold tracking-tighter">MedIntelliCare AI</span>
                    </div>
                    <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                        &copy; 2026 MedIntelliCare. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const PatientOverview = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-6 space-y-12"
        >
            {/* Welcome Hero */}
            <div className="relative rounded-[3rem] bg-slate-900 p-12 md:p-20 overflow-hidden text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10 max-w-2xl space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI-First Healthcare
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                        Your Health, <br />
                        <span className="text-primary italic font-serif">Simplified.</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                        Access medications, track orders, and find nearby pharmacies with clinical-grade intelligence.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link 
                            to="/patient/search" 
                            className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                        >
                            <Search className="w-5 h-5" />
                            Find Medicine
                        </Link>
                        <button className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10 flex items-center gap-3">
                            <History className="w-5 h-5" />
                            View History
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: MapPin, title: 'Nearby Access', desc: 'Find pharmacies within 5km of your current location.', color: 'bg-blue-500' },
                    { icon: Pill, title: 'Stock Alerts', desc: 'Get notified when rare medications become available.', color: 'bg-emerald-500' },
                    { icon: Settings, title: 'Smart Refills', desc: 'AI-driven reminders for your recurring prescriptions.', color: 'bg-purple-500' },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const PatientOrders = () => (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <History className="w-16 h-16 text-slate-200 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Order History</h2>
        <p className="text-slate-500 mt-2">You haven't placed any orders yet.</p>
    </div>
);

const PatientProfile = () => (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <User className="w-16 h-16 text-slate-200 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">My Profile</h2>
        <p className="text-slate-500 mt-2">Manage your health profile and preferences.</p>
    </div>
);

export default PatientDashboard;

