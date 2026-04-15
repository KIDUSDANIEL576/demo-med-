
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { InventoryItem, Prescription, Medicine, InventoryBatch, StockMovement } from '../types';
import { 
    getPharmacyInventory, 
    processPrescriptionSale as apiProcessSale, 
    processManualSale as apiProcessManualSale,
    getMedicines,
    getInventoryBatches,
    getStockMovements,
    addMedicine as apiAddMedicine,
    addInventoryBatch as apiAddBatch,
    recordStockMovement as apiRecordMovement
} from '../services/mockApi';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  inventory: InventoryItem[];
  medicines: Medicine[];
  batches: InventoryBatch[];
  movements: StockMovement[];
  loading: boolean;
  fetchInventory: () => void;
  fetchMedicines: () => void;
  fetchBatches: () => void;
  fetchMovements: () => void;
  addMedicine: (m: Omit<Medicine, 'id'>) => Promise<Medicine>;
  addBatch: (b: Omit<InventoryBatch, 'id' | 'createdAt'>) => Promise<InventoryBatch>;
  recordMovement: (m: Omit<StockMovement, 'id' | 'createdAt'>) => Promise<StockMovement>;
  processSale: (prescription: Prescription) => Promise<{ success: boolean; message: string; }>;
  processManualSale: (items: { itemId: number, quantity: number }[], soldBy: string) => Promise<{ success: boolean; message: string; }>;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [batches, setBatches] = useState<InventoryBatch[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = useCallback(() => {
        if (user?.pharmacyId) {
            setLoading(true);
            getPharmacyInventory(Number(user.pharmacyId))
                .then(setInventory)
                .finally(() => setLoading(false));
        }
    }, [user?.pharmacyId]);

    const fetchMedicines = useCallback(() => {
        getMedicines().then(setMedicines);
    }, []);

    const fetchBatches = useCallback(() => {
        if (user?.pharmacyId) {
            getInventoryBatches(user.pharmacyId).then(setBatches);
        }
    }, [user?.pharmacyId]);

    const fetchMovements = useCallback(() => {
        if (user?.pharmacyId) {
            getStockMovements(user.pharmacyId).then(setMovements);
        }
    }, [user?.pharmacyId]);

    useEffect(() => {
        fetchInventory();
        fetchMedicines();
        fetchBatches();
        fetchMovements();
    }, [fetchInventory, fetchMedicines, fetchBatches, fetchMovements]);

    const addMedicine = useCallback(async (m: Omit<Medicine, 'id'>) => {
        const newMed = await apiAddMedicine(m);
        setMedicines(prev => [...prev, newMed]);
        return newMed;
    }, []);

    const addBatch = useCallback(async (b: Omit<InventoryBatch, 'id' | 'createdAt'>) => {
        const newBatch = await apiAddBatch(b);
        setBatches(prev => [...prev, newBatch]);
        fetchInventory(); // Refresh derived inventory
        return newBatch;
    }, [fetchInventory]);

    const recordMovement = useCallback(async (m: Omit<StockMovement, 'id' | 'createdAt'>) => {
        const newMovement = await apiRecordMovement(m);
        setMovements(prev => [...prev, newMovement]);
        fetchInventory(); // Refresh derived inventory
        fetchBatches(); // Refresh batches
        return newMovement;
    }, [fetchInventory, fetchBatches]);

    const processSale = useCallback(async (prescription: Prescription): Promise<{ success: boolean; message: string; }> => {
        if (!user?.pharmacyId) {
            return { success: false, message: 'User not associated with a pharmacy.' };
        }
        
        const result = await apiProcessSale(prescription, Number(user.pharmacyId));

        if (result.success) {
            fetchInventory();
            fetchBatches();
            fetchMovements();
        }
        return { success: result.success, message: result.message };
    }, [user?.pharmacyId, fetchInventory, fetchBatches, fetchMovements]);

    const processManualSale = useCallback(async (items: { itemId: number, quantity: number }[], soldBy: string): Promise<{ success: boolean; message: string; }> => {
        if (!user?.pharmacyId) {
            return { success: false, message: 'User not associated with a pharmacy.' };
        }
        const result = await apiProcessManualSale(items, soldBy);
        if (result.success) {
            fetchInventory();
            fetchBatches();
            fetchMovements();
        }
        return result;
    }, [user?.pharmacyId, fetchInventory, fetchBatches, fetchMovements]);

    const value = useMemo(() => ({ 
        inventory, medicines, batches, movements, loading, 
        fetchInventory, fetchMedicines, fetchBatches, fetchMovements,
        addMedicine, addBatch, recordMovement,
        processSale, processManualSale 
    }), [
        inventory, medicines, batches, movements, loading, 
        fetchInventory, fetchMedicines, fetchBatches, fetchMovements,
        addMedicine, addBatch, recordMovement,
        processSale, processManualSale
    ]);

    return (
        <InventoryContext.Provider value={value}>
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
