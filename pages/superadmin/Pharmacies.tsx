
import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/DataTable';
import { getPharmacies, addPharmacy, updatePharmacy, deletePharmacy, getUsers, adminResetUserPassword } from '../../services/mockApi';
import { Pharmacy, SubscriptionPlan, User, UserRole } from '../../types';
import { UserPlusIcon, PencilIcon, TrashIcon, KeyIcon } from '../../constants';
import PharmacyModal from '../../components/PharmacyModal';
import CreateAdminModal from '../../components/CreateAdminModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';

const getPlanStatus = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Expired', color: 'bg-red-200 text-red-800' };
    if (diffDays <= 7) return { text: `Expires in ${diffDays}d`, color: 'bg-red-200 text-red-800' };
    if (diffDays <= 30) return { text: 'Active', color: 'bg-amber-200 text-amber-800' };
    return { text: 'Active', color: 'bg-green-200 text-green-800' };
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
        fetchPharmacies(); // This re-fetches users as well
        setCredentialsModalOpen(false);
    }

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'plan', header: 'Plan' },
        { key: 'status', header: 'Status' },
        { key: 'staff', header: 'Staff' },
        { key: 'createdAt', header: 'Date Added' },
        { key: 'lastLogin', header: 'Last Login' },
        { key: 'actions', header: 'Actions' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manage Pharmacies</h1>
                <button type="button" onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold shadow-md">
                    <UserPlusIcon /> Add New Pharmacy
                </button>
            </div>
            <DataTable<Pharmacy>
                columns={columns}
                data={pharmacies}
                renderRow={(pharmacy) => {
                    const status = getPlanStatus(pharmacy.planExpiryDate);
                    const hasAdmin = adminExistsForPharmacy.has(pharmacy.id);
                    return (
                        <tr key={pharmacy.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-slate-900">{pharmacy.name}</div>
                                <div className="text-xs text-slate-500 font-medium">{pharmacy.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-bold">{pharmacy.plan}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-black uppercase rounded-full ${status.color}`}>
                                    {status.text}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center font-bold">{pharmacy.staff}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{pharmacy.createdAt}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{pharmacy.lastLogin}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => handleEdit(pharmacy)} className="text-primary hover:text-primary/80 transition-transform active:scale-95" title="Edit"><PencilIcon /></button>
                                    <button 
                                        type="button"
                                        onClick={() => hasAdmin ? handleResetPassword(pharmacy.id, pharmacy.name) : handleCreateCredentials(pharmacy)} 
                                        className={hasAdmin ? "text-amber-600 hover:text-amber-800 transition-transform active:scale-95" : "text-green-600 hover:text-green-800 animate-pulse"}
                                        title={hasAdmin ? "Reset Password" : "Create Login Credentials"}
                                    >
                                        <KeyIcon />
                                    </button>
                                    <button type="button" onClick={() => handleDeleteClick(pharmacy)} className="text-red-600 hover:text-red-800 transition-transform active:scale-95" title="Delete"><TrashIcon /></button>
                                </div>
                            </td>
                        </tr>
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
