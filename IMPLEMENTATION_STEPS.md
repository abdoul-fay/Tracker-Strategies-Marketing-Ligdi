# MULTI-TENANT IMPLEMENTATION GUIDE

## Overview
This guide walks through implementing multi-tenant data isolation for the Marketing Tracker. The authentication system is complete; now we need to integrate tenant filtering into the data queries.

## ✅ COMPLETED STEPS
1. ✅ Created Login.jsx with Supabase auth
2. ✅ Modified App.jsx for authentication checks
3. ✅ Created multiTenant.js with helper functions
4. ✅ Created SQL schema (supabase-schema-multitenant.sql)

## 🔄 NEXT STEPS

### STEP 1: Run Supabase SQL Schema (In Supabase Dashboard)
**File:** `supabase-schema-multitenant.sql`

1. Go to Supabase Dashboard → Your Project
2. Open **SQL Editor**
3. Click **New Query**
4. Copy all content from `supabase-schema-multitenant.sql`
5. Click **Run**

**What this does:**
- Creates `tenants` table for company data
- Creates `users` table for team members
- Creates `audit_logs` table for compliance
- Adds `tenant_id` column to: campaigns, ambassadeurs, strategies
- Enables Row Level Security (RLS) on all tables
- Creates RLS policies for data isolation

**Expected output:**
```
CREATE TABLE
CREATE INDEX
ALTER TABLE
...
✅ Success! No errors
```

---

### STEP 2: Update Overview.jsx with Tenant Filtering

**File:** `src/pages/Overview.jsx`

Add tenant_id filtering to the useEffect:

```jsx
import { getTenantId } from '../lib/multiTenant'

export default function Overview({ campagnes }) {
  useEffect(() => {
    // Filter campaigns by current tenant
    const tenantId = getTenantId()
    const tenantCampagnes = campagnes.filter(c => c.tenant_id === tenantId)
    
    // ... rest of logic
  }, [campagnes])
}
```

---

### STEP 3: Update Recommendations.jsx with Tenant Filtering

**File:** `src/pages/Recommendations.jsx`

```jsx
import { getTenantId } from '../lib/multiTenant'

export default function Recommendations({ campagnes }) {
  useEffect(() => {
    const tenantId = getTenantId()
    // Only process recommendations for current tenant
    const tenantCampagnes = campagnes.filter(c => c.tenant_id === tenantId)
    
    // ... generate recommendations from tenantCampagnes
  }, [campagnes])
}
```

---

### STEP 4: Update Database Queries in lib/supabase.js

Modify the Supabase helper to include tenant_id:

```javascript
import { getTenantId } from './multiTenant'

const db = {
  // Get campaigns for current tenant
  async getCampaigns() {
    const tenantId = getTenantId()
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get ambassadors for current tenant
  async getAmbassadors() {
    const tenantId = getTenantId()
    const { data, error } = await supabase
      .from('ambassadeurs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get strategies for current tenant
  async getStrategies() {
    const tenantId = getTenantId()
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Add campaign (automatically set tenant_id)
  async addCampaign(campaign) {
    const tenantId = getTenantId()
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        ...campaign,
        tenant_id: tenantId
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Similar for addAmbassador, addStrategy, etc.
  // Always include: tenant_id: getTenantId()
}
```

---

### STEP 5: Testing Multi-Tenant Data Isolation

**Create Test Accounts:**

1. **Account A (Company 1):**
   - Email: `company1@test.com`
   - Password: `SecurePassword123`
   - Company: `Test Company 1`

2. **Account B (Company 2):**
   - Email: `company2@test.com`
   - Password: `SecurePassword456`
   - Company: `Test Company 2`

**Test Procedure:**

```javascript
// Step 1: Sign in as Company 1
Login with company1@test.com
Navigate to Overview
Create a campaign: "Campaign A"
Verify it appears in your dashboard

// Step 2: Sign in as Company 2 (in another tab)
Login with company2@test.com
Navigate to Overview
Expected: You should NOT see "Campaign A"
Create a campaign: "Campaign B"

// Step 3: Return to Company 1 tab
Refresh the page
Expected: You should still only see "Campaign A"
Expected: You should NOT see "Campaign B"

// Step 4: Check database (Supabase console)
Go to Supabase → Table Editor
Open campaigns table
Verify:
  - Campaign A has Company 1's tenant_id
  - Campaign B has Company 2's tenant_id
  - They have DIFFERENT tenant_id values
```

**Expected Results:**
- ✅ User A can see Campaign A
- ✅ User A CANNOT see Campaign B
- ✅ User B can see Campaign B
- ✅ User B CANNOT see Campaign A
- ✅ Each tenant is completely isolated

---

## 📋 INTEGRATION CHECKLIST

- [ ] Run SQL schema in Supabase
- [ ] Update Overview.jsx with tenant filtering
- [ ] Update Recommendations.jsx with tenant filtering
- [ ] Update AmbassadeursCampagnes.jsx with tenant filtering
- [ ] Update Benchmarking.jsx with tenant filtering
- [ ] Update Predictions.jsx with tenant filtering
- [ ] Modify lib/supabase.js to include tenant_id in all queries
- [ ] Modify lib/supabase.js to filter all SELECT queries by tenant_id
- [ ] Test with Account A
- [ ] Test with Account B
- [ ] Verify data isolation in Supabase console
- [ ] Run `npm run build` (verify no errors)
- [ ] Deploy to Cloudflare Pages

---

## 🔍 VERIFICATION QUERIES

**In Supabase SQL Editor, run these to verify RLS is working:**

```sql
-- Check if RLS is enabled
SELECT tablename, array_agg(policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;

-- Verify tenant_id columns exist
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_name IN ('campaigns', 'ambassadeurs', 'strategies')
AND column_name = 'tenant_id';

-- Check audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- Count tenants
SELECT COUNT(*) as total_tenants FROM tenants;
```

---

## 🚨 COMMON ISSUES

### Issue 1: RLS blocks all queries
**Symptom:** "row level security" error
**Solution:** Check that user has record in `users` table with their tenant_id

### Issue 2: Campaigns not appearing after login
**Symptom:** Dashboard shows no data
**Solution:** Verify campaigns table has tenant_id populated (see migration script in SQL file)

### Issue 3: Cross-tenant data visible
**Symptom:** Company A can see Company B's data
**Solution:** 
1. Check RLS policies are enabled
2. Verify user records exist in `users` table
3. Check that queries include `.eq('tenant_id', tenantId)`

### Issue 4: null tenant_id in campaigns
**Symptom:** Some campaigns missing from results
**Solution:** Run migration script in SQL to assign existing data to tenant

---

## 📊 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All RLS policies enabled in Supabase
- [ ] All queries filter by tenant_id
- [ ] Test with 2+ companies
- [ ] Audit logs working
- [ ] Login page accessible
- [ ] Build passes (no errors)
- [ ] No cross-tenant data visible
- [ ] Logout clears tenant_id
- [ ] New companies can sign up
- [ ] Existing users can sign in

---

## 🎯 SUCCESS CRITERIA

✅ Complete when:
1. Multi-tenant SQL schema deployed
2. RLS policies active in Supabase
3. All queries include tenant_id filtering
4. 2 companies tested with isolated data
5. Build passes (844 modules)
6. Zero cross-tenant data leakage
7. Audit logs track all actions

---

## 📞 SUPPORT

For issues with:
- **Supabase RLS:** Check policies in Dashboard → Authentication → Policies
- **Query errors:** Verify tenant_id exists in user's account
- **Build errors:** Run `npm run build` and check console output
- **Data isolation:** Test with SQL queries in Supabase SQL Editor

---

## 🚀 WHAT'S NEXT AFTER IMPLEMENTATION?

Once all steps are complete:

1. **Monitor:** Watch audit_logs for suspicious activity
2. **Scale:** Add more companies with confidence in data isolation
3. **Enhance:** Add team member management (users table)
4. **Monetize:** Implement subscription tiers (stored in tenants.subscription_tier)
5. **Audit:** Review audit logs regularly for compliance

---

## 📝 QUICK REFERENCE

**Key Functions:**
```javascript
// Get current tenant_id
getTenantId()

// Get current user info
getCurrentUser()

// Check if user has permission
hasPermission('admin')

// Log action for audit trail
logAction('create', 'campaigns', data)

// Build tenant query (RLS does this automatically)
.eq('tenant_id', getTenantId())
```

**Key Tables:**
- `tenants`: Companies using the app
- `users`: Team members from each company
- `campaigns`: Marketing campaigns (filtered by tenant_id)
- `ambassadeurs`: Ambassadors (filtered by tenant_id)
- `strategies`: Strategies (filtered by tenant_id)
- `audit_logs`: All changes for compliance

---

This is the final step to make your Marketing Tracker a production-ready SaaS platform! 🎉
