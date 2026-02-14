
import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/DataTable';
import { getDoctors, addDoctor, updateDoctorProfile, deleteDoctor } from '../../services/mockApi';
import { User } from '../../types';
import { UserPlusIcon, PencilIcon, TrashIcon, KeyIcon } from '../../constants';
import DoctorModal from '../../components/DoctorModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';

const Doctors: React.FC = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
    
    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<User | null>(null);

    const fetchDoctors = useCallback(() => {
        getDoctors().then(setDoctors);
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleAdd = () => {
        setSelectedDoctor(null);
        setIsModalOpen(true);
    };

    const handleEdit = (doctor: User) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (doctor: User) => {
        setDoctorToDelete(doctor);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (doctorToDelete && user) {
            setIsDeleting(true);
            try {
                await deleteDoctor(doctorToDelete.id, user);
                setDoctorToDelete(null);
                setIsDeleteModalOpen(false);
                fetchDoctors();
            } catch (err: any) {
                alert(err.message || "Failed to delete doctor profile.");
            } finally {
                setIsDeleting(false);
            }
        }
    };
    
    const handleResetPassword = (name: string) => {
        const defaultPassword = `MedIntelli_${Math.random().toString(36).substring(2, 8)}`;
        alert(`Password for ${name} has been reset to: ${defaultPassword}\n\nPlease provide these credentials to the user. They can change it in their profile.`);
    }

    const handleSave = (doctorData: Partial<User>) => {
        const promise = doctorData.id 
            ? updateDoctorProfile(doctorData as User) 
            : addDoctor(doctorData);

        promise.then(() => {
            fetchDoctors();
            setIsModalOpen(false);
        });
    };

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'clinic', header: 'Clinic'},
        { key: 'phone', header: 'Phone' },
        { key: 'createdAt', header: 'Date Added' },
        { key: 'lastLogin', header: 'Last Login' },
        { key: 'actions', header: 'Actions' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manage Doctors</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold shadow-md">
                    <UserPlusIcon /> Add New Doctor
                </button>
            </div>
            <DataTable<User>
                columns={columns}
                data={doctors}
                renderRow={(doctor) => (
                    <tr key={doctor.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-slate-900">{doctor.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{doctor.email}</div>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-bold">{doctor.clinicName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-bold">{doctor.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{doctor.createdAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{doctor.lastLogin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleEdit(doctor)} className="text-primary hover:text-primary/80 transition-transform active:scale-95" title="Edit"><PencilIcon /></button>
                                <button onClick={() => handleResetPassword(doctor.name)} className="text-amber-600 hover:text-amber-800 transition-transform active:scale-95" title="Reset Password"><KeyIcon /></button>
                                <button onClick={() => handleDeleteClick(doctor)} className="text-red-600 hover:text-red-800 transition-transform active:scale-95" title="Delete"><TrashIcon /></button>
                            </div>
                        </td>
                    </tr>
                )}
            />
            {isModalOpen && (
                <DoctorModal
                    doctor={selectedDoctor}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
            
            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Doctor Profile?"
                message={`Are you sure you want to delete Dr. ${doctorToDelete?.name}? This profile will be archived (soft deleted) and all clinical history will be retained but inaccessible for new prescriptions.`}
                confirmText="Confirm Delete"
                cancelText="Keep Profile"
                isDangerous={true}
            />
        </div>
    );
};

export default Doctors;
