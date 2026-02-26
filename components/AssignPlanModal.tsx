import React, { useState, useEffect } from 'react';
import { getPharmacies, getDoctors, updatePharmacy, updateDoctorProfile, assignPlanToUser } from '../services/mockApi';
import { Pharmacy, User, SubscriptionPlan } from '../types';

import { Pill, Stethoscope, ChevronRight, ShieldCheck, XIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface AssignPlanModalProps {
    onClose: () => void;
}

const AssignPlanModal: React.FC<AssignPlanModalProps> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState<'pharmacy' | 'doctor' | null>(null);
    const [users, setUsers] = useState<(Pharmacy | User)[]>([]);
    const [selectedUser, setSelectedUser] = useState<Pharmacy | User | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            if (userType === 'pharmacy') {
                const pharmacies = await getPharmacies();
                setUsers(pharmacies.filter(p => !p.isDeleted));
            } else if (userType === 'doctor') {
                const doctors = await getDoctors();
                setUsers(doctors.filter(u => !u.isDeleted));
            }
            setLoading(false);
        };
        if (userType) {
            fetchUsers();
        }
    }, [userType]);

    const handleSelectUserType = (type: 'pharmacy' | 'doctor') => {
        setUserType(type);
        setStep(2);
    };

    const handleSelectUser = (userId: string) => {
        const user = users.find(u => String(u.id) === userId);
        if (user) {
            setSelectedUser(user);
            setStep(3);
        }
    };
    
    const handleSelectPlan = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setStep(4);
    };

    const handleConfirm = async () => {
        if (!selectedUser || !selectedPlan || !userType) return;
        
        setLoading(true);
        try {
            await assignPlanToUser(String(selectedUser.id), userType, selectedPlan);
            alert(`Successfully assigned ${selectedPlan} plan to ${selectedUser.name}.`);
            onClose();
        } catch (error) {
            console.error("Failed to update plan:", error);
            alert("An error occurred while updating the plan.");
        }
        setLoading(false);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8">
                        <h3 className="text-xl font-black text-slate-800 text-center uppercase tracking-tighter">Assign a plan to a...</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <button 
                                onClick={() => handleSelectUserType('pharmacy')} 
                                className="group p-8 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all flex flex-col items-center gap-4"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Pill className="w-8 h-8" />
                                </div>
                                <span className="font-black text-xs uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">Pharmacy</span>
                            </button>
                            <button 
                                onClick={() => handleSelectUserType('doctor')} 
                                className="group p-8 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-violet-600 hover:shadow-2xl hover:shadow-violet-600/10 transition-all flex flex-col items-center gap-4"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                                    <Stethoscope className="w-8 h-8" />
                                </div>
                                <span className="font-black text-xs uppercase tracking-widest text-slate-500 group-hover:text-violet-600">Doctor</span>
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                         <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Select a {userType}</h3>
                         {loading ? (
                            <div className="h-20 flex items-center justify-center font-mono animate-pulse text-slate-400">Fetching entities...</div>
                         ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                {users.map(user => (
                                    <button 
                                        key={user.id} 
                                        onClick={() => handleSelectUser(String(user.id))}
                                        className="w-full text-left p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 uppercase tracking-tight">{user.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {user.id}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                                {users.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">No {userType}s found.</p>}
                            </div>
                         )}
                         <button onClick={() => setStep(1)} className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600">Back to Step 1</button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                         <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Select a Plan for {selectedUser?.name}</h3>
                         <div className="grid grid-cols-1 gap-3">
                            {Object.values(SubscriptionPlan).filter(p => !p.startsWith('Patient')).map(plan => (
                                <button 
                                    key={plan} 
                                    onClick={() => handleSelectPlan(plan)} 
                                    className="w-full text-left p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-between group"
                                >
                                    <span className="font-black text-slate-800 uppercase tracking-tighter">{plan}</span>
                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </button>
                            ))}
                         </div>
                         <button onClick={() => setStep(2)} className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600">Back to Step 2</button>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 text-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-600">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Confirm Assignment</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                You are about to assign the <span className="font-black text-indigo-600 uppercase tracking-tighter">{selectedPlan}</span> plan
                                to <span className="font-black text-slate-900 uppercase tracking-tighter">{selectedUser?.name}</span> ({userType}).
                            </p>
                        </div>
                         <div className="flex flex-col gap-3 mt-6">
                            <button 
                                onClick={handleConfirm} 
                                disabled={loading} 
                                className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase rounded-2xl hover:bg-black disabled:bg-slate-400 transition-all shadow-xl shadow-slate-900/20"
                            >
                                {loading ? 'Processing...' : 'Confirm Assignment'}
                            </button>
                            <button onClick={() => setStep(3)} className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600">Back to Step 3</button>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative overflow-hidden"
            >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16" />
                 <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors">
                    <XIcon className="w-8 h-8" />
                 </button>
                 
                 <div className="mb-8">
                    <div className="flex gap-1.5 mb-2">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step {step} of 4</p>
                 </div>

                 {renderStep()}
            </motion.div>
        </div>
    );
};

export default AssignPlanModal;
