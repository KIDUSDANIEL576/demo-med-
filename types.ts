
export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  PHARMACY_ADMIN = 'Pharmacy Admin',
  DOCTOR = 'Doctor',
  PHARMACIST = 'Pharmacist',
  SALES = 'Sales Person',
  PATIENT = 'Patient',
  SUPPLIER = 'Supplier'
}

export enum SubscriptionPlan {
    BASIC = 'Basic',
    STANDARD = 'Standard',
    PLATINUM = 'Platinum',
    PATIENT_FREE = 'Patient Free',
    PATIENT_PAID = 'Patient Paid',
}

export enum PatientStatus {
    PENDING_APPROVAL = 'pending_approval',
    ACTIVE = 'active',
    REJECTED = 'rejected',
}

export enum InventoryCategory {
    MEDICINE = 'Medicine',
    PAINKILLER = 'Painkiller',
    ANTIBIOTIC = 'Antibiotic',
    ANTIVIRAL = 'Antiviral',
    ANTIHISTAMINE = 'Antihistamine',
    VITAMIN = 'Vitamin',
    COSMETICS = 'Cosmetics',
    SUPPLIES = 'Supplies',
    OTHER = 'Other',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan?: SubscriptionPlan;
  pharmacyId?: number | string;
  supplierId?: string; // New: Link user to supplier entity
  createdAt?: string;
  lastLogin?: string;
  phone?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicLogoUrl?: string;
  eSignatureUrl?: string;
  referralCode?: string;
  patientStatus?: PatientStatus;
  isDeleted?: boolean; // For soft deletes
}

// --- MARKETPLACE ENTITIES (B2B SUPPLY INTELLIGENCE) ---

export enum MarketplaceOrderStatus {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    CONFIRMED = 'confirmed',
    DISPATCHED = 'dispatched',
    DELIVERED = 'delivered',
    CLOSED = 'closed',
    DISPUTED = 'disputed'
}

export interface PharmaceuticalCompany {
    id: string;
    legalName: string;
    tradeName: string;
    licenseNumber: string;
    efdaCertificateUrl: string;
    contactPerson: string;
    phone: string;
    email: string;
    distributionRegions: string[];
    status: 'pending' | 'approved' | 'suspended';
    reliabilityScore: number; // 0-100
    createdAt: string;
}

export interface SupplierProduct {
    id: string;
    supplierId: string;
    medicineName: string;
    category: InventoryCategory;
    strength: string;
    dosageForm: string;
    packSize: string;
    moq: number;
    price: number;
    bulkPriceTiers: { minQty: number; price: number }[];
    leadTimeDays: number;
    storageRequirements?: string;
    expiryRangeMonths: number;
    isActive: boolean;
}

export interface MarketplaceOrder {
    id: string;
    pharmacyId: number | string;
    pharmacyName: string;
    supplierId: string;
    supplierName: string;
    status: MarketplaceOrderStatus;
    totalAmount: number;
    paymentMethod: 'telebirr' | 'bank_transfer' | 'credit';
    items: MarketplaceOrderItem[];
    disputeId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MarketplaceOrderItem {
    id: string;
    productId: string;
    medicineName: string;
    quantity: number;
    unitPrice: number;
}

export interface MarketplaceDispute {
    id: string;
    orderId: string;
    issueType: 'missing_items' | 'damaged_goods' | 'wrong_batch' | 'expired_stock';
    description: string;
    status: 'open' | 'under_review' | 'resolved' | 'denied';
    adminResolution?: string;
    createdAt: string;
}

export interface DemandSignal {
    id: string;
    medicineName: string;
    region: string;
    intensity: 'low' | 'medium' | 'high' | 'critical';
    trend: 'rising' | 'stable' | 'falling';
    estimatedShortageDate?: string;
    updatedAt: string;
}

export interface MarketplaceStats {
    totalVolume: number;
    totalOrders: number;
    supplierPerformance: { name: string; fulfillmentTime: number; rating: number }[];
    topProducts: { name: string; count: number }[];
    revenueGrowth?: number;
    activeSuppliers?: number;
}

// --- EXISTING ENTITIES ---

export interface SafetySettings {
    platformEnabled: boolean;
    requestsPaused: boolean;
    maxRequestsPerDay: number;
    currentDailyCount: number;
    patientModeEnabled: boolean;
}

export interface PatientPlanConfig {
    id: string;
    name: SubscriptionPlan;
    monthlyPrice: number;
    requestLimit: number;
    features: string[];
    isEnabled: boolean;
}

export interface AbuseLog {
    id: string;
    timestamp: string;
    type: 'rate_limit_hit' | 'pause_bypass' | 'invalid_payment_attempt' | 'unauthorized_login';
    ipAddress?: string;
    patientId?: string;
    details: string;
}

export interface PatientPlatformAnalytics {
    dailyVolume: { date: string; count: number }[];
    topSearched: { name: string; hits: number }[];
    conversion: {
        paid: number;
        abandoned: number;
        inQueue: number;
    };
    revenue: {
        monthly: number;
        growth: number;
    };
}

export interface Patient {
    id: string;
    phone: string;
    email?: string;
    name?: string;
    createdAt: string;
    status: PatientStatus;
    plan: SubscriptionPlan;
}

export interface PublicInventoryResult {
    id: number;
    medicineName: string;
    pharmacyName: string;
    address: string;
    price: number;
    available: 'YES' | 'NO';
    pharmacyId: number;
    pharmacyAddress?: string;
    isRecalled?: boolean;
    stockStatus?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PatientRequest {
    id: string;
    patientId: string;
    pharmacyId: number;
    medicineName: string;
    amountPaid: number;
    status: 'pending_payment' | 'in_queue' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    transactionId?: string;
}

export interface SMSLog {
    id: string;
    phone: string;
    message: string;
    status: 'sent' | 'failed';
    timestamp: string;
}

export interface PlatformFeature {
    key: string;
    enabled: boolean;
}

export interface Pharmacy {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    staff: number;
    inventory_limit: number;
    createdBy: string;
    plan: SubscriptionPlan;
    planStartDate: string;
    planExpiryDate: string;
    lastLogin: string;
    createdAt: string;
    publicStockListingOptIn?: boolean;
    isDeleted?: boolean; // For soft deletes
}

export interface InventoryItem {
    id: number;
    pharmacyId: number;
    medicineName: string;
    category: InventoryCategory;
    stock: number;
    expiryDate: string;
    costPrice: number;
    price: number;
    supplier: string;
    supplierInfo: string;
    batchNumber: string;
    brand: string;
    sku: string;
    isRecalled?: boolean;
}

export interface Sale {
    id: number;
    pharmacyId: number;
    medicineName: string;
    quantity: number;
    totalPrice: number;
    profitMargin: number;
    soldBy: string;
    date: string;
    timestamp: string;
}

export interface Prescription {
    id: number;
    doctorId: string;
    doctorName: string;
    clinicName: string;
    patientName: string;
    prescriptionCode: string;
    details: string;
    signatureUrl: string;
    createdAt: string;
}

export interface AuditLog {
    id: string;
    tableName: string;
    recordId: string;
    operation: 'UPDATE' | 'DELETE' | 'INSERT' | 'SEARCH' | 'PAYMENT' | 'SMS_SENT' | 'ORDER' | 'APPROVAL' | 'REJECTION' | 'MARKETPLACE_ORDER';
    oldData?: any;
    newData?: any;
    changedBy: string;
    pharmacyName?: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
}

export interface AnalyticsData {
    totalPharmacies: number;
    totalSales: number;
    inventoryShortages: number;
    newUsersThisMonth: number;
    mrr: number;
    activePharmacies: number;
    revenueHistory: { month: string; amount: number }[];
    revenueByPlan: { name: string; value: number }[];
    subscriptionDistribution: { name: string; value: number; color: string }[];
    recentSignups: { type: string; name: string; date: string; status: string }[];
    growthHistory: { date: string; new: number; churned: number }[];
    nrr: number;
    newPharmaciesThisMonth: number;
    churnedPharmaciesThisMonth: number;
    churnRate: number;
}

export interface PlanDetails {
    id: string;
    name: SubscriptionPlan;
    subtitle: string;
    priceMonthly: number;
    priceYearly: number;
    yearlyDiscountPercent: number;
    features: string[];
    purpose: string;
    color: string;
    isPopular?: boolean;
}

export interface SystemVersion {
    id: string;
    version_name: string;
    launch_date: string;
    features_included: string[];
    status: 'draft' | 'scheduled' | 'active' | 'archived';
    announcement: string;
    interest_poll_enabled: boolean;
    poll_question?: string;
    poll_options?: { label: string; votes: number }[];
}

export interface FeatureFlag {
    id: string;
    feature_key: string;
    description: string;
    default_enabled: boolean;
    plan_access: Record<SubscriptionPlan, boolean>;
}

export interface UserSuggestion {
    id: string;
    user_id: string;
    tenant_id: string;
    user_role: string;
    version_tag: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    status: 'new' | 'reviewed' | 'planned' | 'resolved';
    admin_reply?: string;
    attachment_url?: string;
}

export interface MICNotification {
    id: string;
    title: string;
    message: string;
    createdAt: string;
}

export interface TenantFeatureOverride {
    id: string;
    pharmacyId: string | number;
    featureKey: string;
    enabled: boolean;
    startDate?: string;
    expiryDate?: string;
    createdBy: string;
}

export interface ProductIntelligenceData {
    avgTimeSignupToFirstItem: number;
    avgTimeSignupToFirstSale: number;
    featureAdoption: {
        featureName: string;
        planRequired: SubscriptionPlan;
        usagePercent: number;
        totalUsers: number;
    }[];
    upgradePressure: {
        featureName: string;
        paywallHits: number;
        upgradeRequests: number;
    }[];
}

export interface SystemHealthData {
    dau: { date: string; value: number }[];
    signups: { date: string; value: number }[];
    riskMetrics: {
        inventoryDeletions: number;
        manualAdjustments: number;
        highRiskPharmacies: { id: string; name: string; riskScore: number; reason: string }[];
    };
    integrityIndicators: {
        failedOperations: number;
        recentIncidents: { id: string; timestamp: string; severity: 'low' | 'high'; type: string; description: string }[];
    };
}

export interface UpgradeRequest {
    id: string;
    pharmacyId: number;
    pharmacyName?: string;
    requestedPlan: SubscriptionPlan;
    billingCycle: 'monthly' | 'yearly';
    requestDate: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_note?: string;
    paymentTransactionId?: string;
}

export interface ReferralStat {
    totalReferrals: number;
    successfulReferrals: number;
    pendingRewards: number;
    totalClicks: number;
    discountEarned: string;
}

export interface ReferralSettings {
    discountPercent: number;
    discountDurationMonths: number;
    programTitle: string;
    programMessage: string;
}

export interface Referral {
    id: string;
    referrerId: string;
    referrerName: string;
    referralCode: string;
    newUserId: string;
    newUserName: string;
    newUserEmail: string;
    clicks: number;
    status: 'pending' | 'approved' | 'rejected';
    rewardStatus: 'pending' | 'paid' | 'void';
    createdAt: string;
}

export interface HolidayTheme {
    id: string;
    name: string;
    message: string;
    isActive: boolean;
    themePayload: {
        primaryColor: string;
        backgroundImage?: string;
        themeMode: 'light' | 'dark' | 'holiday';
    };
}
