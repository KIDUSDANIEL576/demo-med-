
import React, { useState } from 'react';
import { GiftIcon } from '../constants';

interface ReferralModalProps {
    referralLink: string;
    onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ referralLink, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                {/* Decorative Background */}
                <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative pt-10 px-8 pb-8 text-center">
                    <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 border-4 border-indigo-50">
                        <GiftIcon className="w-10 h-10 text-indigo-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Turn your connection into savings.</h2>
                    
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Share your unique referral link and get <span className="font-bold text-indigo-600">20% off for 2 months</span> each time someone subscribes—no limits, no hassle.
                    </p>

                    <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-3 border border-slate-200 mb-6">
                         <div className="flex-1 overflow-hidden">
                             <p className="text-sm font-mono text-slate-600 truncate text-left">{referralLink}</p>
                         </div>
                         <button 
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded-md font-bold text-sm transition-all shadow-sm ${copied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                         >
                            {copied ? 'Copied!' : 'Copy'}
                         </button>
                    </div>

                    <p className="text-xs text-slate-400">
                        * Discount applies automatically once the referred user completes their first payment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReferralModal;
