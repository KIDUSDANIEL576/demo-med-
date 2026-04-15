
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { checkPlanAccess } from '../services/mockApi';

export const usePlanAccess = () => {
    const { user } = useAuth();
    const [accessCache, setAccessCache] = useState<Record<string, boolean>>({});
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

    // Helper to check if we already know the access level
    const hasAccess = useCallback((featureKey: string): boolean => {
        return accessCache[featureKey] === true;
    }, [accessCache]);

    const checkAccess = useCallback(async (featureKey: string) => {
        if (!user || accessCache[featureKey] !== undefined) return;
        
        setLoadingKeys(prev => new Set(prev).add(featureKey));
        
        try {
            const result = await checkPlanAccess(user, featureKey);
            setAccessCache(prev => ({ ...prev, [featureKey]: result }));
        } catch (error) {
            console.error(`Error checking access for ${featureKey}:`, error);
            setAccessCache(prev => ({ ...prev, [featureKey]: false }));
        } finally {
            setLoadingKeys(prev => {
                const next = new Set(prev);
                next.delete(featureKey);
                return next;
            });
        }
    }, [user, accessCache]);

    // Pre-load common keys on mount if user exists
    useEffect(() => {
        if (user) {
            ['sales_module', 'export_reports', 'prescription_builder', 'inventory_management', 'prescription_lookup', 'staff_management'].forEach(checkAccess);
        }
    }, [user]);

    return { hasAccess, checkAccess, loading: loadingKeys.size > 0 };
};
