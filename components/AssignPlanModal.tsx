import React, { useState, useEffect } from 'react';
import { getPharmacies, getDoctors, updatePharmacy, updateDoctorProfile } from '../services/mockApi';
import { Pharmacy, User, SubscriptionPlan } from '../types';

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
                setUsers(pharmacies);
            } else if (userType === 'doctor') {
                const doctors = await getDoctors();
                setUsers(doctors);
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
            if (userType === 'pharmacy') {
                const pharmacy = selectedUser as Pharmacy;
                await updatePharmacy({ ...pharmacy, plan: selectedPlan });
            } else { // doctor
                const doctor = selectedUser as User;
                await updateDoctorProfile({ ...doctor, plan: selectedPlan });
            }
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
                    <div>
                        <h3 className="text-lg font-medium text-center mb-6">Assign a plan to a...</h3>
                        <div className="flex justify-center gap-6">
                            <button onClick={() => handleSelectUserType('pharmacy')} className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90">Pharmacy</button>
                            <button onClick={() => handleSelectUserType('doctor')} className="px-8 py-4 bg-secondary text-white rounded-lg hover:bg-secondary/90">Doctor</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                         <h3 className="text-lg font-medium mb-4">Select a {userType}</h3>
                         {loading ? <p>Loading...</p> : (
                            <select onChange={(e) => handleSelectUser(e.target.value)} defaultValue="" className="w-full p-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                                <option value="" disabled>-- Select a {userType} --</option>
                                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                         )}
                    </div>
                );
            case 3:
                return (
                    <div>
                         <h3 className="text-lg font-medium mb-4">Select a Plan for {selectedUser?.name}</h3>
                         <div className="flex flex-col gap-3">
                            {Object.values(SubscriptionPlan).map(plan => (
                                <button key={plan} onClick={() => handleSelectPlan(plan)} className="w-full text-left p-3 border rounded-lg hover:bg-base-200">
                                    {plan}
                                </button>
                            ))}
                         </div>
                    </div>
                );
            case 4:
                return (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Confirm Assignment</h3>
                        <p className="text-slate-600">
                            You are about to assign the <span className="font-bold text-primary">{selectedPlan}</span> plan
                            to <span className="font-bold text-primary">{selectedUser?.name}</span> ({userType}).
                        </p>
                         <div className="flex justify-center gap-4 mt-6">
                            <button onClick={() => setStep(3)} className="px-6 py-2 bg-gray-200 rounded">Back</button>
                            <button onClick={handleConfirm} disabled={loading} className="px-6 py-2 bg-primary text-white rounded disabled:bg-primary/70">
                                {loading ? 'Saving...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-lg min-h-[250px] relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">&times;</button>
                 <h2 className="text-2xl font-bold mb-6 text-center">Assign Plan (Step {step}/4)</h2>
                 {renderStep()}
            </div>
        </div>
    );
};

export default AssignPlanModal;