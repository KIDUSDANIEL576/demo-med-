
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { usePlanAccess } from '../hooks/usePlanAccess'; 
import { UserRole } from '../types';
import SuperAdminDashboard from './superadmin/SuperAdminDashboard';
import Analytics from './superadmin/Analytics';
import ProductAnalytics from './superadmin/ProductAnalytics'; 
import SystemHealth from './superadmin/SystemHealth'; 
import Pharmacies from './superadmin/Pharmacies';
import Doctors from './superadmin/Doctors';
import GlobalInventory from './superadmin/GlobalInventory';
import SuperAdminSalesReports from './superadmin/SalesReports';
import AuditLogs from './superadmin/AuditLogs'; 
import Plans from './superadmin/Plans';
import SystemUpdates from './superadmin/SystemUpdates';
import FeedbackCenter from './superadmin/FeedbackCenter';
import AdminSettings from './superadmin/AdminSettings';
import UpgradeRequests from './superadmin/UpgradeRequests';
import BonusFeatures from './superadmin/BonusFeatures';
import HolidayThemes from './superadmin/HolidayThemes';
import ReferralControl from './superadmin/ReferralControl';
import PatientRequests from './superadmin/PatientRequests';
import SMSLogs from './superadmin/SMSLogs';
import MarketplaceAnalytics from './superadmin/MarketplaceAnalytics';
import PatientPlatformControls from './superadmin/PatientPlatformControls';
import PatientApprovals from './superadmin/PatientApprovals';
import PatientPlanControl from './superadmin/PatientPlanControl';
import MarketplacePortal from './pharmacy/MarketplacePortal';
import PharmacyDashboard from './pharmacy/PharmacyDashboard';
import InventoryManagement from './pharmacy/InventoryManagement';
import SalesPage from './pharmacy/SalesPage';
import PrescriptionLookup from './pharmacy/PrescriptionLookup';
import PharmacySettings from './pharmacy/Settings';
import StaffManagement from './pharmacy/StaffManagement';
import PlansAndUpgrade from './pharmacy/PlansAndUpgrade';
import DoctorDashboard from './doctor/DoctorDashboard';
import CreatePrescription from './doctor/CreatePrescription';
import DoctorProfile from './doctor/Profile';
import ReferralProgram from './ReferralProgram';
import PatientSearch from './patient/PatientSearch';
import { InventoryProvider } from '../contexts/InventoryContext';
import UpgradePlan from '../components/UpgradePlan';


const Dashboard = () => {
    const { user } = useAuth();
    const { hasAccess } = usePlanAccess();

    if (!user) {
        return <Navigate to="/login" />;
    }

    const renderSuperAdminRoutes = () => (
        <Routes>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="product-intelligence" element={<ProductAnalytics />} />
            <Route path="system-health" element={<SystemHealth />} />
            <Route path="pharmacies" element={<Pharmacies />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="inventory" element={<GlobalInventory />} />
            <Route path="sales" element={<SuperAdminSalesReports />} />
            <Route path="audit" element={<AuditLogs />} /> 
            <Route path="plans" element={<Plans />} />
            <Route path="upgrade-requests" element={<UpgradeRequests />} />
            <Route path="referral-control" element={<ReferralControl />} />
            <Route path="bonus-features" element={<BonusFeatures />} />
            <Route path="holiday-themes" element={<HolidayThemes />} />
            <Route path="system-updates" element={<SystemUpdates />} />
            <Route path="feedback-center" element={<FeedbackCenter />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="patient-requests" element={<PatientRequests />} />
            <Route path="sms-logs" element={<SMSLogs />} />
            <Route path="marketplace-analytics" element={<MarketplaceAnalytics />} />
            <Route path="patient-safety" element={<PatientPlatformControls />} />
            <Route path="patient-approvals" element={<PatientApprovals />} />
            <Route path="patient-plans" element={<PatientPlanControl />} />
        </Routes>
    );

    const renderPharmacyAdminRoutes = () => {
        return (
            <InventoryProvider>
                <Routes>
                    <Route index element={<PharmacyDashboard />} />
                    {/* PLAN GATING: MARKETPLACE ACCESS PROTECTION */}
                    <Route path="marketplace" element={ 
                        hasAccess('marketplace') ? <MarketplacePortal /> : <UpgradePlan featureName="B2B Marketplace" /> 
                    } />
                    <Route path="inventory" element={<InventoryManagement />} />
                    <Route path="sales/*" element={ hasAccess('sales_module') ? <SalesPage /> : <UpgradePlan featureName="Sales Terminal" /> } />
                    <Route path="prescription-lookup" element={hasAccess('prescription_lookup') ? <PrescriptionLookup /> : <UpgradePlan featureName="Prescription Lookup" />} />
                    <Route path="staff" element={hasAccess('staff_management') ? <StaffManagement /> : <UpgradePlan featureName="Staff Management" />} />
                    <Route path="referral" element={<ReferralProgram />} />
                    <Route path="settings" element={<PharmacySettings />} />
                    <Route path="upgrade-plans" element={<PlansAndUpgrade />} />
                </Routes>
            </InventoryProvider>
        );
    };
    
    const renderRoutesByRole = () => {
        switch (user.role) {
            case UserRole.SUPER_ADMIN: return renderSuperAdminRoutes();
            case UserRole.PHARMACY_ADMIN: return renderPharmacyAdminRoutes();
            default: return <Navigate to="/login" />;
        }
    };

    return (
        <Layout>
            {renderRoutesByRole()}
        </Layout>
    );
};

export default Dashboard;
