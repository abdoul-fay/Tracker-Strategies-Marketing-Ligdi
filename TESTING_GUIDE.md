# 🧪 TESTING GUIDE - MULTI-TENANT DATA ISOLATION

**Purpose:** Verify that each tenant (company) can ONLY see their own data  
**Duration:** 1-2 hours  
**Difficulty:** Easy (step-by-step guide)

---

## 📋 PRE-TEST CHECKLIST

Before testing, ensure:
- [ ] SQL schema executed in Supabase (`supabase-schema-multitenant.sql`)
- [ ] RLS policies enabled on all tables
- [ ] Code changes committed (`supabase.js` with tenant_id filtering)
- [ ] Build passes: `npm run build` ✅
- [ ] No errors in browser console

---

## 🔐 TESTING REQUIREMENTS

### Browser Setup
- Use 2 different browsers OR 2 incognito windows
- Why? Prevents session interference
- Example: Chrome + Firefox OR Chrome + Safari

### Network Access
- Both browsers must be on same network
- OR use local tunnel (ngrok) if testing across networks
- OR deploy and test on live URL

### Database Access
- Have Supabase Dashboard open in separate browser tab
- You'll need to verify data in SQL console

---

## ✅ TEST PROCEDURE

### SETUP PHASE (5 minutes)

**Step 1: Open Test Environment**
1. Open Browser A (Chrome, Safari, or Firefox)
2. Open Browser B (different browser or incognito)
3. Open Supabase Dashboard in Browser C (or tab)
4. Open your app in both Browser A and B

**Step 2: Clear Existing Data**
1. In Supabase Dashboard → SQL Editor
2. Run these queries:
```sql
-- BACKUP first if you have important data!
DELETE FROM public.campaigns WHERE tenant_id IS NULL;
DELETE FROM public.ambassadeurs WHERE tenant_id IS NULL;
DELETE FROM public.strategies WHERE tenant_id IS NULL;
```

---

### TEST PHASE 1: COMPANY A SETUP (10 minutes)

**Browser A: Create Company A Account**

1. Open your app in Browser A
2. You should see Login page
3. Click "New company? Create Account"
4. Fill in:
   ```
   Company Name: Test Company Alpha
   Email: alpha@test.com
   Password: TestPassword123!
   ```
5. Click "Create Account"
6. ✅ Should see: "✅ Account created! Check your email to verify."
7. Click "Have an account? Sign In" to return to login
8. Fill in:
   ```
   Email: alpha@test.com
   Password: TestPassword123!
   ```
9. Click "Sign In"
10. ✅ Should see: Dashboard/Home page

**Verify in Supabase:**
1. Go to Supabase Dashboard → Table Editor
2. Click `tenants` table
3. Verify: Row exists with company_name = "Test Company Alpha"
4. Note the tenant_id (UUID value)

---

### TEST PHASE 2: ADD DATA TO COMPANY A (10 minutes)

**Browser A: Create Campaign for Company A**

1. In your app (Browser A), navigate to "Stratégies" page
2. Look for "Add Strategy" button/form
3. Fill in a test strategy:
   ```
   Name: Alpha Campaign 1
   Description: Testing company A data
   Budget: 5000
   ```
4. Click Save/Submit
5. ✅ Campaign should appear in the list

**Verify in Supabase:**
1. Go to Supabase → Table Editor → campaigns
2. Find the row you just created
3. Verify: The `tenant_id` matches Company A's tenant_id
4. Note the campaign name

---

### TEST PHASE 3: COMPANY B SETUP (10 minutes)

**Browser B: Create Company B Account**

1. Open your app in Browser B (should show Login page)
2. Click "New company? Create Account"
3. Fill in:
   ```
   Company Name: Test Company Beta
   Email: beta@test.com
   Password: TestPassword456!
   ```
4. Click "Create Account"
5. ✅ Should see success message
6. Sign in with beta@test.com
7. ✅ Should see Dashboard

**Verify in Supabase:**
1. Go to Supabase Dashboard → tenants table
2. Verify: NEW row exists with company_name = "Test Company Beta"
3. Note the tenant_id (should be DIFFERENT from Company A's)

---

### TEST PHASE 4: ADD DATA TO COMPANY B (10 minutes)

**Browser B: Create Campaign for Company B**

1. In your app (Browser B), navigate to "Stratégies" page
2. Create a strategy:
   ```
   Name: Beta Campaign 1
   Description: Testing company B data
   Budget: 7500
   ```
3. Click Save/Submit
4. ✅ Campaign should appear

**Verify in Supabase:**
1. Go to Supabase → campaigns table
2. Find Beta's campaign
3. Verify: The `tenant_id` is DIFFERENT from Alpha's campaign
4. Important: **Two different tenant_id values for two companies**

---

### TEST PHASE 5: DATA ISOLATION VERIFICATION (Critical!)

This is the KEY test. Each company should ONLY see their own data.

**Browser A: Verify Company A Cannot See Company B's Data**

1. In Browser A (Company A), go to "Stratégies" page
2. Look at the list of campaigns
3. ✅ **EXPECTED:** You see only "Alpha Campaign 1"
4. ✅ **EXPECTED:** You do NOT see "Beta Campaign 1"
5. Check "Vue d'Ensemble" (Overview) page
6. ✅ **EXPECTED:** Only Alpha's data in charts

**Browser B: Verify Company B Cannot See Company A's Data**

1. In Browser B (Company B), go to "Stratégies" page
2. Look at the list of campaigns
3. ✅ **EXPECTED:** You see only "Beta Campaign 1"
4. ✅ **EXPECTED:** You do NOT see "Alpha Campaign 1"
5. Check "Vue d'Ensemble" (Overview) page
6. ✅ **EXPECTED:** Only Beta's data in charts

---

### TEST PHASE 6: DATABASE LEVEL VERIFICATION

**Test RLS Policies in Supabase**

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
```sql
-- Check what Company A can see (should only see their data)
SELECT id, name, tenant_id 
FROM campaigns 
WHERE tenant_id = (
  SELECT tenant_id FROM users 
  WHERE auth_id = '<Company A auth_id>' 
  LIMIT 1
);
-- Expected result: Only Alpha campaigns
```

3. Run this query:
```sql
-- Check what Company B can see (should only see their data)
SELECT id, name, tenant_id 
FROM campaigns 
WHERE tenant_id = (
  SELECT tenant_id FROM users 
  WHERE auth_id = '<Company B auth_id>' 
  LIMIT 1
);
-- Expected result: Only Beta campaigns
```

---

## ✨ SUCCESS CRITERIA

All of these must be TRUE:

| Test | Expected | Status |
|------|----------|--------|
| Company A sees own campaign | ✅ Alpha Campaign visible | [ ] |
| Company A hides Company B data | ✅ Beta Campaign hidden | [ ] |
| Company B sees own campaign | ✅ Beta Campaign visible | [ ] |
| Company B hides Company A data | ✅ Alpha Campaign hidden | [ ] |
| Supabase: Different tenant_ids | ✅ Alpha ≠ Beta | [ ] |
| RLS policies working | ✅ Filtering at DB level | [ ] |
| No errors in console | ✅ Console clean | [ ] |
| Build passes | ✅ 844 modules | [ ] |

---

## 🚨 TROUBLESHOOTING

### Problem: "No tenant_id found" warning in console

**Cause:** User not authenticated  
**Solution:**
1. Make sure you logged in successfully
2. Check localStorage: Open DevTools → Application → localStorage
3. Look for `tenant_id` key
4. If missing: Login again

### Problem: Both companies see all data

**Cause:** RLS policies not enabled in Supabase  
**Solution:**
1. Go to Supabase Dashboard
2. Check if SQL schema was executed
3. Verify RLS is enabled on tables:
   - campaigns (should show RLS enabled badge)
   - ambassadeurs (should show RLS enabled badge)
   - strategies (should show RLS enabled badge)

### Problem: Company A sees Company B's data

**Cause:** Possible issues:
- RLS policies not properly created
- SQL schema not fully executed
- Database-level filtering issue

**Solution:**
1. Re-run the SQL schema from beginning
2. Check for errors in Supabase
3. Verify RLS policies in Supabase Dashboard → Policies tab

### Problem: App crashes when loading data

**Cause:** getTenantId() returning null  
**Solution:**
1. Make sure code is updated with tenant_id filtering
2. Check that multiTenant.js is imported correctly
3. Verify login flow completes successfully

### Problem: Can't create test accounts

**Cause:** Email already exists (from previous tests)  
**Solution:**
1. Use different email addresses each test
2. OR go to Supabase → Authentication → Users
3. Delete test users and try again

---

## 📊 TESTING CHECKLIST

```
PRE-TEST SETUP
[ ] SQL schema executed in Supabase
[ ] RLS policies enabled
[ ] Code changes committed
[ ] Build passes (npm run build)
[ ] Two browsers/windows ready

COMPANY A
[ ] Created account (alpha@test.com)
[ ] Logged in successfully
[ ] Created campaign "Alpha Campaign 1"
[ ] Verified in Supabase database
[ ] tenant_id recorded

COMPANY B
[ ] Created account (beta@test.com)
[ ] Logged in successfully
[ ] Created campaign "Beta Campaign 1"
[ ] Verified in Supabase database
[ ] tenant_id recorded (different from A)

DATA ISOLATION TESTS
[ ] Company A cannot see Beta's data
[ ] Company B cannot see Alpha's data
[ ] Only own campaigns visible in list
[ ] Only own data in charts/analytics
[ ] Supabase shows correct filtering

FINAL VERIFICATION
[ ] No console errors
[ ] No warning messages
[ ] Build still passes
[ ] Database filters work correctly
```

---

## ✅ TEST COMPLETION

When all tests pass with ✅:

**You have successfully implemented:**
- ✅ Multi-tenant authentication
- ✅ Tenant data isolation
- ✅ RLS policies working
- ✅ Application-level filtering
- ✅ Production-ready security

**Next steps:**
1. Document any issues found
2. Fix any failing tests (see troubleshooting)
3. Deploy to Cloudflare Pages
4. Monitor production for 24 hours

---

## 📝 NOTES

**Important:**
- Use DIFFERENT emails for each test account
- Use DIFFERENT browser/window for each company
- Check Supabase database to verify tenant_id separation
- RLS policies must be enabled for full security

**Performance:**
- Testing should take 1-2 hours total
- Most time is creating accounts and adding data
- Isolation checks are instant

**Documentation:**
- Take screenshots of successful tests
- Note any errors encountered
- Document any customizations made

---

**Your multi-tenant system is complete when all tests pass! 🎉**

If any test fails, refer to the troubleshooting section or check the detailed implementation guide in `IMPLEMENTATION_STEPS.md`.
