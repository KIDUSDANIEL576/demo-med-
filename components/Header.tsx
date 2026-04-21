
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { Bell, Settings, LogOut, Search, User, ChevronDown, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { notifications = [], unreadCount, readNoticeIds, markAllRead } = useNotification();

  const safeNotifications = notifications || [];

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
    setProfileOpen(false);
  }
  
  const handleOpenNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  }

  if (!user) return null;

  return (
    <header className="h-24 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
      <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 w-96 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search records, patients, or inventory..." 
          className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 placeholder:text-slate-400 w-full"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={handleOpenNotifications} 
            className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-primary hover:bg-white hover:shadow-lg transition-all relative ${unreadCount > 0 ? 'animate-pulse' : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-4 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl z-50 border border-slate-100 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter">Notifications</h3>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{unreadCount} New</span>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllRead();
                      }}
                      className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-primary transition-colors py-1 px-3 rounded-lg hover:bg-slate-50 uppercase tracking-widest"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {safeNotifications.length > 0 ? safeNotifications.slice().reverse().map(notice => (
                    <div key={notice.id} className={`p-4 hover:bg-slate-50 rounded-2xl transition-colors group relative ${!readNoticeIds.has(notice.id) ? 'bg-primary/5' : ''}`}>
                      {!readNoticeIds.has(notice.id) && (
                        <span className="absolute left-2 top-6 w-1 h-8 bg-primary rounded-full" />
                      )}
                      <p className={`font-bold text-sm transition-colors ${!readNoticeIds.has(notice.id) ? 'text-primary' : 'text-slate-800'}`}>{notice.title}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notice.message}</p>
                      <p className="text-[10px] font-bold text-slate-300 uppercase mt-3 tracking-widest">{new Date(notice.createdAt).toLocaleDateString()}</p>
                    </div>
                  )) : (
                    <div className="p-12 text-center space-y-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                        <Bell className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">All caught up</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all group"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-primary/20 transition-colors">
              <User className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl z-50 border border-slate-100 overflow-hidden p-2"
              >
                <button 
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-slate-600 font-bold text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </button>
                <div className="h-px bg-slate-50 my-1 mx-2" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 hover:bg-red-50 rounded-2xl transition-colors text-red-500 font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
