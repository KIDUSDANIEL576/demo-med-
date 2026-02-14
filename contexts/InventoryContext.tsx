
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { InventoryItem, Prescription } from '../types';
import { getPharmacyInventory, processPrescriptionSale as apiProcessSale, processManualSale as apiProcessManualSale } from '../services/mockApi';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  inventory: InventoryItem[];
  loading: boolean;
  fetchInventory: () => void;
  processSale: (prescription: Prescription) => Promise<{ success: boolean; message: string; }>;
  processManualSale: (items: { itemId: number, quantity: number }[], soldBy: string) => Promise<{ success: boolean; message: string; }>;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = useCallback(() => {
        if (user?.pharmacyId) {
            setLoading(true);
            getPharmacyInventory(Number(user.pharmacyId))
                .then(setInventory)
                .finally(() => setLoading(false));
        }
    }, [user?.pharmacyId]);

    useEffect(() => {
        fetchInventory();
    },[fetchInventory]);

    const processSale = async (prescription: Prescription): Promise<{ success: boolean; message: string; }> => {
        if (!user?.pharmacyId) {
            return { success: false, message: 'User not associated with a pharmacy.' };
        }
        
        const result = await apiProcessSale(prescription, Number(user.pharmacyId));

        if (result.success && 'updatedItem' in result) {
            const updatedItem = (result as any).updatedItem as InventoryItem;
            // Update the state locally for real-time feel
            setInventory(prevInventory => 
                prevInventory.map(item => 
                    item.id === updatedItem.id ? updatedItem : item
                )
            );
        }
        return { success: result.success, message: result.message };
    };

    const processManualSale = async (items: { itemId: number, quantity: number }[], soldBy: string): Promise<{ success: boolean; message: string; }> => {
        if (!user?.pharmacyId) {
            return { success: false, message: 'User not associated with a pharmacy.' };
        }
        // Fix: Removed pharmacyId as apiProcessManualSale takes (items, soldBy)
        const result = await apiProcessManualSale(items, soldBy);
        if (result.success) {
            fetchInventory(); // Refresh inventory data
        }
        return result;
    };

    return (
        <InventoryContext.Provider value={{ inventory, loading, fetchInventory, processSale, processManualSale }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
