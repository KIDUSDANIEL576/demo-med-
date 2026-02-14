
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { BellIcon, Cog6ToothIcon } from '../constants';
import { UserRole } from '../types';
import { useNotification } from '../contexts/NotificationContext';

const getReadNotices = (): Set<string> => {
    const read = sessionStorage.getItem('read_notices');
    if (!read) return new Set();

    try {
        const data = JSON.parse(read);
        if (Array.isArray(data)) {
            return new Set(data);
        }
        throw new Error("Stored 'read_notices' data is not an array.");
    } catch (error) {
        console.error("Failed to parse read notices from session storage, clearing it:", error);
        sessionStorage.removeItem('read_notices'); 
        return new Set();
    }
};

const setReadNotices = (readSet: Set<string>) => {
    sessionStorage.setItem('read_notices', JSON.stringify(Array.from(readSet)));
};

const Header = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications = [] } = useNotification();
  const [readNotices, setRead] = useState<Set<string>>(getReadNotices);

  const safeNotifications = notifications || [];

  const unreadCount = useMemo(() => {
    return safeNotifications.filter(n => !readNotices.has(n.id)).length;
  }, [safeNotifications, readNotices]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleSettings = () => {
    const pathMap = {
        [UserRole.SUPER_ADMIN]: '/dashboard/settings',
        [UserRole.DOCTOR]: '/dashboard/profile',
        [UserRole.PHARMACY_ADMIN]: '/dashboard/settings',
    };
    navigate(pathMap[user!.role] || '/dashboard/settings');
  }
  
  const handleOpenNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen && unreadCount > 0) {
        const allNoticeIds = new Set<string>(safeNotifications.map(n => n.id));
        setRead(allNoticeIds);
        setReadNotices(allNoticeIds);
    }
  }

  if (!user) return null;

  return (
    <header className={`bg-base-300 shadow-md ${theme === 'christmas' ? 'theme-christmas-header' : ''}`}>
      <div className="flex items-center justify-between p-4 h-16 relative">
         <div className="flex-1"></div> 
        <div className="flex items-center">
            <div className="relative">
              <button 
                onClick={handleOpenNotifications} 
                className={`mr-4 text-slate-500 hover:text-slate-700 relative ${unreadCount > 0 ? 'animate-pulse' : ''}`}
                title="Notifications"
              >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold border-2 border-base-300">
                        {unreadCount}
                    </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-base-300 rounded-md shadow-lg z-20 animate-fade-in max-h-96 overflow-y-auto border border-base-200">
                  <div className="p-2 space-y-1">
                    {safeNotifications.length > 0 ? safeNotifications.slice().reverse().map(notice => (
                        <div key={notice.id} className="p-3 hover:bg-base-200 rounded-md border-b border-base-100 last:border-0">
                            <p className="font-semibold text-sm text-slate-800">{notice.title}</p>
                            <p className="text-sm text-slate-600 mt-1">{notice.message}</p>
                            <p className="text-xs text-slate-400 text-right mt-2">{new Date(notice.createdAt).toLocaleDateString()}</p>
                        </div>
                    )) : (
                         <p className="text-sm text-slate-500 p-4 text-center">No new notifications.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
           <button onClick={handleSettings} className="mr-4 text-slate-500 hover:text-slate-700" title="Settings">
              <Cog6ToothIcon />
           </button>
          <div className="text-right mr-4">
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-sm text-slate-500">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
