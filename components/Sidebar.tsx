
import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { getNavLinks } from '../constants';
import { UserRole, SubscriptionPlan, Pharmacy } from '../types';
import { getPharmacyById, checkPlanAccess } from '../services/mockApi';
import { Pill, ChevronRight, Sparkles, LayoutDashboard, ShoppingCart, Package, BarChart3, Search, Users, Gift, Settings, ShieldCheck, UserCheck, CreditCard, Inbox, MessageSquare, Lightbulb, Cpu, Stethoscope, History, Rocket, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

const iconMap: Record<string, any> = {
    'Dashboard': LayoutDashboard,
    'Marketplace': ShoppingCart,
    'Marketplace Hub': ShoppingCart,
    'Inventory': Package,
    'Global Inventory': Package,
    'Sales': BarChart3,
    'Sales Reports': BarChart3,
    'Prescription Lookup': Search,
    'Staff': Users,
    'Referral Program': Gift,
    'Referral Control': Gift,
    'Settings': Settings,
    'Patient Platform Controls': ShieldCheck,
    'Patient Approval Queue': UserCheck,
    'Patient Plan Monetization': CreditCard,
    'Patient Requests': Inbox,
    'SMS Logs': MessageSquare,
    'Analytics': BarChart3,
    'Product Intelligence': Lightbulb,
    'System Health': Cpu,
    'Pharmacies': Pill,
    'Doctors': Stethoscope,
    'Audit Logs': History,
    'Plans': CreditCard,
    'Upgrade Requests': Rocket,
    'Bonus Features': Sparkles,
    'Holiday Themes': Gift,
    'System Updates': Rocket,
    'Feedback Center': MessageCircle,
};

const Sidebar = () => {
    const { user } = useAuth();
    const { logoUrl } = useTheme();
    const location = useLocation();
    const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
    const [allowedNav, setAllowedNav] = useState<any[]>([]);

    useEffect(() => {
        if ((user?.role === UserRole.PHARMACY_ADMIN || user?.role === UserRole.PHARMACIST || user?.role === UserRole.SALES) && user.pharmacyId) {
            getPharmacyById(Number(user.pharmacyId)).then(data => {
                if (data) {
                    setPharmacy(data);
                }
            });
        } else {
            setPharmacy(null);
        }
    }, [user]);

    useEffect(() => {
        const filterLinks = async () => {
            if (!user) return;
            const baseLinks = getNavLinks(user.role);
            
            const filtered = [];
            for (const link of baseLinks) {
                let allowed = true;
                
                if (link.name === 'Sales') {
                    allowed = await checkPlanAccess(user, 'sales_module');
                }
                
                if (link.name === 'Prescription Lookup') {
                     allowed = await checkPlanAccess(user, 'prescription_lookup');
                }

                if (link.name === 'Staff') {
                     allowed = await checkPlanAccess(user, 'staff_management');
                }
                
                if (link.name === 'Create Prescription') {
                    allowed = await checkPlanAccess(user, 'prescription_builder');
                }

                if (link.name === 'Marketplace') {
                    allowed = await checkPlanAccess(user, 'marketplace');
                }

                if (allowed) filtered.push(link);
            }
            setAllowedNav(filtered);
        };
        filterLinks();
    }, [user, pharmacy]);

    if (!user) return null;

    return (
        <aside className="w-72 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col z-20 relative">
            {/* Logo Section */}
            <div className="h-24 flex items-center px-8">
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                        <Pill className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-xl tracking-tighter leading-none text-slate-900">MedIntelliCare</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Clinical Intelligence</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
                <div className="px-4 mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Main Menu</p>
                </div>
                {allowedNav.map((link) => {
                    const Icon = iconMap[link.name] || LayoutDashboard;
                    const isActive = location.pathname === link.href || (link.href !== '/dashboard' && location.pathname.startsWith(link.href));
                    
                    return (
                        <NavLink
                            key={link.name}
                            to={link.href}
                            end={link.href === '/dashboard'}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                    isActive
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                                <span className="text-sm font-bold tracking-tight">{link.name}</span>
                            </div>
                            {isActive && (
                                <motion.div layoutId="active-pill">
                                    <ChevronRight className="w-4 h-4 text-white/50" />
                                </motion.div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Plan / Footer Section */}
            <div className="p-6 mt-auto">
                {user.role === UserRole.PHARMACY_ADMIN && pharmacy && (
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-[40px] -mr-12 -mt-12" />
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subscription</span>
                            </div>
                            <div>
                                <p className="text-lg font-black tracking-tight">{pharmacy.plan}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                    Expires {new Date(pharmacy.planExpiryDate).toLocaleDateString()}
                                </p>
                            </div>
                            {pharmacy.plan !== SubscriptionPlan.PLATINUM && (
                                <Link 
                                    to="/dashboard/upgrade-plans" 
                                    className="w-full block text-center py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-widest"
                                >
                                    Upgrade
                                </Link>
                            )}
                        </div>
                    </div>
                )}
                
                {(user.role === UserRole.PHARMACIST || user.role === UserRole.SALES) && pharmacy && (
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Pill className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pharmacy</span>
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[140px] mt-1">{pharmacy.name}</span>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
