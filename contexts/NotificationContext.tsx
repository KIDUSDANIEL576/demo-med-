import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { MICNotification } from '../types';
import { getNotifications, addNotification as apiAddNotification } from '../services/mockApi';

interface NotificationContextType {
  notifications: MICNotification[];
  addNotice: (title: string, message: string) => Promise<void>;
  fetchNotices: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<MICNotification[]>([]);

    const fetchNotices = useCallback(() => {
        getNotifications().then(setNotifications);
    }, []);

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    const addNotice = async (title: string, message: string) => {
        await apiAddNotification({ title, message });
        fetchNotices(); // Re-fetch to get the latest list
    };
    
    return (
        <NotificationContext.Provider value={{ notifications, addNotice, fetchNotices }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};