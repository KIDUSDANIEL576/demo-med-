
import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/DataTable';
import { getPharmacies, addPharmacy, updatePharmacy, deletePharmacy, getUsers, adminResetUserPassword } from '../../services/mockApi';
import { Pharmacy, SubscriptionPlan, User, UserRole } from '../../types';
import { Building2, Plus, Pencil, Trash2, Key, Shield, Clock, Users, Search } from 'lucide-react';
import PharmacyModal from '../../components/PharmacyModal';
import CreateAdminModal from '../../components/CreateAdminModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';

const getPlanStatus = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Expired', color: 'bg-red-50 text-red-600 border-red-100' };
    if (diffDays <= 7) return { text: `Expires in ${diffDays}d`, color: 'bg-red-50 text-red-600 border-red-100' };
    if (diffDays <= 30) return { text: 'Active', color: 'bg-amber-50 text-amber-600 border-amber-100' };
    return { text: 'Active', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
};

const Pharmacies: React.FC = () => {
    const { user } = useAuth();
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCredentialsModalOpen, setCredentialsModalOpen] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [adminExistsForPharmacy, setAdminExistsForPharmacy] = useState<Set<number>>(new Set());
    
    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pharmacyToDelete, setPharmacyToDelete] = useState<Pharmacy | null>(null);

    const fetchPharmacies = useCallback(() => {
        getPharmacies().then(setPharmacies);
        getUsers().then(allUsers => {
            const pharmacyAdminIds = new Set<number>();
            allUsers.forEach(u => {
                if (u.role === UserRole.PHARMACY_ADMIN && u.pharmacyId) {
                    pharmacyAdminIds.add(Number(u.pharmacyId));
                }
            });
            setAdminExistsForPharmacy(pharmacyAdminIds);
        });
    }, []);

    useEffect(() => {
        fetchPharmacies();
    }, [fetchPharmacies]);

    const handleAdd = () => {
        setSelectedPharmacy(null);
        setIsModalOpen(true);
    };

    const handleEdit = (pharmacy: Pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (pharmacy: Pharmacy) => {
        setPharmacyToDelete(pharmacy);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (pharmacyToDelete && user) {
            setIsDeleting(true);
            try {
                await deletePharmacy(pharmacyToDelete.id, user);
                fetchPharmacies();
                setIsDeleteModalOpen(false);
                setPharmacyToDelete(null);
            } catch (err: any) {
                alert(err.message || "Failed to delete pharmacy.");
            } finally {
                setIsDeleting(false);
            }
        }
    };
    
    const handleResetPassword = async (pharmacyId: number, pharmacyName: string) => {
        const users = await getUsers();
        const adminUser = users.find(u => u.pharmacyId === pharmacyId && u.role === UserRole.PHARMACY_ADMIN);
        
        if (adminUser) {
            const newPassword = `MedIntelli_${Math.random().toString(36).substring(2, 8)}`;
            if (window.confirm(`Are you sure you want to reset the password for ${pharmacyName}'s admin (${adminUser.name})?`)) {
                await adminResetUserPassword(adminUser.id, newPassword);
                alert(`Password has been reset successfully.\n\nAdmin Email: ${adminUser.email}\nNew Password: ${newPassword}\n\nPlease share these credentials with the user.`);
            }
        } else {
            alert("No admin user found for this pharmacy. Please create one first.");
        }
    }

    const handleCreateCredentials = (pharmacy: Pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setCredentialsModalOpen(true);
    };

    const handleSave = (pharmacy: Omit<Pharmacy, 'id'> | Pharmacy) => {
        const promise = 'id' in pharmacy ? updatePharmacy(pharmacy) : addPharmacy(pharmacy as Omit<Pharmacy, 'id'>);
        promise.then(() => {
            fetchPharmacies();
            setIsModalOpen(false);
        });
    };
    
    const handleCredentialSave = () => {
        fetchPharmacies(); 
        setCredentialsModalOpen(false);
    }

    const columns = [
        { key: 'name', header: 'Pharmacy Entity' },
        { key: 'plan', header: 'Subscription' },
        { key: 'status', header: 'Status' },
        { key: 'staff', header: 'Staff' },
        { key: 'createdAt', header: 'Onboarding' },
        { key: 'actions', header: 'Actions' },
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <Building2 className="w-4 h-4" />
                        Network Infrastructure
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Pharmacy Management</h1>
                    <p className="text-slate-400 font-medium text-lg">Oversee and manage pharmacy partners across the global network.</p>
                </div>

                <button 
                    onClick={handleAdd} 
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 font-bold text-sm uppercase tracking-widest"
                >
                    <Plus className="w-5 h-5" />
                    Register Pharmacy
                </button>
            </div>

            <DataTable<Pharmacy>
                columns={columns}
                data={pharmacies}
                renderRow={(pharmacy) => {
                    const status = getPlanStatus(pharmacy.planExpiryDate);
                    const hasAdmin = adminExistsForPharmacy.has(pharmacy.id);
                    return (
                        <>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg">
                                        {pharmacy.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900">{pharmacy.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{pharmacy.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                    pharmacy.plan === SubscriptionPlan.PLATINUM ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                                }`}>
                                    {pharmacy.plan}
                                </span>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                                    {status.text}
                                </span>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-black">{pharmacy.staff}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-mono">{pharmacy.createdAt}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(pharmacy)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-primary transition-all hover:shadow-md" title="Edit">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => hasAdmin ? handleResetPassword(pharmacy.id, pharmacy.name) : handleCreateCredentials(pharmacy)} 
                                        className={`p-2 rounded-xl transition-all hover:shadow-md ${hasAdmin ? "text-slate-400 hover:text-amber-500" : "text-emerald-500 bg-emerald-50 animate-pulse"}`}
                                        title={hasAdmin ? "Reset Password" : "Create Login Credentials"}
                                    >
                                        <Key className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(pharmacy)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-all hover:shadow-md" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </>
                    )
                }}
            />

            {isModalOpen && (
                <PharmacyModal
                    pharmacy={selectedPharmacy}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
            {isCredentialsModalOpen && selectedPharmacy && (
                <CreateAdminModal
                    pharmacy={selectedPharmacy}
                    onClose={() => setCredentialsModalOpen(false)}
                    onSave={handleCredentialSave}
                />
            )}
            
            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Pharmacy?"
                message={`Are you sure you want to delete ${pharmacyToDelete?.name}? This will perform a soft delete and log the action to the security audit. This cannot be undone.`}
                confirmText="Confirm Delete"
                cancelText="Keep Pharmacy"
                isDangerous={true}
            />
        </div>
    );
};

export default Pharmacies;
