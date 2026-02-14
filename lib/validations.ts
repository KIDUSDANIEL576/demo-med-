import { z } from 'zod';
import { InventoryCategory } from '../types';

// Inventory Mutation Validation
export const InventoryItemSchema = z.object({
    medicineName: z.string().min(2, "Medicine name must be at least 2 characters").max(100),
    category: z.nativeEnum(InventoryCategory, { errorMap: () => ({ message: "Invalid category" }) }),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    expiryDate: z.string().refine((date) => new Date(date) > new Date(), {
        message: "Expiry date must be in the future",
    }),
    costPrice: z.number().positive("Cost price must be greater than 0"),
    price: z.number().positive("Selling price must be greater than 0"),
    batchNumber: z.string().min(1, "Batch number is required").regex(/^[A-Z0-9-]+$/, "Batch number must be alphanumeric"),
    brand: z.string().optional(),
    sku: z.string().min(3, "SKU too short"),
});

// Sales Mutation Validation
export const SaleItemSchema = z.object({
    itemId: z.number().int().positive(),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const ProcessSaleSchema = z.object({
    pharmacyId: z.number().int().positive(),
    soldBy: z.string().min(1, "Sales person name required"),
    items: z.array(SaleItemSchema).min(1, "At least one item required for sale"),
});

// Auth Validation
export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InventoryItemInput = z.infer<typeof InventoryItemSchema>;
export type ProcessSaleInput = z.infer<typeof ProcessSaleSchema>;
