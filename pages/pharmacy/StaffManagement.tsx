
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { getStaff, addStaff, updateStaff } from '../../services/mockApi';
import { User, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { UserPlus, Pencil, Shield, Mail, Lock, CheckCircle2, X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
        setPassword(''); 
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.pharmacyId) return;

        try {
            if (editingStaff) {
                const updatedUser = await updateStaff(editingStaff.id, {
                    name,
                    email,
                    role,
                    password: password || undefined 
                });
                setStaff(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                if (password) {
                    setCreatedCredentials({ email: updatedUser.email, password: password });
                }
            } else {
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
        { key: 'name', header: 'Staff Member' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
        { key: 'lastLogin', header: 'Last Access' },
        { key: 'actions', header: 'Actions' },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                        <Users className="w-4 h-4" />
                        Human Resources
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Staff Directory</h1>
                    <p className="text-slate-400 font-medium text-lg">Manage permissions and credentials for your clinical team.</p>
                </div>

                <button 
                    onClick={handleOpenAdd} 
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 font-bold text-sm uppercase tracking-widest"
                >
                    <UserPlus className="w-5 h-5" />
                    Add New Staff
                </button>
            </div>

            <AnimatePresence>
                {createdCredentials && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-emerald-500 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">
                                        {editingStaff ? 'Credentials Updated' : 'Staff Member Created'}
                                    </p>
                                    <p className="text-lg font-bold">
                                        User: <span className="font-mono bg-white/10 px-2 py-1 rounded">{createdCredentials.email}</span> 
                                        <span className="mx-4 opacity-50">|</span>
                                        Pass: <span className="font-mono bg-white/10 px-2 py-1 rounded">{createdCredentials.password}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setCreatedCredentials(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DataTable<User>
                columns={columns}
                data={staff}
                renderRow={(u) => (
                    <>
                        <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black uppercase">
                                    {u.name.charAt(0)}
                                </div>
                                <span className="text-sm font-black text-slate-900">{u.name}</span>
                            </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-slate-500">{u.email}</td>
                        <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                u.role === UserRole.PHARMACIST ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-sky-50 text-sky-600 border border-sky-100'
                            }`}>
                                {u.role}
                            </span>
                        </td>
                         <td className="px-8 py-6 whitespace-nowrap text-xs font-mono text-slate-400">{u.lastLogin || 'Never'}</td>
                         <td className="px-8 py-6 whitespace-nowrap">
                            <button onClick={() => handleOpenEdit(u)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-primary transition-all hover:shadow-md">
                                <Pencil className="w-4 h-4" />
                            </button>
                        </td>
                    </>
                )}
            />

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-50 p-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20" />
                            
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                                <X className="w-8 h-8" />
                            </button>

                            <div className="text-center mb-10 space-y-4">
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
                                </h2>
                                <p className="text-slate-400 font-medium">Configure account details and access levels.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input 
                                            value={name} 
                                            onChange={e => setName(e.target.value)} 
                                            required 
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input 
                                            type="email" 
                                            value={email} 
                                            onChange={e => setEmail(e.target.value)} 
                                            required 
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Role & Permissions</label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <select 
                                            value={role} 
                                            onChange={e => setRole(e.target.value as UserRole)} 
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 appearance-none"
                                        >
                                            <option value={UserRole.PHARMACIST}>Pharmacist</option>
                                            <option value={UserRole.SALES}>Sales Associate</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                        {editingStaff ? 'New Password (Optional)' : 'Secure Password'}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input 
                                            type="text" 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            placeholder={editingStaff ? "••••••••" : "Enter password"}
                                            required={!editingStaff}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" 
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 uppercase text-xs tracking-widest"
                                    >
                                        {editingStaff ? 'Update Member' : 'Create Member'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffManagement;
