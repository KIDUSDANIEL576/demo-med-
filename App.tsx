
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrescriptionPrint from './pages/PrescriptionPrint';
import PatientDashboard from './pages/PatientDashboard';
import PatientSignup from './pages/patient/PatientSignup';
import PatientLogin from './pages/patient/PatientLogin'; // Added
import { UserRole } from './types';
import { getPlatformFeature } from './services/mockApi';

const ProtectedRoute: React.FC<{ children: React.ReactElement; roles: UserRole[] }> = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  return children;
};

// --- GLOBAL TOGGLE ENFORCEMENT ---
const PatientPlatformGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<'loading' | 'enabled' | 'disabled'>('loading');

    useEffect(() => {
        getPlatformFeature('patient_platform').then(enabled => {
            setStatus(enabled ? 'enabled' : 'disabled');
        });
    }, []);

    if (status === 'loading') return null;
    
    if (status === 'disabled') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
                <div className="max-w-md">
                    <div className="text-6xl mb-6">🛠️</div>
                    <h1 className="text-3xl font-extrabold text-white mb-4">Patient Platform Coming Soon</h1>
                    <p className="text-slate-400 leading-relaxed">
                        We are currently digitizing the patient experience. This module is undergoing scheduled maintenance and will be live shortly.
                    </p>
                    <a href="/#/login" className="mt-8 inline-block text-primary font-bold hover:underline">
                        Pharmacy Staff Login
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Staff Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/prescription/print/:id" element={<PrescriptionPrint />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.SALES]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Patient Platform (Guarded) */}
      <Route path="/patient-signup" element={<PatientPlatformGuard><PatientSignup /></PatientPlatformGuard>} />
      <Route path="/patient-login" element={<PatientPlatformGuard><PatientLogin /></PatientPlatformGuard>} />
      <Route path="/patient/*" element={
          <PatientPlatformGuard>
              <PatientDashboard />
          </PatientPlatformGuard>
      } />

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
            <HashRouter>
              <AppRoutes />
            </HashRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
