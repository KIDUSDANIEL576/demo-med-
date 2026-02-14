# 🧬 MEDINTELLICARE V2.0: MASTER GENERATION PROMPT

**Role:** Expert Full-Stack Cloud Architect (Next.js + Supabase)
**Objective:** Architect and build the production-grade **"MedIntelliCare"** SaaS platform.
**Context:** This is a mission-critical healthcare ERP for Pharmacies, Doctors, and Administrators in East Africa.

---

## 1. 🏗️ ARCHITECTURE & STACK
*   **Framework:** Next.js 14+ (App Router, Server Components).
*   **Language:** TypeScript (Strict Mode).
*   **Styling:** Tailwind CSS + Shadcn/UI + Framer Motion (Glassmorphism aesthetics).
*   **Backend:** Supabase (PostgreSQL 15+, Auth, Edge Functions, Realtime).
*   **State Management:** Zustand (Client), TanStack Query (Server state).
*   **Forms:** React Hook Form + Zod Validation.
*   **Icons:** Lucide React.

---

## 2. 🔐 SECURITY & TENANCY (Non-Negotiable)
*   **Authentication:** Supabase SSR Auth (Email/Password).
*   **RBAC (Role-Based Access Control):**
    *   `super_admin`: Full system control.
    *   `pharmacy_admin`: Tenant owner (Full access to their pharmacy).
    *   `pharmacist` / `sales`: Restricted access (POS & Inventory only).
    *   `doctor`: Independent entity (Prescriptions & Patient History).
*   **RLS (Row Level Security):**
    *   **MANDATORY:** Every table must have RLS policies.
    *   **Isolation:** Pharmacy data must be strictly isolated by `pharmacy_id`.
    *   **Hierarchy:** `branch_id` logic for multi-branch pharmacies.
*   **Audit Logging:**
    *   Implement database triggers.
    *   Any `INSERT`, `UPDATE`, or `DELETE` on sensitive tables (`inventory`, `sales`, `prescriptions`) must be logged to an immutable `audit_log` table.

---

## 3. 💾 DATABASE SCHEMA (Advanced)
*Reference `supabase/schema.sql` for the full DDL.*

### Core Entities
1.  **`pharmacies`**: Tenants with Plan (`BASIC`, `STANDARD`, `PLATINUM`), Metadata, and Settings.
2.  **`pharmacy_branches`**: Supports multi-location pharmacies.
3.  **`app_users`**: Extends Supabase Auth with Role, Pharmacy ID, and Branch ID.

### Inventory & Compliance (The "PharmaPro" Engine)
4.  **`efda_batch_records`**: Strict tracking of medicine batches (Batch #, Manufacturer, Expiry, Recalls).
5.  **`inventory`**: aggregated stock view linked to Batches.
6.  **`products`**: Global catalog of medicines (optional).

### Transactions
7.  **`sales`**: Head record for a transaction.
8.  **`sale_items`**: Line items linked to specific inventory batches.
    *   **Logic:** Must use **FEFO (First-Expired-First-Out)** dispensing logic via Stored Procedure (`rpc_dispense_fefo`).

### Clinical
9.  **`prescriptions`**: Doctor-generated records.
    *   Fields: Patient Info, Diagnosis, Medicines (JSONB), Dispensed Status.
    *   Security: Only the issuing Doctor and the dispensing Pharmacy can view details.

### Growth & System
10. **`plan_features`**: Centralized gating rules (Basic vs Platinum).
11. **`bonus_feature_grants`**: Temporary overrides for specific tenants.
12. **`referral_codes`** & **`referral_events`**: Growth hacking system.
13. **`holiday_themes`**: Admin-controlled UI theming engine.

---

## 4. 🚀 CORE MODULES & FEATURES

### 🏥 A. Super Admin Command Center
*   **Global Analytics:** Real-time MRR, ARR, Active Tenants, Churn Rate.
*   **Tenant Control:** Ban/Suspend pharmacies, Reset Admin Passwords.
*   **Version Launchpad:**
    *   Manage `system_versions` (e.g., "Launch v2.0").
    *   Toggle `feature_flags` globally.
*   **Holiday Theme Engine:** Upload background images/colors that override the UI for all users.

### 💊 B. Pharmacy Dashboard
*   **Smart Inventory:**
    *   Batch-level tracking.
    *   **Expiry Alerts:** Visual indicators for items expiring < 30 days.
    *   **EFDA Recall:** Block sales of specific batches if flagged by Admin.
*   **Point of Sale (POS):**
    *   **Prescription Lookup:** Fetch Rx details via code (e.g., `RX-999`).
    *   **Real-time Stock Check:** Prevent selling more than available.
    *   **Cart System:** Dynamic calculation of totals and profit margins.
*   **Staff Management:** (Platinum Only) Create/Manage Pharmacist accounts.

### 🩺 C. Doctor Dashboard
*   **Prescription Builder:**
    *   Digital pad to write meds, dosage, and instructions.
    *   Generates a unique 8-char code (e.g., `RX-AB12`).
    *   **PDF Generation:** Printable format with Clinic Logo and E-Signature.
*   **Profile:** Manage Clinic details and credentials.

### 🌍 D. Patient Portal (Public)
*   **Medicine Finder:** Search for specific drugs (e.g., "Amoxicillin").
*   **Results:** List Pharmacies that have stock > 0 (Privacy: Do not show exact stock numbers, just "Available").

---

## 5. 🎨 UI/UX GUIDELINES
*   **Theme:** Professional Medical (Teal/Emerald/Cyan) + Clean White/Gray.
*   **Layout:** Responsive Sidebar navigation + Top Header with User Profile.
*   **Components:**
    *   **Data Tables:** Sortable, Filterable, Pagination.
    *   **Modals:** Glassmorphism effect for forms.
    *   **Charts:** Recharts for Sales Analytics.
    *   **Loaders:** Skeleton screens for data fetching.

---

## 6. 📝 EXECUTION INSTRUCTIONS
1.  **Initialize:** Set up Next.js 14 project structure.
2.  **Database:** Run the `supabase/schema.sql` migration.
3.  **Hooks:** Create `usePlanAccess` for centralized feature gating.
4.  **Pages:** Implement Role-Based Redirects in `middleware.ts`.
5.  **Develop:** Build modules in this order: Auth -> Inventory -> POS -> Rx -> Admin.
