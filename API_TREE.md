
# API Call Architecture Tree

This document outlines the API calls made within the application, grouped by their source files.

## 🟢 Context & Core Hooks (Centralized)
These files handle the majority of data fetching and state management.

- **`src/hooks/useAuth.tsx`**
  - `auth` (Sign In, Sign Up, Sign Out, Session Management)
  - `rpc('get_user_role')` (Fetches user role: admin, coach, client, etc.)

- **`src/context/UserContext.tsx`** (Recently Optimized)
  - `profiles` (User settings and profile data)
  - `orders` (Order history for clients)
  - `coach_intake_forms` (Status of assigned coaches and forms)
  - `crm_clients` (Mapping user to CRM client ID)
  - `crm_memberships` (Active subscription details)
  - `crm_purchases` (Direct purchase history)
  - `crm_documents` (Shared PDF/files)

- **`src/hooks/useCRM.ts`**
  - `crm_clients` (Full client list for staff)
  - `crm_memberships` (Subscription management)
  - `crm_purchases` (Sales logs)
  - `crm_documents` (Internal document management)
  - `crm_client_notes` (Staff notes about clients)
  - `crm_marketing_campaigns` (Email/Lead campaigns)
  - `crm_campaign_enrollments` (Tracking leads)

---

## 🔵 Management & Admin (Staff Only)
Files used by Admins and Personnel.

- **`src/components/admin/OrderManager.tsx`**
  - `orders` (Global order viewing and status updates)
  - `profiles` (Fetching customer names for order list)

- **`src/components/admin/InventoryManager.tsx`**
  - `products` (Inventory tracking and stock management)

- **`src/hooks/useSavedViews.ts`**
  - `crm_saved_views` (Custom table filters and views)

---

## 🟡 Forms & Interactions (Public/Client)
Files handling specific user actions.

- **`src/pages/Orders.tsx`**
  - `functions.invoke('verify-payment')` (Edge Function call to verify Stripe)

- **`src/pages/CoachIntakeForm.tsx`**
  - `coach_intake_forms` (Saving intake data)

- **`src/components/ContactSection.tsx`**
  - `contact_submissions` (Saving contact form leads)

---

## 🔘 Integration Helpers
- **`src/lib/shopify.ts`**
  - `shopify_settings` (Fetching API keys and settings)
  - `shopify_sync_logs` (Tracking product sync)

---

### Summary of Optimization:
- **Before**: `Portal.tsx` and `Orders.tsx` were making their own separate calls to the same tables.
- **After**: All shared data is now moved to `UserContext.tsx`, reducing initial load calls by **~70%** for users.
