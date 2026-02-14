
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Patient } from '../types';
import { mockLogin, loginPatient, verifyPatientOTP } from '../services/mockApi';

interface AuthContextType {
  // Staff Auth
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<User>; // Updated return type
  logout: () => void;
  
  // Patient Auth (Isolated)
  patient: Patient | null;
  initiatePatientLogin: (phone: string) => Promise<void>;
  verifyPatientSession: (phone: string, otp: string) => Promise<void>;
  patientLogout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Staff State
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('user_session');
    return stored ? JSON.parse(stored) : null;
  });

  // Patient State
  const [patient, setPatient] = useState<Patient | null>(() => {
    const stored = sessionStorage.getItem('patient_session');
    return stored ? JSON.parse(stored) : null;
  });

  // --- STAFF HANDLERS ---
  const login = async (email: string, password: string) => {
    const loggedInUser = await mockLogin(email, password);
    setUser(loggedInUser);
    sessionStorage.setItem('user_session', JSON.stringify(loggedInUser));
    return loggedInUser; // Return the user object
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user_session');
  };

  // --- PATIENT HANDLERS ---
  const initiatePatientLogin = async (phone: string) => {
    await loginPatient(phone);
  };

  const verifyPatientSession = async (phone: string, otp: string) => {
    const authenticatedPatient = await verifyPatientOTP(phone, otp);
    setPatient(authenticatedPatient);
    sessionStorage.setItem('patient_session', JSON.stringify(authenticatedPatient));
  };

  const patientLogout = () => {
    setPatient(null);
    sessionStorage.removeItem('patient_session');
  };

  return (
    <AuthContext.Provider value={{ 
      user, setUser,
      login, logout, 
      patient, initiatePatientLogin, verifyPatientSession, patientLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
