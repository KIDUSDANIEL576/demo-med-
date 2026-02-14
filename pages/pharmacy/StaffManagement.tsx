
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { getStaff, addStaff, updateStaff } from '../../services/mockApi';
import { User, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { UserPlusIcon, PencilIcon } from '../../constants';

const StaffManagement: React.FC = () => {
    const { user } = useAuth();
    const [staff, setStaff] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<User | null>(null);
    
    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.PHARMACIST);
    const [password, setPassword] = useState('');
    
    const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = () => {
        if (user?.pharmacyId) {
            getStaff(Number(user.pharmacyId)).then(setStaff);
        }
    }

    const handleOpenAdd = () => {
        setEditingStaff(null);
        setName('');
        setEmail('');
        setRole(UserRole.PHARMACIST);
        setPassword('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (staffMember: User) => {
        setEditingStaff(staffMember);
        setName(staffMember.name);
        setEmail(staffMember.email);
        setRole(staffMember.role);
        setPassword(''); // Leave blank unless changing
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.pharmacyId) return;

        try {
            if (editingStaff) {
                // Update Existing
                const updatedUser = await updateStaff(editingStaff.id, {
                    name,
                    email,
                    role,
                    password: password || undefined // Only send if changed
                });
                setStaff(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                if (password) {
                    setCreatedCredentials({ email: updatedUser.email, password: password });
                }
            } else {
                // Create New
                const result = await addStaff({
                    name,
                    email,
                    role,
                    pharmacyId: user.pharmacyId,
                    password
                });
                setCreatedCredentials({ email: result.user.email, password: result.password });
                setStaff(prev => [...prev, result.user]);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
        { key: 'lastLogin', header: 'Last Login' },
        { key: 'actions', header: 'Actions' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Staff Management</h1>
                <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                    <UserPlusIcon /> Add New Staff
                </button>
            </div>

            {createdCredentials && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">{editingStaff ? 'Credentials Updated! ' : 'Staff Created! '}</strong>
                    <span className="block sm:inline">Username: <strong>{createdCredentials.email}</strong> / Password: <strong>{createdCredentials.password}</strong></span>
                    <button onClick={() => setCreatedCredentials(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <span className="text-green-500">x</span>
                    </button>
                </div>
            )}

            <DataTable<User>
                columns={columns}
                data={staff}
                renderRow={(u) => (
                    <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === UserRole.PHARMACIST ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {u.role}
                            </span>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.lastLogin}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => handleOpenEdit(u)} className="text-primary hover:text-primary/80" title="Edit Credentials">
                                <PencilIcon />
                            </button>
                        </td>
                    </tr>
                )}
            />

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
                    <div className="bg-base-300 p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{editingStaff ? 'Edit Staff Credentials' : 'Add New Staff'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email (Username)</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Role</label>
                                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                                    <option value={UserRole.PHARMACIST}>Pharmacist</option>
                                    <option value={UserRole.SALES}>Sales Person</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    {editingStaff ? 'New Password (Optional)' : 'Password'}
                                </label>
                                <input 
                                    type="text" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    placeholder={editingStaff ? "Leave blank to keep current" : "Enter password"}
                                    required={!editingStaff}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                                />
                                {editingStaff && <p className="text-xs text-slate-500 mt-1">Enter a new password only if you wish to reset it.</p>}
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
                                    {editingStaff ? 'Update Staff' : 'Create Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
