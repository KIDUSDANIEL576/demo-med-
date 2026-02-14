
import React, { useState, useEffect, useCallback } from 'react';
import { getSystemVersions, getFeatureFlags, addSystemVersion, updateSystemVersion, deleteSystemVersion } from '../../services/mockApi';
import { SystemVersion, FeatureFlag } from '../../types';
import VersionCard from '../../components/VersionCard';
import FeatureToggleSwitch from '../../components/FeatureToggleSwitch';
import VersionModal from '../../components/VersionModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const SystemUpdates: React.FC = () => {
    const [versions, setVersions] = useState<SystemVersion[]>([]);
    const [features, setFeatures] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<SystemVersion | null>(null);
    
    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [versionToDelete, setVersionToDelete] = useState<SystemVersion | null>(null);

    const fetchVersions = useCallback(() => {
        getSystemVersions().then(versionsData => {
            setVersions(versionsData.sort((a, b) => new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime()));
        });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [versionsData, featuresData] = await Promise.all([
                getSystemVersions(),
                getFeatureFlags(),
            ]);
            setVersions(versionsData.sort((a, b) => new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime()));
            setFeatures(featuresData);
            setLoading(false);
        };
        fetchData();
    }, []);
    
    const handleCreate = () => {
        setSelectedVersion(null);
        setIsModalOpen(true);
    };

    const handleEdit = (version: SystemVersion) => {
        setSelectedVersion(version);
        setIsModalOpen(true);
    };

    const handleActivate = async (version: SystemVersion) => {
        if (window.confirm(`Are you sure you want to activate ${version.version_name}? This will broadcast the update to all users.`)) {
            await updateSystemVersion({ ...version, status: 'active' });
            fetchVersions();
        }
    };

    const handleDeactivate = async (version: SystemVersion) => {
        if (window.confirm(`Deactivate ${version.version_name}? It will be moved to archived/draft status.`)) {
            await updateSystemVersion({ ...version, status: 'archived' });
            fetchVersions();
        }
    };

    const handleDeleteClick = (version: SystemVersion) => {
        setVersionToDelete(version);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (versionToDelete) {
            await deleteSystemVersion(versionToDelete.id);
            setVersionToDelete(null);
            fetchVersions();
        }
    };

    const handleSave = async (versionData: Omit<SystemVersion, 'id'> | SystemVersion) => {
        if ('id' in versionData) {
            await updateSystemVersion(versionData);
        } else {
            await addSystemVersion(versionData);
        }
        fetchVersions();
        setIsModalOpen(false);
    };


    if (loading) {
        return <div>Loading system data...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">System Updates & Version Launch</h1>
                <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-bold shadow-md">
                    + Create New Version
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {versions.map(v => (
                    <VersionCard 
                        key={v.id} 
                        version={v} 
                        onManage={handleEdit} 
                        onActivate={handleActivate}
                        onDeactivate={handleDeactivate}
                        onDelete={handleDeleteClick}
                    />
                ))}
            </div>
            
            <div className="bg-base-300 shadow-lg rounded-lg p-6 animate-fade-in mt-8">
                <h2 className="text-xl font-semibold mb-4 text-slate-800">Feature Flags</h2>
                <div className="space-y-4">
                    {features.map(f => <FeatureToggleSwitch key={f.id} feature={f} />)}
                </div>
            </div>

            {isModalOpen && (
                <VersionModal
                    version={selectedVersion}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            <ConfirmationModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Version Draft"
                message={`Are you sure you want to delete ${versionToDelete?.version_name}? This action cannot be undone.`}
                confirmText="Delete Version"
            />
        </div>
    );
};

export default SystemUpdates;
