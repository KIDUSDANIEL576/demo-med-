import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import FeedbackModal from './FeedbackModal';
import { Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const showFeedbackButton = user && (user.role === UserRole.PHARMACY_ADMIN || user.role === UserRole.DOCTOR);

  return (
    <div className="flex h-screen bg-[#FDFDFD]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FDFDFD] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-8 md:p-12 lg:p-16 max-w-[1600px] mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {showFeedbackButton && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setFeedbackModalOpen(true)}
          className="fixed bottom-12 right-12 bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl hover:bg-black transition-all z-30 flex items-center justify-center gap-3 group"
          title="Suggest a Feature"
        >
          <Lightbulb className="w-6 h-6 text-primary group-hover:animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest pr-2">Feedback</span>
        </motion.button>
      )}
      
      {isFeedbackModalOpen && <FeedbackModal onClose={() => setFeedbackModalOpen(false)} />}
    </div>
  );
};

export default Layout;
