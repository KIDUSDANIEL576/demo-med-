import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import FeedbackModal from './FeedbackModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const showFeedbackButton = user && (user.role === UserRole.PHARMACY_ADMIN || user.role === UserRole.DOCTOR);

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-100 p-4 md:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
      {showFeedbackButton && (
        <button
          onClick={() => setFeedbackModalOpen(true)}
          className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-transform transform hover:scale-110 z-30 flex items-center justify-center text-2xl"
          title="Suggest a Feature"
        >
          💡
        </button>
      )}
      {isFeedbackModalOpen && <FeedbackModal onClose={() => setFeedbackModalOpen(false)} />}
    </div>
  );
};

export default Layout;