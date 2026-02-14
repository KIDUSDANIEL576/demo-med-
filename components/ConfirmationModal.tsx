
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen, onClose, onConfirm, title, message, 
    confirmText = 'Delete', cancelText = 'Cancel', 
    isDangerous = true, isLoading = false
}) => {
    if (!isOpen) return null;

    // Handle ESC key to close
    React.useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, isLoading]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm border-t-4 border-slate-500 transform transition-all scale-100" style={{ borderTopColor: isDangerous ? '#ef4444' : '#10b981' }}>
                <h2 className="text-xl font-bold mb-2 text-slate-800">{title}</h2>
                <p className="text-slate-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isLoading}
                        className={`px-4 py-2 text-white rounded-md font-bold shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${isDangerous ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'} disabled:opacity-70`}
                    >
                        {isLoading && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
