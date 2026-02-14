
import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import SalesReports from './SalesReports';
import SalesTerminal from './SalesTerminal';
import { useAuth } from '../../hooks/useAuth';
import { usePlanAccess } from '../../hooks/usePlanAccess'; // Prompt #9
import UpgradePlan from '../../components/UpgradePlan';

const SalesPage = () => {
    const { user } = useAuth();
    const { hasAccess, loading, checkAccess } = usePlanAccess();

    useEffect(() => {
        checkAccess('sales_module');
    }, []);

    if (loading) return <div className="p-8">Checking permissions...</div>;

    if (!hasAccess('sales_module')) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 shadow-md rounded-r-md">
                    <div className="flex">
                         <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-bold text-red-800">Access Denied</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Your current plan does not include <strong>Prescription Lookup</strong>. This feature is available in Standard and Platinum plans.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <UpgradePlan featureName="Prescription Lookup & Analytics" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Sales</h1>
                 <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-1 bg-base-200">
                    <NavLink
                        to="/dashboard/sales"
                        end
                        className={({ isActive }) =>
                            `px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                isActive ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-base-300'
                            }`
                        }
                    >
                        Sales Terminal
                    </NavLink>
                    <NavLink
                        to="/dashboard/sales/reports"
                        className={({ isActive }) =>
                             `px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                isActive ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-base-300'
                            }`
                        }
                    >
                        Reports
                    </NavLink>
                </div>
            </div>

            <Routes>
                <Route index element={<SalesTerminal />} />
                <Route path="reports" element={<SalesReports />} />
            </Routes>
        </div>
    );
};

export default SalesPage;
