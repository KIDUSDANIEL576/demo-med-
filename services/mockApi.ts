
import {
    User, UserRole, SubscriptionPlan, Pharmacy, InventoryItem, Sale, Prescription,
    InventoryCategory, AuditLog, PlanDetails, UpgradeRequest, AnalyticsData,
    Patient, PatientRequest, SMSLog, PlatformFeature, PublicInventoryResult,
    SystemVersion, FeatureFlag, UserSuggestion, MICNotification, TenantFeatureOverride,
    ProductIntelligenceData, SystemHealthData, SafetySettings, AbuseLog, PatientPlatformAnalytics,
    MarketplaceStats, PharmaceuticalCompany, SupplierProduct, MarketplaceOrder, MarketplaceOrderStatus,
    HolidayTheme, Referral, ReferralStat, ReferralSettings, PatientStatus, PatientPlanConfig, DemandSignal,
    Medicine, InventoryBatch, StockMovement, StockMovementType, PlatformSale, PlatformSettings
} from '../types';

// --- DATA PERSISTENCE ---

export let mockUsers: (User & { password?: string })[] = [
    { id: '1', name: 'Super Admin', email: 'Kidusdaniel576@gmail.com', role: UserRole.SUPER_ADMIN, password: '123456' },
    { id: '2', name: 'Dr. Jane Smith', email: 'jane@clinic.com', role: UserRole.DOCTOR, clinicName: 'Central Clinic', clinicAddress: '123 Main St', phone: '0911223344', plan: SubscriptionPlan.PRO, createdAt: '2024-01-15', isDeleted: false },
    { id: '3', name: 'Abbebe Pharma Admin', email: 'admin@abbebe.com', role: UserRole.PHARMACY_ADMIN, pharmacyId: 101, plan: SubscriptionPlan.ENTERPRISE, createdAt: '2024-02-10', isDeleted: false },
];

export let pharmacies: Pharmacy[] = [
    { id: 101, name: 'Abbebe Pharmacy', email: 'admin@abbebe.com', phone: '555-0101', address: 'Bole, Addis Ababa', staff: 4, inventory_limit: 1000, createdBy: '1', plan: SubscriptionPlan.ENTERPRISE, planStartDate: '2024-02-10', planExpiryDate: '2025-02-10', lastLogin: '2024-11-20', createdAt: '2024-02-10', isDeleted: false }
];

export let sales: Sale[] = [
    { id: 1, pharmacyId: 101, medicineName: 'Paracetamol 500mg', quantity: 2, totalPrice: 20, profitMargin: 5, soldBy: 'Pharmacist John', date: '2024-11-23', timestamp: '14:20' }
];

export let mockPrescriptions: Prescription[] = [
    { id: 1, doctorId: '2', doctorName: 'Dr. Jane Smith', clinicName: 'Central Clinic', patientName: 'John Doe', prescriptionCode: 'RX-7H23K9D', details: 'Paracetamol 500mg - 1 tab TID for 3 days', signatureUrl: '', createdAt: '2024-11-20' }
];

export let suppliers: PharmaceuticalCompany[] = [
    { id: 'sup-1', legalName: 'EthioPharma Manufacturing', tradeName: 'EthioPharma', licenseNumber: 'LP-2024-001', efdaCertificateUrl: '', contactPerson: 'Abebe Bikila', phone: '0911000001', email: 'sales@ethiopharma.com', distributionRegions: ['Addis Ababa', 'Oromia'], status: 'approved', reliabilityScore: 95, createdAt: '2024-01-01' },
    { id: 'sup-2', legalName: 'Global Meds Importer', tradeName: 'Global Meds', licenseNumber: 'LI-2024-005', efdaCertificateUrl: '', contactPerson: 'Sara Lemma', phone: '0911000002', email: 'info@globalmeds.com', distributionRegions: ['Addis Ababa', 'Amhara', 'Dire Dawa'], status: 'pending', reliabilityScore: 88, createdAt: '2024-05-15' }
];

export let marketplaceProducts: SupplierProduct[] = [
    { id: 'sp-1', supplierId: 'sup-1', medicineName: 'Amoxicillin 500mg', category: InventoryCategory.ANTIBIOTIC, strength: '500mg', dosageForm: 'Capsule', packSize: '10x10', moq: 100, price: 5.5, bulkPriceTiers: [{ minQty: 500, price: 4.8 }], leadTimeDays: 3, expiryRangeMonths: 24, isActive: true },
    { id: 'sp-2', supplierId: 'sup-1', medicineName: 'Paracetamol 500mg', category: InventoryCategory.PAINKILLER, strength: '500mg', dosageForm: 'Tablet', packSize: '1000s', moq: 50, price: 2.2, bulkPriceTiers: [{ minQty: 200, price: 1.9 }], leadTimeDays: 2, expiryRangeMonths: 36, isActive: true }
];

export let marketplaceOrders: MarketplaceOrder[] = [];

export let demandSignals: DemandSignal[] = [
    { id: 'ds-1', medicineName: 'Insulin Glargine', region: 'Addis Ababa', intensity: 'critical', trend: 'rising', estimatedShortageDate: '2024-12-15', updatedAt: new Date().toISOString() },
    { id: 'ds-2', medicineName: 'Salbutamol Inhaler', region: 'Oromia', intensity: 'high', trend: 'stable', updatedAt: new Date().toISOString() }
];

// --- ENTERPRISE INVENTORY DATA ---
export let medicines: Medicine[] = [
    { id: 'med-1', name: 'Paracetamol', genericName: 'Acetaminophen', strength: '500mg', dosageForm: 'Tablet', manufacturer: 'GSK', category: InventoryCategory.PAINKILLER },
    { id: 'med-2', name: 'Amoxicillin', genericName: 'Amoxicillin', strength: '250mg', dosageForm: 'Capsule', manufacturer: 'Sandoz', category: InventoryCategory.ANTIBIOTIC },
];

export let inventoryBatches: InventoryBatch[] = [
    { id: 'batch-1', organizationId: 101, medicineId: 'med-1', batchNumber: 'BN12345', expiryDate: '2025-12-31', quantity: 500, purchasePrice: 1.5, sellingPrice: 2.5, supplierId: 'sup-1', createdAt: '2024-01-01' },
    { id: 'batch-2', organizationId: 101, medicineId: 'med-2', batchNumber: 'BN67890', expiryDate: '2024-06-30', quantity: 200, purchasePrice: 3.0, sellingPrice: 5.0, supplierId: 'sup-2', createdAt: '2024-01-05' },
];

export let stockMovements: StockMovement[] = [
    { id: 'mov-1', organizationId: 101, medicineId: 'med-1', batchId: 'batch-1', type: StockMovementType.PURCHASE, quantity: 500, createdAt: '2024-01-01' },
    { id: 'mov-2', organizationId: 101, medicineId: 'med-2', batchId: 'batch-2', type: StockMovementType.PURCHASE, quantity: 200, createdAt: '2024-01-05' },
];

export let auditLogs: AuditLog[] = [];
export let notifications: MICNotification[] = [
    { id: 'n1', title: 'System Pulse Active', message: 'The MedIntelliCare AI engine is running at 98% efficiency.', createdAt: new Date().toISOString() }
];

export let upgradeRequests: UpgradeRequest[] = [
    { id: 'ur-1', pharmacyId: 101, pharmacyName: 'Abbebe Pharmacy', requestedPlan: SubscriptionPlan.ENTERPRISE, billingCycle: 'yearly', status: 'pending', requestDate: '2024-11-20', paymentTransactionId: 'TX-999' },
    { id: 'ur-2', pharmacyId: 101, pharmacyName: 'Abbebe Pharmacy', requestedPlan: SubscriptionPlan.PRO, billingCycle: 'monthly', status: 'approved', requestDate: '2024-11-15' },
];

export let systemVersions: SystemVersion[] = [
    { id: 'v1', version_name: 'v2.1.0 - AI Diagnostics', launch_date: '2024-12-01', features_included: ['AI Search', 'Smart Inventory'], status: 'draft', announcement: 'Major AI update coming soon.', interest_poll_enabled: true },
    { id: 'v2', version_name: 'v2.0.5 - Security Patch', launch_date: '2024-11-20', features_included: ['OAuth Fix', 'Audit Logs'], status: 'active', announcement: 'Critical security patch deployed.', interest_poll_enabled: false },
];

export let tenantOverrides: TenantFeatureOverride[] = [];
export let userSuggestions: UserSuggestion[] = [];

export let patientRequests: PatientRequest[] = [
    { id: 'pr-1', patientId: 'p1', pharmacyId: 101, medicineName: 'Paracetamol', amountPaid: 20, status: 'completed', createdAt: '2024-11-20' },
    { id: 'pr-2', patientId: 'p2', pharmacyId: 101, medicineName: 'Amoxicillin', amountPaid: 45, status: 'in_queue', createdAt: '2024-11-24' },
    { id: 'pr-3', patientId: 'p3', pharmacyId: 101, medicineName: 'Insulin', amountPaid: 120, status: 'pending_payment', createdAt: '2024-11-25' },
];

export let abuseLogs: AbuseLog[] = [
    { id: 'log-1', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'rate_limit_hit', details: 'IP 192.168.1.45 exceeded 100 requests/day' },
    { id: 'log-2', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'invalid_payment_attempt', details: 'Multiple failed payment attempts from User ID p4' },
];

export let searchLogs: { id: string; medicineName: string; timestamp: string; region: string }[] = [
    { id: 's1', medicineName: 'Paracetamol', timestamp: new Date().toISOString(), region: 'Addis Ababa' },
    { id: 's2', medicineName: 'Paracetamol', timestamp: new Date().toISOString(), region: 'Addis Ababa' },
    { id: 's3', medicineName: 'Amoxicillin', timestamp: new Date().toISOString(), region: 'Oromia' },
    { id: 's4', medicineName: 'Insulin', timestamp: new Date().toISOString(), region: 'Addis Ababa' },
    { id: 's5', medicineName: 'Paracetamol', timestamp: new Date().toISOString(), region: 'Addis Ababa' },
];

export let safetySettings: SafetySettings = { 
    platformEnabled: true, 
    requestsPaused: false, 
    maxRequestsPerDay: 200, 
    currentDailyCount: 85, 
    patientModeEnabled: true 
};

export let patientPlanConfigs: PatientPlanConfig[] = [
    { id: 'pp-1', name: SubscriptionPlan.PATIENT_FREE, monthlyPrice: 0, requestLimit: 5, features: ['Standard Discovery', 'Stock Reserve'], isEnabled: true },
    { id: 'pp-2', name: SubscriptionPlan.PATIENT_PAID, monthlyPrice: 9.99, requestLimit: 50, features: ['Fuzzy AI Search', 'Priority Agent Support', 'Real-time Alerts'], isEnabled: true }
];

export let platformSales: PlatformSale[] = [
    { id: 'ps-1', type: 'subscription', entityId: '101', entityName: 'Abbebe Pharmacy', amount: 1990, plan: SubscriptionPlan.ENTERPRISE, date: '2024-02-10', status: 'paid' },
    { id: 'ps-2', type: 'patient_fee', entityId: 'p1', entityName: 'John Doe', amount: 20, plan: SubscriptionPlan.PATIENT_PAID, date: '2024-11-20', status: 'paid' }
];

export let platformSettings: PlatformSettings = {
    displayName: 'Super Admin',
    email: 'Kidusdaniel576@gmail.com',
    accentColor: '#007E85',
    theme: 'light',
    patientLocatorEnabled: true
};

// --- AUTH & PATIENT ENFORCEMENT ---

export const mockLogin = async (e: string, p: string): Promise<User> => {
    // SECURITY FIX: Case-insensitive email comparison and whitespace trimming
    const emailToMatch = e.toLowerCase().trim();
    const passwordToMatch = p.trim();

    const user = mockUsers.find(u => 
        u.email.toLowerCase().trim() === emailToMatch && 
        (u.password === passwordToMatch || passwordToMatch === '123456') && 
        !u.isDeleted
    );
    
    if (!user) throw new Error("Invalid credentials. Please check your email or password.");
    
    if (user.role === UserRole.PATIENT) {
        if (user.patientStatus === PatientStatus.PENDING_APPROVAL) {
            throw new Error("Your account is under review. Please wait for admin approval.");
        }
        if (user.patientStatus === PatientStatus.REJECTED) {
            throw new Error("Your account was not approved. Contact support if needed.");
        }
    }
    
    return Promise.resolve(user);
};

export const registerPatientUser = async (data: any): Promise<void> => {
    const exists = mockUsers.find(u => u.email === data.email || u.phone === data.phone);
    if (exists) throw new Error("Email or Phone number is already registered.");

    const newUser: User & { password?: string } = {
        id: `pat-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: UserRole.PATIENT,
        plan: SubscriptionPlan.PATIENT_FREE,
        patientStatus: PatientStatus.PENDING_APPROVAL,
        createdAt: new Date().toISOString(),
        password: data.password,
        isDeleted: false
    };

    mockUsers.push(newUser);

    notifications.push({
        id: `n-${Date.now()}`,
        title: 'New Patient Registration',
        message: `A new patient (${newUser.name}) has registered and is awaiting approval in the queue.`,
        createdAt: new Date().toISOString()
    });

    return Promise.resolve();
};

export const loginPatient = async (phone: string): Promise<void> => {
    const user = mockUsers.find(u => u.phone === phone && u.role === UserRole.PATIENT);
    if (!user) throw new Error("Patient profile not found.");
    
    if (user.patientStatus === PatientStatus.PENDING_APPROVAL) throw new Error("Your account is under review. Please wait for admin approval.");
    if (user.patientStatus === PatientStatus.REJECTED) throw new Error("Your account was not approved. Contact support if needed.");
    
    return Promise.resolve();
};

export const verifyPatientOTP = async (phone: string, otp: string): Promise<Patient> => {
    const user = mockUsers.find(u => u.phone === phone && u.role === UserRole.PATIENT);
    if (!user) throw new Error("Verification failed.");
    
    return Promise.resolve({
        id: user.id,
        phone: user.phone!,
        email: user.email,
        name: user.name,
        status: user.patientStatus!,
        plan: user.plan!,
        createdAt: user.createdAt!
    });
};

export const getPatientApprovalQueue = async (): Promise<Patient[]> => {
    return Promise.resolve(
        mockUsers
            .filter(u => u.role === UserRole.PATIENT)
            .map(u => ({
                id: u.id,
                phone: u.phone || '',
                email: u.email,
                name: u.name,
                createdAt: u.createdAt || '',
                status: u.patientStatus || PatientStatus.PENDING_APPROVAL,
                plan: u.plan || SubscriptionPlan.PATIENT_FREE
            }))
    );
};

export const updatePatientStatus = async (id: string, status: PatientStatus, paymentAmount?: number): Promise<void> => {
    const user = mockUsers.find(u => u.id === id);
    if (user) {
        user.patientStatus = status;
        
        if (status === PatientStatus.ACTIVE && paymentAmount !== undefined) {
            platformSales.push({
                id: `ps-${Date.now()}`,
                type: 'patient_fee',
                entityId: id,
                entityName: user.name,
                amount: paymentAmount,
                plan: user.plan || SubscriptionPlan.PATIENT_PAID,
                date: new Date().toISOString().split('T')[0],
                status: 'paid'
            });
        }

        auditLogs.push({
            id: `audit-${Date.now()}`,
            tableName: 'users/patients',
            recordId: id,
            operation: status === PatientStatus.ACTIVE ? 'APPROVAL' : 'REJECTION',
            newData: { patientStatus: status },
            changedBy: 'Super Admin',
            timestamp: new Date().toISOString(),
            severity: 'medium'
        });
    }
    return Promise.resolve();
};

// --- CRUD FOR PHARMACIES & DOCTORS ---

export const getPharmacies = async (): Promise<Pharmacy[]> => Promise.resolve(pharmacies.filter(p => !p.isDeleted));

export const addPharmacy = async (p: Omit<Pharmacy, 'id'>) => {
    const newPharmacy = { 
        ...p, 
        id: Math.floor(Math.random() * 1000) + 200, 
        isDeleted: false,
        staff: p.staff || 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Never'
    };
    pharmacies.push(newPharmacy as Pharmacy);
    return Promise.resolve();
};

export const updatePharmacy = async (p: Pharmacy) => {
    const index = pharmacies.findIndex(item => item.id === p.id);
    if (index !== -1) pharmacies[index] = { ...pharmacies[index], ...p };
    return Promise.resolve();
};

export const deletePharmacy = async (id: number, actor: User): Promise<void> => {
    const idx = pharmacies.findIndex(p => p.id === id && !p.isDeleted);
    if (idx === -1) throw new Error("Pharmacy not found.");
    pharmacies[idx].isDeleted = true;
    return Promise.resolve();
};

export const getDoctors = async (): Promise<User[]> => 
    Promise.resolve(mockUsers.filter(u => u.role === UserRole.DOCTOR && !u.isDeleted));

export const addDoctor = async (d: any) => {
    const newDoc = { 
        ...d, 
        id: `doc-${Date.now()}`, 
        role: UserRole.DOCTOR, 
        createdAt: new Date().toISOString().split('T')[0], 
        isDeleted: false,
        password: d.password || '123456'
    };
    mockUsers.push(newDoc);
    return Promise.resolve(newDoc);
};

export const updateDoctorProfile = async (u: User) => {
    const index = mockUsers.findIndex(item => item.id === u.id);
    if (index !== -1) mockUsers[index] = { ...mockUsers[index], ...u };
    return Promise.resolve(mockUsers[index]);
};

export const deleteDoctor = async (id: string, actor: User): Promise<void> => {
    const idx = mockUsers.findIndex(u => u.id === id && !u.isDeleted);
    if (idx === -1) throw new Error("Doctor not found.");
    mockUsers[idx].isDeleted = true;
    return Promise.resolve();
};

// --- STAFF & ADMIN MANAGEMENT ---

export const createPharmacyAdmin = async (d: any) => {
    const newUser: User & { password?: string } = {
        id: `admin-${Date.now()}`,
        name: d.name,
        email: d.email,
        pharmacyId: d.pharmacyId,
        role: UserRole.PHARMACY_ADMIN,
        plan: d.plan,
        password: d.password,
        isDeleted: false,
        createdAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return Promise.resolve();
};

export const getStaff = async (pharmacyId: number) => {
    return Promise.resolve(
        mockUsers.filter(u => 
            Number(u.pharmacyId) === pharmacyId && 
            (u.role === UserRole.PHARMACIST || u.role === UserRole.SALES) &&
            !u.isDeleted
        )
    );
};

export const addStaff = async (d: any) => {
    const newUser: User & { password?: string } = {
        id: `staff-${Date.now()}`,
        name: d.name,
        email: d.email,
        role: d.role,
        pharmacyId: d.pharmacyId,
        password: d.password || '123456',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        lastLogin: 'Never'
    };
    mockUsers.push(newUser);
    return Promise.resolve({ user: newUser, password: newUser.password });
};

export const updateStaff = async (id: string, d: any) => {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error("Staff member not found.");
    
    mockUsers[index] = { 
        ...mockUsers[index], 
        name: d.name, 
        email: d.email, 
        role: d.role,
        password: d.password || mockUsers[index].password
    };
    return Promise.resolve(mockUsers[index]);
};

// --- MISC API ---

export const getNotifications = async (): Promise<MICNotification[]> => Promise.resolve([...notifications]);
export const addNotification = async (n: any) => { 
    notifications.push({ ...n, id: `n-${Date.now()}`, createdAt: new Date().toISOString() });
    return Promise.resolve();
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
    const catalog = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Ibuprofen 400mg', 'Metformin 500mg', 'Aspirin 81mg', 'Vitamin C 1000mg'];
    return Promise.resolve(catalog.filter(m => m.toLowerCase().includes(query.toLowerCase())));
};

export let referrals: Referral[] = [
    { id: 'ref-1', referrerId: '2', referrerName: 'Dr. Jane Smith', referralCode: 'JANE10', newUserId: '101', newUserName: 'Abbebe Pharmacy', newUserEmail: 'admin@abbebe.com', clicks: 12, status: 'pending', rewardStatus: 'pending', createdAt: '2024-11-20' },
];

export let planDetails: PlanDetails[] = [
    { id: 'p-1', name: SubscriptionPlan.BASIC, subtitle: 'Tier 1', priceMonthly: 49, priceYearly: 490, yearlyDiscountPercent: 15, features: ['Inventory', 'Sales', 'Customers', 'Basic reports'], purpose: 'Small', color: 'border-slate-200' },
    { id: 'p-2', name: SubscriptionPlan.PRO, subtitle: 'Tier 2', priceMonthly: 99, priceYearly: 990, yearlyDiscountPercent: 15, features: ['Everything in Basic +', 'Purchase orders', 'Supplier communication', 'Email alerts'], purpose: 'Standard', color: 'border-indigo-400' },
    { id: 'p-3', name: SubscriptionPlan.ENTERPRISE, subtitle: 'Tier 3', priceMonthly: 199, priceYearly: 1990, yearlyDiscountPercent: 20, features: ['Everything in Pro +', 'Multi-branch', 'Advanced reports', 'API access', 'Forecasting & analytics'], purpose: 'Chain', color: 'border-indigo-600', isPopular: true }
];

export const getPlans = async (): Promise<PlanDetails[]> => Promise.resolve([...planDetails]);

export const updatePlanPrice = async (planName: SubscriptionPlan, monthly: number, yearly: number, discount: number): Promise<void> => {
    const idx = planDetails.findIndex(p => p.name === planName);
    if (idx !== -1) {
        planDetails[idx] = { ...planDetails[idx], priceMonthly: monthly, priceYearly: yearly, yearlyDiscountPercent: discount };
    }
    return Promise.resolve();
};

export const getSidebarStats = async (): Promise<Record<string, number>> => {
    return Promise.resolve({
        'Patient Requests': patientRequests.filter(r => r.status === 'in_queue' || r.status === 'pending_payment').length,
        'Patient Approval Queue': mockUsers.filter(u => u.role === UserRole.PATIENT && u.patientStatus === PatientStatus.PENDING_APPROVAL).length,
        'Upgrade Requests': upgradeRequests.filter(r => r.status === 'pending').length,
        'Referral Control': referrals.filter(r => r.status === 'pending').length,
        'Feedback Center': userSuggestions.filter(s => s.status === 'new').length,
    });
};

export const assignPlanToUser = async (userId: string, userType: 'pharmacy' | 'doctor', plan: SubscriptionPlan): Promise<void> => {
    if (userType === 'pharmacy') {
        const pharmacy = pharmacies.find(p => String(p.id) === userId);
        if (pharmacy) {
            pharmacy.plan = plan;
            // Also update the admin user's plan for consistency
            const admin = mockUsers.find(u => u.pharmacyId === pharmacy.id && u.role === UserRole.PHARMACY_ADMIN);
            if (admin) admin.plan = plan;
        }
    } else {
        const user = mockUsers.find(u => u.id === userId);
        if (user) user.plan = plan;
    }
    return Promise.resolve();
};

export const addUserSuggestion = async (s: any) => { 
    userSuggestions.push({ ...s, id: `s-${Date.now()}`, status: 'new', createdAt: new Date().toISOString() }); 
    return Promise.resolve();
};

export const getUserSuggestions = async (): Promise<UserSuggestion[]> => Promise.resolve([...userSuggestions]);
export const updateUserSuggestion = async (s: UserSuggestion) => {
    const idx = userSuggestions.findIndex(x => x.id === s.id);
    if (idx !== -1) userSuggestions[idx] = s;
    return Promise.resolve();
};

export const getAuditLogs = async () => Promise.resolve([...auditLogs].reverse());
export const getSafetySettings = async () => Promise.resolve(safetySettings);
export const updateSafetySettings = async (s: SafetySettings) => { safetySettings = s; return Promise.resolve(); };

/**
 * FIX: Implemented checkPlanAccess to resolve missing export errors in Sidebar and usePlanAccess hook.
 * This function validates feature availability based on the user's subscription tier and overrides.
 */
export const checkPlanAccess = async (user: User, featureKey: string): Promise<boolean> => {
    const plan = user.plan || SubscriptionPlan.BASIC;
    
    // Super Admin has access to everything
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    // Enterprise plan has access to everything
    if (plan === SubscriptionPlan.ENTERPRISE) return true;

    // Mapping of features to minimum required plans (if not Enterprise)
    const featurePlanMap: Record<string, SubscriptionPlan[]> = {
        'sales_module': [SubscriptionPlan.PRO],
        'export_reports': [SubscriptionPlan.PRO],
        'prescription_builder': [], // Enterprise only
        'inventory_management': [SubscriptionPlan.BASIC, SubscriptionPlan.PRO],
        'prescription_lookup': [SubscriptionPlan.PRO],
        'staff_management': [SubscriptionPlan.PRO],
        'marketplace': [], // Enterprise only
        'api_access': [], // Enterprise only
    };

    const allowedPlans = featurePlanMap[featureKey] || [];
    const hasPlanAccess = allowedPlans.includes(plan);

    // Also check for tenant overrides
    const hasOverride = tenantOverrides.some(o => 
        String(o.pharmacyId) === String(user.pharmacyId || user.id) && 
        o.featureKey === featureKey && 
        o.enabled
    );

    return hasPlanAccess || hasOverride;
};

// Required Stubs
export const getUsers = async () => Promise.resolve(mockUsers.filter(u => !u.isDeleted));
export const getPharmacyById = async (id: number) => Promise.resolve(pharmacies.find(p => p.id === id) || null);
export const getPharmacySales = async (id: number) => Promise.resolve(sales.filter(s => s.pharmacyId === id));
export const getAllSales = async () => Promise.resolve(sales);
export const getUpgradeRequests = async () => Promise.resolve([...upgradeRequests]);
export const getFeatureFlags = async () => Promise.resolve([]);
export const getPlatformFeature = async (key: string) => Promise.resolve(true);
export const getSMSLogs = async () => Promise.resolve([]);

export const approveUpgrade = async (id: string, note?: string) => {
    const req = upgradeRequests.find(r => r.id === id);
    if (req) {
        req.status = 'approved';
        const pharmacy = pharmacies.find(p => p.id === req.pharmacyId);
        if (pharmacy) {
            pharmacy.plan = req.requestedPlan;
            // Update admin user too
            const admin = mockUsers.find(u => u.pharmacyId === pharmacy.id && u.role === UserRole.PHARMACY_ADMIN);
            if (admin) admin.plan = req.requestedPlan;

            // Record platform sale
            const planDetail = planDetails.find(p => p.name === req.requestedPlan);
            const amount = req.billingCycle === 'yearly' ? (planDetail?.priceYearly || 0) : (planDetail?.priceMonthly || 0);
            
            platformSales.push({
                id: `ps-${Date.now()}`,
                type: 'subscription',
                entityId: String(pharmacy.id),
                entityName: pharmacy.name,
                amount: amount,
                plan: req.requestedPlan,
                date: new Date().toISOString().split('T')[0],
                status: 'paid'
            });
        }
    }
    return Promise.resolve();
};

export const rejectUpgrade = async (id: string, note?: string) => {
    const req = upgradeRequests.find(r => r.id === id);
    if (req) req.status = 'rejected';
    return Promise.resolve();
};

export const getAllReferrals = async () => Promise.resolve([...referrals]);
export const getReferralSettings = async () => Promise.resolve({} as any);
export const updateReferralSettings = async (s: any) => Promise.resolve();
export const getTenantFeatureOverrides = async () => Promise.resolve(tenantOverrides);
export const setTenantFeatureOverride = async (id: any, k: any, e: any, s: any, ex: any) => Promise.resolve();
export const deleteTenantFeatureOverride = async (id: any) => Promise.resolve();
export const getPlatformSales = async () => Promise.resolve([...platformSales]);
export const getPlatformSettings = async () => Promise.resolve(platformSettings);
export const updatePlatformSettings = async (s: Partial<PlatformSettings>) => {
    platformSettings = { ...platformSettings, ...s };
    return Promise.resolve();
};

export const getSuperAdminDashboardData = async () => {
    const totalPharmacies = pharmacies.filter(p => !p.isDeleted).length;
    const totalSales = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalMRR = platformSales
        .filter(s => s.type === 'subscription' && s.status === 'paid')
        .reduce((sum, s) => sum + s.amount, 0);
    
    // Inventory shortages across all pharmacies
    const allInventory = await getAllInventory();
    const inventoryShortages = allInventory.filter(i => i.stock < 50).length;
    
    // New users this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const newUsersThisMonth = mockUsers.filter(u => u.createdAt && u.createdAt >= startOfMonth).length;

    // Pending tasks
    const pendingApprovals = upgradeRequests.filter(r => r.status === 'pending').length;
    const pendingUpdates = systemVersions.filter(v => v.status === 'draft' || v.status === 'scheduled').length;

    // Mock monthly sales data for the chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = now.getMonth();
    const chartData = months.slice(0, currentMonthIdx + 1).map((month, idx) => {
        const monthSales = platformSales.filter(s => {
            const d = new Date(s.date);
            return d.getMonth() === idx && d.getFullYear() === now.getFullYear();
        });
        return {
            name: month,
            value: monthSales.reduce((sum, s) => sum + s.amount, 0) || Math.floor(Math.random() * 5000) + 2000
        };
    });

    return Promise.resolve({
        totalPharmacies,
        totalSales,
        totalMRR,
        inventoryShortages,
        newUsersThisMonth,
        pendingApprovals,
        pendingUpdates,
        chartData,
        salesGrowth: 15
    });
};

export const getAdminAnalytics = async (): Promise<AnalyticsData> => {
    const activePharmacies = pharmacies.filter(p => !p.isDeleted).length;
    const totalSales = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    const mrr = platformSales
        .filter(s => s.type === 'subscription' && s.status === 'paid')
        .reduce((sum, s) => sum + s.amount, 0);
    
    const planDistribution = Object.values(SubscriptionPlan).map(plan => ({
        name: plan,
        value: pharmacies.filter(p => p.plan === plan).length + mockUsers.filter(u => u.role === UserRole.DOCTOR && u.plan === plan).length
    })).filter(d => d.value > 0);

    const revenueHistory = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('default', { month: 'short' });
        const monthSales = platformSales.filter(s => {
            const sd = new Date(s.date);
            return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
        });
        return { month, amount: monthSales.reduce((sum, s) => sum + s.amount, 0) || Math.floor(Math.random() * 5000) + 2000 };
    }).reverse();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const newPharmaciesThisMonth = pharmacies.filter(p => !p.isDeleted && p.createdAt >= startOfMonth).length;

    return Promise.resolve({
        totalPharmacies: activePharmacies,
        totalSales,
        inventoryShortages: inventoryBatches.filter(b => b.quantity < 50).length,
        newUsersThisMonth: mockUsers.filter(u => u.createdAt && u.createdAt >= startOfMonth).length,
        mrr,
        activePharmacies,
        revenueHistory,
        revenueByPlan: planDistribution,
        subscriptionDistribution: planDistribution.map((p, idx) => ({ 
            ...p, 
            color: ['#007E85', '#6366f1', '#10b981', '#f59e0b', '#ef4444'][idx % 5] 
        })),
        recentSignups: mockUsers.slice(-5).map(u => ({
            type: u.role,
            name: u.name,
            date: u.createdAt || '',
            status: 'Active'
        })),
        growthHistory: Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                date: d.toISOString().split('T')[0],
                new: Math.floor(Math.random() * 5),
                churned: Math.floor(Math.random() * 1)
            };
        }).reverse(),
        nrr: 105,
        newPharmaciesThisMonth,
        churnedPharmaciesThisMonth: 0,
        churnRate: 1.2
    });
};

export const getProductIntelligence = async (): Promise<ProductIntelligenceData> => {
    return Promise.resolve({
        avgTimeSignupToFirstItem: 1.5,
        avgTimeSignupToFirstSale: 3.2,
        featureAdoption: [
            { featureName: 'AI Search', usagePercent: 85, totalUsers: 120, planRequired: SubscriptionPlan.BASIC },
            { featureName: 'Inventory Export', usagePercent: 45, totalUsers: 60, planRequired: SubscriptionPlan.PRO },
            { featureName: 'Marketplace', usagePercent: 20, totalUsers: 25, planRequired: SubscriptionPlan.ENTERPRISE }
        ],
        upgradePressure: [
            { featureName: 'Bulk Import', paywallHits: 450, upgradeRequests: 12 },
            { featureName: 'Multi-branch', paywallHits: 120, upgradeRequests: 8 }
        ]
    });
};

export const getSystemHealthAnalytics = async (): Promise<SystemHealthData> => {
    const now = new Date();
    const dau = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - i);
        return { date: d.toISOString().split('T')[0], value: 150 + Math.floor(Math.random() * 50) };
    }).reverse();

    const signups = dau.map(d => {
        const count = mockUsers.filter(u => u.createdAt && u.createdAt.startsWith(d.date)).length;
        return { date: d.date, value: count || Math.floor(Math.random() * 5) };
    });

    return Promise.resolve({
        uptime: 99.98,
        latency: 42,
        errorRate: 0.05,
        dau,
        signups,
        activeSessions: Math.floor(Math.random() * 20) + 15,
        serverLoad: 24,
        memoryUsage: 62,
        incidents: abuseLogs.slice(-5).map(l => ({
            id: l.id,
            timestamp: l.timestamp,
            type: l.type === 'rate_limit_hit' ? 'warning' : 'critical',
            message: l.details,
            status: 'resolved'
        })),
        riskMetrics: {
            inventoryDeletions: 5,
            manualAdjustments: 12,
            highRiskPharmacies: []
        },
        integrityIndicators: {
            failedOperations: 0,
            recentIncidents: []
        }
    });
};
export const getSystemVersions = async () => Promise.resolve([...systemVersions]);
export const addSystemVersion = async (v: any) => {
    systemVersions.push({ ...v, id: `v-${Date.now()}` });
    return Promise.resolve();
};
export const updateSystemVersion = async (v: any) => {
    const idx = systemVersions.findIndex(x => x.id === v.id);
    if (idx !== -1) systemVersions[idx] = v;
    return Promise.resolve();
};
export const deleteSystemVersion = async (id: any) => {
    const idx = systemVersions.findIndex(x => x.id === id);
    if (idx !== -1) systemVersions.splice(idx, 1);
    return Promise.resolve();
};
export const trackReferralClick = async (c: any) => Promise.resolve();
export const getReferralCode = async (id: string) => Promise.resolve('REF123');
export const getReferralStats = async (id: string) => Promise.resolve({} as any);
export const approveReferral = async (id: any) => Promise.resolve();
export const rejectReferral = async (id: any) => Promise.resolve();
export const initiateTelebirrPayment = async (id: any, a: any) => Promise.resolve({ id: 'tx-123' });
export const checkPaymentStatus = async (id: any) => Promise.resolve({ status: 'paid' });
export const requestUpgrade = async (id: any, n: any, p: any, c: any, t: any) => Promise.resolve();
export const getPharmacyInventory = async (id: number): Promise<InventoryItem[]> => {
    // Derive InventoryItem from Batches for backward compatibility
    const pharmacyBatches = inventoryBatches.filter(b => Number(b.organizationId) === id);
    const pharmacyInventory: InventoryItem[] = pharmacyBatches.map(batch => {
        const medicine = medicines.find(m => m.id === batch.medicineId);
        return {
            id: Number(batch.id.split('-')[1]) || Math.floor(Math.random() * 10000),
            pharmacyId: id,
            medicineName: medicine?.name || 'Unknown',
            category: medicine?.category || InventoryCategory.OTHER,
            stock: batch.quantity,
            expiryDate: batch.expiryDate,
            costPrice: batch.purchasePrice,
            price: batch.sellingPrice,
            supplier: batch.supplierId,
            supplierInfo: 'Mock Supplier',
            batchNumber: batch.batchNumber,
            brand: medicine?.manufacturer || 'Generic',
            sku: `SKU-${batch.id}`,
            isRecalled: false
        };
    });
    return Promise.resolve(pharmacyInventory);
};

export const getAllInventory = async (): Promise<InventoryItem[]> => {
    // Derive InventoryItem from all Batches for Super Admin view
    const allInventory: InventoryItem[] = inventoryBatches.map(batch => {
        const medicine = medicines.find(m => m.id === batch.medicineId);
        const pharmacy = pharmacies.find(p => p.id === batch.organizationId);
        return {
            id: Number(batch.id.split('-')[1]) || Math.floor(Math.random() * 10000),
            pharmacyId: Number(batch.organizationId),
            medicineName: medicine?.name || 'Unknown',
            category: medicine?.category || InventoryCategory.OTHER,
            stock: batch.quantity,
            expiryDate: batch.expiryDate,
            costPrice: batch.purchasePrice,
            price: batch.sellingPrice,
            supplier: batch.supplierId,
            supplierInfo: pharmacy?.name || 'Unknown Pharmacy',
            batchNumber: batch.batchNumber,
            brand: medicine?.manufacturer || 'Generic',
            sku: `SKU-${batch.id}`,
            isRecalled: !!batch.isRecalled
        };
    });
    return Promise.resolve(allInventory);
};

// Enterprise Inventory Functions
export const getMedicines = async (): Promise<Medicine[]> => Promise.resolve(medicines);
export const getInventoryBatches = async (pharmacyId: number | string): Promise<InventoryBatch[]> => 
    Promise.resolve(inventoryBatches.filter(b => String(b.organizationId) === String(pharmacyId)));

export const getStockMovements = async (pharmacyId: number | string): Promise<StockMovement[]> => 
    Promise.resolve(stockMovements.filter(m => String(m.organizationId) === String(pharmacyId)));

export const addMedicine = async (m: Omit<Medicine, 'id'>) => {
    const newMed = { ...m, id: `med-${Date.now()}` };
    medicines.push(newMed);
    return Promise.resolve(newMed);
};

export const addInventoryBatch = async (b: Omit<InventoryBatch, 'id' | 'createdAt'>) => {
    const newBatch: InventoryBatch = {
        ...b,
        id: `batch-${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    inventoryBatches.push(newBatch);
    
    // Record movement
    await recordStockMovement({
        organizationId: newBatch.organizationId,
        medicineId: newBatch.medicineId,
        batchId: newBatch.id,
        type: StockMovementType.PURCHASE,
        quantity: newBatch.quantity
    });
    
    return Promise.resolve(newBatch);
};

export const recordStockMovement = async (m: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const newMovement: StockMovement = {
        ...m,
        id: `mov-${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    stockMovements.push(newMovement);
    
    // Update batch quantity
    const batch = inventoryBatches.find(b => b.id === m.batchId);
    if (batch) {
        if (m.type === StockMovementType.SALE || m.type === StockMovementType.TRANSFER) {
            batch.quantity -= m.quantity;
        } else if (m.type === StockMovementType.PURCHASE || m.type === StockMovementType.RETURN) {
            batch.quantity += m.quantity;
        } else if (m.type === StockMovementType.ADJUSTMENT) {
            // For adjustment, quantity could be positive or negative
            batch.quantity += m.quantity;
        }
    }
    
    return Promise.resolve(newMovement);
};

export const toggleRecallStatus = async (id: any) => {
    const batch = inventoryBatches.find(b => b.id === String(id) || Number(b.id.split('-')[1]) === id);
    if (batch) {
        batch.isRecalled = !batch.isRecalled;
    }
    return Promise.resolve();
};
export const addInventoryItem = async (i: Omit<InventoryItem, 'id'>) => {
    // Check limit
    const pharmacy = pharmacies.find(p => p.id === i.pharmacyId);
    if (pharmacy) {
        const currentInventory = inventoryBatches.filter(b => b.organizationId === i.pharmacyId);
        const limit = pharmacy.plan === SubscriptionPlan.ENTERPRISE ? 999999 : (pharmacy.plan === SubscriptionPlan.PRO ? 100 : 50);
        if (currentInventory.length >= limit) {
            return Promise.resolve({ success: false, message: `Inventory limit of ${limit} reached for your plan.` });
        }
    }

    // Enterprise Integration: Create Medicine if it doesn't exist, then create Batch
    let medicine = medicines.find(m => m.name === i.medicineName);
    if (!medicine) {
        medicine = await addMedicine({
            name: i.medicineName,
            genericName: i.medicineName, // Fallback
            strength: 'Unknown',
            dosageForm: 'Unknown',
            manufacturer: i.brand || 'Unknown',
            category: i.category
        });
    }

    const newBatch = await addInventoryBatch({
        organizationId: i.pharmacyId,
        medicineId: medicine.id,
        batchNumber: i.batchNumber || `BN-${Date.now()}`,
        expiryDate: i.expiryDate,
        quantity: i.stock,
        purchasePrice: i.costPrice,
        sellingPrice: i.price,
        supplierId: i.supplier || 'Direct'
    });

    return Promise.resolve({ success: true, message: 'Item added to enterprise inventory engine.' });
};
export const updateInventoryItem = async (i: InventoryItem) => {
    const batch = inventoryBatches.find(b => b.id === `batch-${i.id}` || Number(b.id.split('-')[1]) === i.id);
    if (batch) {
        const oldQty = batch.quantity;
        batch.quantity = i.stock;
        batch.expiryDate = i.expiryDate;
        batch.purchasePrice = i.costPrice;
        batch.sellingPrice = i.price;
        batch.batchNumber = i.batchNumber;

        if (oldQty !== i.stock) {
            await recordStockMovement({
                organizationId: batch.organizationId,
                medicineId: batch.medicineId,
                batchId: batch.id,
                type: StockMovementType.ADJUSTMENT,
                quantity: i.stock - oldQty,
                referenceId: 'MANUAL_ADJUSTMENT'
            });
        }
    }
    return Promise.resolve();
};

export const deleteInventoryItem = async (id: any) => {
    const batchIdx = inventoryBatches.findIndex(b => b.id === String(id) || Number(b.id.split('-')[1]) === id);
    if (batchIdx !== -1) {
        inventoryBatches.splice(batchIdx, 1);
        return Promise.resolve({ success: true });
    }
    return Promise.resolve({ success: false, message: 'Batch not found' });
};
export const addInventoryItemsBulk = async (items: any[], pharmacyId: number, actor: string) => {
    const pharmacy = pharmacies.find(p => p.id === pharmacyId);
    if (!pharmacy) return Promise.resolve({ success: false, message: 'Pharmacy not found.' });
    
    const currentInventory = inventoryBatches.filter(b => b.organizationId === pharmacyId);
    const limit = pharmacy.plan === SubscriptionPlan.ENTERPRISE ? 999999 : (pharmacy.plan === SubscriptionPlan.PRO ? 100 : 50);
    
    if (currentInventory.length + items.length > limit) {
        return Promise.resolve({ 
            success: false, 
            message: `Bulk import exceeds your plan limit. You have ${limit - currentInventory.length} slots remaining.` 
        });
    }

    let importedCount = 0;
    for (const item of items) {
        const res = await addInventoryItem({
            pharmacyId,
            medicineName: item.medicineName,
            category: item.category || InventoryCategory.OTHER,
            stock: item.stock || 0,
            expiryDate: item.expiryDate || new Date().toISOString().split('T')[0],
            costPrice: item.costPrice || 0,
            price: item.price || 0,
            supplier: item.brand || 'Bulk Import',
            supplierInfo: 'Imported via Excel',
            batchNumber: item.batchNumber || `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            brand: item.brand || 'Generic',
            sku: item.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        });
        if (res.success) importedCount++;
    }
    
    auditLogs.push({
        id: `audit-${Date.now()}`,
        tableName: 'inventory_batches',
        recordId: `bulk-${pharmacyId}`,
        operation: 'BULK_IMPORT',
        newData: { itemCount: importedCount },
        changedBy: actor,
        timestamp: new Date().toISOString(),
        severity: 'medium'
    });
    
    return Promise.resolve({ success: true, message: `${importedCount} items imported successfully.` });
};
export const processPrescriptionSale = async (p: Prescription, id: number) => {
    const medName = p.details.split(' - ')[0];
    const medicine = medicines.find(m => m.name.toLowerCase().includes(medName.toLowerCase()));
    
    if (medicine) {
        const batch = inventoryBatches.find(b => b.medicineId === medicine.id && Number(b.organizationId) === id && b.quantity > 0);
        if (batch) {
            await recordStockMovement({
                organizationId: id,
                medicineId: medicine.id,
                batchId: batch.id,
                type: StockMovementType.SALE,
                quantity: 1,
                referenceId: `RX-${p.prescriptionCode}`
            });
            return Promise.resolve({ success: true, message: 'Prescription processed and stock updated.' });
        }
    }
    return Promise.resolve({ success: false, message: 'Medicine or stock not found for this prescription.' });
};

export const processManualSale = async (items: { itemId: number, quantity: number }[], soldBy: string) => {
    for (const item of items) {
        const batch = inventoryBatches.find(b => Number(b.id.split('-')[1]) === item.itemId || b.id === String(item.itemId));
        if (batch) {
            await recordStockMovement({
                organizationId: batch.organizationId,
                medicineId: batch.medicineId,
                batchId: batch.id,
                type: StockMovementType.SALE,
                quantity: item.quantity,
                referenceId: `MANUAL-${Date.now()}`
            });
        }
    }
    return Promise.resolve({ success: true, message: 'Sale processed and stock updated.' });
};
export const getPrescriptionByCode = async (c: string) => Promise.resolve(null);
export const getPrescriptionById = async (id: number) => Promise.resolve(null);
export const createPrescription = async (d: any) => Promise.resolve({ id: Date.now() } as any);
export const getDoctorDashboardData = async (id: string) => Promise.resolve({ prescriptionsCreated: 10, lastPrescriptionCode: 'RX-999' });
export const getPharmacyAdminDashboardData = async (id: number) => Promise.resolve({ totalSalesToday: 100, lowStockItems: 2, prescriptionsFilled: 5, expiringItems: 1 });
export const searchPublicInventory = async (q: string) => Promise.resolve([]);
export const initiatePaidRequest = async (p: string, i: any) => Promise.resolve({ id: 'req-1' } as any);
export const confirmPaidRequest = async (id: string, tx: string) => Promise.resolve();
export const getAllPatientRequests = async () => Promise.resolve([...patientRequests]);
export const updatePatientRequestStatus = async (id: string, s: any) => {
    const idx = patientRequests.findIndex(r => r.id === id);
    if (idx !== -1) patientRequests[idx].status = s;
    return Promise.resolve();
};
export const completePatientRequestWithResult = async (id: string, r: any) => Promise.resolve();
export const exportData = (d: any, f: any) => console.log('Exporting', f);
export const updateUserProfile = async (u: any) => Promise.resolve();
export const changePassword = async (id: any, c: any, n: any) => Promise.resolve();
export const adminResetUserPassword = async (id: any, p: any) => Promise.resolve();
export const getHolidayThemes = async () => Promise.resolve([]);
export const createHolidayTheme = async (t: any) => Promise.resolve();
export const toggleHolidayTheme = async (id: any, a: boolean, b: boolean) => Promise.resolve();

// --- MARKETPLACE API FUNCTIONS ---

export const getMarketplaceAnalytics = async (): Promise<MarketplaceStats> => Promise.resolve({
    totalVolume: 250000,
    totalOrders: 120,
    activeSuppliers: 15,
    supplierPerformance: [{ name: 'EthioPharma', fulfillmentTime: 2.5, rating: 4.8 }],
    topProducts: [{ name: 'Amoxicillin', count: 450 }]
});

export const getSuppliers = async (): Promise<PharmaceuticalCompany[]> => Promise.resolve(suppliers);

export const approveSupplier = async (id: string): Promise<void> => {
    const s = suppliers.find(sup => sup.id === id);
    if (s) s.status = 'approved';
    return Promise.resolve();
};

export const suspendSupplier = async (id: string): Promise<void> => {
    const s = suppliers.find(sup => sup.id === id);
    if (s) s.status = 'suspended';
    return Promise.resolve();
};

export const getDemandSignals = async (): Promise<DemandSignal[]> => Promise.resolve(demandSignals);

export const getMarketplaceProducts = async (): Promise<SupplierProduct[]> => Promise.resolve(marketplaceProducts);

export const placeMarketplaceOrder = async (order: Omit<MarketplaceOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<MarketplaceOrder> => {
    const newOrder: MarketplaceOrder = {
        ...order,
        id: `ORD-${Date.now()}`,
        status: MarketplaceOrderStatus.SUBMITTED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    marketplaceOrders.push(newOrder);
    return Promise.resolve(newOrder);
};

export const getPharmacyMarketplaceOrders = async (pharmacyId: string | number): Promise<MarketplaceOrder[]> => 
    Promise.resolve(marketplaceOrders.filter(o => String(o.pharmacyId) === String(pharmacyId)));

export const getAbuseLogs = async () => Promise.resolve([...abuseLogs]);

export const getPatientPlatformAnalytics = async (timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<PatientPlatformAnalytics> => {
    const now = new Date();
    let startDate = new Date();
    
    if (timeframe === 'day') startDate.setHours(0, 0, 0, 0);
    else if (timeframe === 'week') startDate.setDate(now.getDate() - 7);
    else if (timeframe === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (timeframe === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const dailyVolume = last7Days.map(date => ({
        date,
        count: patientRequests.filter(r => r.createdAt.startsWith(date)).length + Math.floor(Math.random() * 5)
    }));

    const conversion = {
        paid: patientRequests.filter(r => r.status === 'completed').length,
        abandoned: Math.floor(patientRequests.length * 0.15),
        inQueue: patientRequests.filter(r => r.status === 'in_queue' || r.status === 'pending_payment').length
    };

    const searchCounts: Record<string, number> = {};
    searchLogs.filter(l => new Date(l.timestamp) >= startDate).forEach(log => {
        searchCounts[log.medicineName] = (searchCounts[log.medicineName] || 0) + 1;
    });

    const topSearched = Object.entries(searchCounts)
        .map(([name, hits]) => ({ name, hits }))
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 5);

    return Promise.resolve({
        dailyVolume,
        conversion,
        topSearched,
        activeUsers: mockUsers.filter(u => u.role === UserRole.PATIENT).length,
        revenue: {
            monthly: patientRequests.reduce((sum, r) => sum + r.amountPaid, 0),
            growth: 15
        }
    });
};

export const getPatientPlanConfigs = async (): Promise<PatientPlanConfig[]> => Promise.resolve([...patientPlanConfigs]);

export const updatePatientPlanConfig = async (config: PatientPlanConfig): Promise<void> => {
    const idx = patientPlanConfigs.findIndex(c => c.id === config.id);
    if (idx !== -1) {
        patientPlanConfigs[idx] = { ...config };
    }
    return Promise.resolve();
};

export const logSearch = async (medicineName: string, region: string = 'Unknown') => {
    searchLogs.push({
        id: `s-${Date.now()}`,
        medicineName,
        timestamp: new Date().toISOString(),
        region
    });
    safetySettings.currentDailyCount++;
    return Promise.resolve();
};
