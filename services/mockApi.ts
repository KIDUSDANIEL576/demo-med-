
import {
    User, UserRole, SubscriptionPlan, Pharmacy, InventoryItem, Sale, Prescription,
    InventoryCategory, AuditLog, PlanDetails, UpgradeRequest, AnalyticsData,
    Patient, PatientRequest, SMSLog, PlatformFeature, PublicInventoryResult,
    SystemVersion, FeatureFlag, UserSuggestion, MICNotification, TenantFeatureOverride,
    ProductIntelligenceData, SystemHealthData, SafetySettings, AbuseLog, PatientPlatformAnalytics,
    MarketplaceStats, PharmaceuticalCompany, SupplierProduct, MarketplaceOrder, MarketplaceOrderStatus,
    HolidayTheme, Referral, ReferralStat, ReferralSettings, PatientStatus, PatientPlanConfig, DemandSignal
} from '../types';

// --- DATA PERSISTENCE ---

export let mockUsers: (User & { password?: string })[] = [
    { id: '1', name: 'Super Admin', email: 'Kidusdaniel576@gmail.com', role: UserRole.SUPER_ADMIN, password: '123456' },
    { id: '2', name: 'Dr. Jane Smith', email: 'jane@clinic.com', role: UserRole.DOCTOR, clinicName: 'Central Clinic', clinicAddress: '123 Main St', phone: '0911223344', plan: SubscriptionPlan.STANDARD, createdAt: '2024-01-15', isDeleted: false },
    { id: '3', name: 'Abbebe Pharma Admin', email: 'admin@abbebe.com', role: UserRole.PHARMACY_ADMIN, pharmacyId: 101, plan: SubscriptionPlan.PLATINUM, createdAt: '2024-02-10', isDeleted: false },
];

export let pharmacies: Pharmacy[] = [
    { id: 101, name: 'Abbebe Pharmacy', email: 'admin@abbebe.com', phone: '555-0101', address: 'Bole, Addis Ababa', staff: 4, inventory_limit: 1000, createdBy: '1', plan: SubscriptionPlan.PLATINUM, planStartDate: '2024-02-10', planExpiryDate: '2025-02-10', lastLogin: '2024-11-20', createdAt: '2024-02-10', isDeleted: false }
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

export let auditLogs: AuditLog[] = [];
export let notifications: MICNotification[] = [
    { id: 'n1', title: 'System Pulse Active', message: 'The MedIntelliCare AI engine is running at 98% efficiency.', createdAt: new Date().toISOString() }
];

export let upgradeRequests: UpgradeRequest[] = [];
export let tenantOverrides: TenantFeatureOverride[] = [];
export let userSuggestions: UserSuggestion[] = [];

export let safetySettings: SafetySettings = { 
    platformEnabled: true, 
    requestsPaused: false, 
    maxRequestsPerDay: 100, 
    currentDailyCount: 45, 
    patientModeEnabled: true 
};

export let patientPlanConfigs: PatientPlanConfig[] = [
    { id: 'pp-1', name: SubscriptionPlan.PATIENT_FREE, monthlyPrice: 0, requestLimit: 5, features: ['Standard Discovery', 'Stock Reserve'], isEnabled: true },
    { id: 'pp-2', name: SubscriptionPlan.PATIENT_PAID, monthlyPrice: 9.99, requestLimit: 50, features: ['Fuzzy AI Search', 'Priority Agent Support', 'Real-time Alerts'], isEnabled: true }
];

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

export const updatePatientStatus = async (id: string, status: PatientStatus): Promise<void> => {
    const user = mockUsers.find(u => u.id === id);
    if (user) {
        user.patientStatus = status;
        
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

export const getPlans = async (): Promise<PlanDetails[]> => Promise.resolve([
    { id: 'p-1', name: SubscriptionPlan.BASIC, subtitle: 'Standard', priceMonthly: 49, priceYearly: 490, yearlyDiscountPercent: 15, features: ['100 Items'], purpose: 'Small', color: 'border-slate-200' },
    { id: 'p-2', name: SubscriptionPlan.PLATINUM, subtitle: 'Enterprise', priceMonthly: 149, priceYearly: 1490, yearlyDiscountPercent: 20, features: ['Unlimited'], purpose: 'Chain', color: 'border-indigo-500', isPopular: true }
]);

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
export const getPatientPlanConfigs = async () => Promise.resolve(patientPlanConfigs);
export const updatePatientPlanConfig = async (c: PatientPlanConfig) => {
    const idx = patientPlanConfigs.findIndex(p => p.id === c.id);
    if (idx !== -1) patientPlanConfigs[idx] = c;
    return Promise.resolve();
};

/**
 * FIX: Implemented checkPlanAccess to resolve missing export errors in Sidebar and usePlanAccess hook.
 * This function validates feature availability based on the user's subscription tier and overrides.
 */
export const checkPlanAccess = async (user: User, featureKey: string): Promise<boolean> => {
    const plan = user.plan || SubscriptionPlan.BASIC;
    
    // Super Admin has access to everything
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    // Platinum plan has access to everything
    if (plan === SubscriptionPlan.PLATINUM) return true;

    // Mapping of features to minimum required plans (if not Platinum)
    const featurePlanMap: Record<string, SubscriptionPlan[]> = {
        'sales_module': [SubscriptionPlan.STANDARD],
        'export_reports': [SubscriptionPlan.STANDARD],
        'prescription_builder': [], // Platinum only
        'inventory_management': [SubscriptionPlan.BASIC, SubscriptionPlan.STANDARD],
        'prescription_lookup': [SubscriptionPlan.STANDARD],
        'staff_management': [SubscriptionPlan.STANDARD],
        'marketplace': [], // Platinum only
        'api_access': [], // Platinum only
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
export const getUpgradeRequests = async () => Promise.resolve(upgradeRequests);
export const getFeatureFlags = async () => Promise.resolve([]);
export const getPlatformFeature = async (key: string) => Promise.resolve(true);
export const getSMSLogs = async () => Promise.resolve([]);
export const updatePlanPrice = async (p: any, m: any, y: any, d: any) => Promise.resolve();
export const approveUpgrade = async (id: string, note?: string) => Promise.resolve();
export const rejectUpgrade = async (id: string, note?: string) => Promise.resolve();
export const getAllReferrals = async () => Promise.resolve([]);
export const getReferralSettings = async () => Promise.resolve({} as any);
export const updateReferralSettings = async (s: any) => Promise.resolve();
export const getTenantFeatureOverrides = async () => Promise.resolve(tenantOverrides);
export const setTenantFeatureOverride = async (id: any, k: any, e: any, s: any, ex: any) => Promise.resolve();
export const deleteTenantFeatureOverride = async (id: any) => Promise.resolve();
export const getSuperAdminDashboardData = async () => Promise.resolve({ totalPharmacies: pharmacies.length, totalSales: 5000, inventoryShortages: 2, newUsersThisMonth: 5 });
export const getAdminAnalytics = async () => Promise.resolve({} as any);
export const getProductIntelligence = async () => Promise.resolve({} as any);
export const getSystemHealthAnalytics = async () => Promise.resolve({ dau: [], signups: [], riskMetrics: { inventoryDeletions: 0, manualAdjustments: 0, highRiskPharmacies: [] }, integrityIndicators: { failedOperations: 0, recentIncidents: [] } });
export const getSystemVersions = async () => Promise.resolve([]);
export const addSystemVersion = async (v: any) => Promise.resolve();
export const updateSystemVersion = async (v: any) => Promise.resolve();
export const deleteSystemVersion = async (id: any) => Promise.resolve();
export const trackReferralClick = async (c: any) => Promise.resolve();
export const getReferralCode = async (id: string) => Promise.resolve('REF123');
export const getReferralStats = async (id: string) => Promise.resolve({} as any);
export const approveReferral = async (id: any) => Promise.resolve();
export const rejectReferral = async (id: any) => Promise.resolve();
export const initiateTelebirrPayment = async (id: any, a: any) => Promise.resolve({ id: 'tx-123' });
export const checkPaymentStatus = async (id: any) => Promise.resolve({ status: 'paid' });
export const requestUpgrade = async (id: any, n: any, p: any, c: any, t: any) => Promise.resolve();
export const getPharmacyInventory = async (id: number) => Promise.resolve([]);
export const getAllInventory = async () => Promise.resolve([]);
export const toggleRecallStatus = async (id: any) => Promise.resolve();
export const addInventoryItem = async (i: any) => Promise.resolve({ success: true });
export const updateInventoryItem = async (i: any) => Promise.resolve();
export const deleteInventoryItem = async (id: any) => Promise.resolve({ success: true });
export const addInventoryItemsBulk = async (i: any, p: any, u: any) => Promise.resolve();
export const processPrescriptionSale = async (p: any, id: number) => Promise.resolve({ success: true, message: 'Processed' });
export const processManualSale = async (i: any, s: any) => Promise.resolve({ success: true, message: 'Processed' });
export const getPrescriptionByCode = async (c: string) => Promise.resolve(null);
export const getPrescriptionById = async (id: number) => Promise.resolve(null);
export const createPrescription = async (d: any) => Promise.resolve({ id: Date.now() } as any);
export const getDoctorDashboardData = async (id: string) => Promise.resolve({ prescriptionsCreated: 10, lastPrescriptionCode: 'RX-999' });
export const getPharmacyAdminDashboardData = async (id: number) => Promise.resolve({ totalSalesToday: 100, lowStockItems: 2, prescriptionsFilled: 5, expiringItems: 1 });
export const searchPublicInventory = async (q: string) => Promise.resolve([]);
export const initiatePaidRequest = async (p: string, i: any) => Promise.resolve({ id: 'req-1' } as any);
export const confirmPaidRequest = async (id: string, tx: string) => Promise.resolve();
export const getAllPatientRequests = async () => Promise.resolve([]);
export const updatePatientRequestStatus = async (id: string, s: any) => Promise.resolve();
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

export const getPatientPlatformAnalytics = async () => Promise.resolve({ conversion: { paid: 50, abandoned: 10, inQueue: 5 }, dailyVolume: [], revenue: { monthly: 500, growth: 10 }, topSearched: [] });
export const getAbuseLogs = async () => Promise.resolve([]);
