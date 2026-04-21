import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { MICNotification } from '../types';
import { getNotifications, addNotification as apiAddNotification } from '../services/mockApi';

interface NotificationContextType {
  notifications: MICNotification[];
  unreadCount: number;
  readNoticeIds: Set<string>;
  addNotice: (title: string, message: string) => Promise<void>;
  markAllRead: () => void;
  fetchNotices: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<MICNotification[]>([]);
    const [readNoticeIds, setReadNoticeIds] = useState<Set<string>>(() => {
        const saved = sessionStorage.getItem('read_notices');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const fetchNotices = useCallback(() => {
        getNotifications().then(setNotifications);
    }, []);

    const markAllRead = useCallback(() => {
        const allIds = notifications.map(n => n.id);
        const newReadSet = new Set(allIds);
        setReadNoticeIds(newReadSet);
        sessionStorage.setItem('read_notices', JSON.stringify(Array.from(newReadSet)));
    }, [notifications]);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !readNoticeIds.has(n.id)).length;
    }, [notifications, readNoticeIds]);

    useEffect(() => {
        fetchNotices();
        
        // --- REAL-TIME POLLING SIMULATION ---
        const interval = setInterval(fetchNotices, 15000); // Poll every 15 seconds
        return () => clearInterval(interval);
    }, [fetchNotices]);

    const addNotice = useCallback(async (title: string, message: string) => {
        await apiAddNotification({ title, message });
        fetchNotices();
    }, [fetchNotices]);
    
    const value = useMemo(() => ({ 
        notifications, 
        unreadCount, 
        readNoticeIds,
        addNotice, 
        markAllRead, 
        fetchNotices 
    }), [notifications, unreadCount, readNoticeIds, addNotice, markAllRead, fetchNotices]);
    
    return (
        <NotificationContext.Provider value={value}>
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