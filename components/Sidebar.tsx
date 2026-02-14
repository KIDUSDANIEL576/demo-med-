
import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { getNavLinks } from '../constants';
import { UserRole, SubscriptionPlan, Pharmacy } from '../types';
import { getPharmacyById, checkPlanAccess } from '../services/mockApi';

const Sidebar = () => {
    const { user } = useAuth();
    const { logoUrl } = useTheme();
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
                
                // --- DYNAMIC GATING REFACTOR (Prompt #9) ---
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

                // Gating for Marketplace
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
        <aside className="w-64 flex-shrink-0 bg-primary text-white flex flex-col shadow-xl z-20">
            <div className="h-16 flex items-center justify-center border-b border-white/20 p-2 bg-primary/10">
                 {pharmacy && logoUrl ? (
                     <img src={logoUrl} alt="Pharmacy Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                    <span className="text-2xl font-bold tracking-tight">MedIntelliCare</span>
                )}
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {allowedNav.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.href}
                        end={link.href === '/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group ${
                                isActive
                                    ? 'bg-white/20 text-white shadow-md translate-x-1'
                                    : 'text-white/80 hover:bg-white/10 hover:translate-x-1'
                            }`
                        }
                    >
                        <span className="mr-3 opacity-80 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                        {link.name}
                    </NavLink>
                ))}
            </nav>
            {user.role === UserRole.PHARMACY_ADMIN && pharmacy && (
                <div className="mt-auto p-4 border-t border-white/20 bg-primary/5">
                    <div className="bg-white/10 p-3 rounded-lg text-center animate-fade-in backdrop-blur-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Current Plan</p>
                        <p className="text-lg font-bold">{pharmacy.plan}</p>
                        <p className="text-xs text-white/70 mt-1 mb-3">
                            Expires: {new Date(pharmacy.planExpiryDate).toLocaleDateString()}
                        </p>
                        {pharmacy.plan !== SubscriptionPlan.PLATINUM && (
                            <Link 
                                to="/dashboard/upgrade-plans" 
                                className="w-full block text-center px-3 py-1.5 bg-white text-primary text-xs font-bold rounded shadow-sm hover:bg-gray-100 transition-colors uppercase tracking-wide"
                            >
                                Upgrade Now
                            </Link>
                        )}
                    </div>
                </div>
            )}
            {(user.role === UserRole.PHARMACIST || user.role === UserRole.SALES) && pharmacy && (
                <div className="mt-auto p-4 border-t border-white/20 text-center">
                     <p className="text-xs text-white/60 font-medium">{pharmacy.name}</p>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
