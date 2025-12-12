# 🚨 URGENT: EXECUTE SQL SCHEMA NOW

**Error:** `Could not find the table 'public.tenants' in the schema cache`

**Cause:** SQL schema hasn't been executed in Supabase yet

**Solution:** Run the SQL in Supabase Dashboard (5 minutes)

---

## ⚡ QUICK FIX (Do this RIGHT NOW)

### Step 1: Go to Supabase Dashboard
1. Open: https://app.supabase.com
2. Select your project
3. Click "SQL Editor" (left sidebar)
4. Click "+ New Query"

### Step 2: Copy-Paste the SQL
1. Open file: `supabase-schema-multitenant.sql` (in your project root)
2. Copy ALL the contents
3. Paste into Supabase SQL Editor

### Step 3: Execute
1. Click the "Run" button (or Ctrl+Enter)
2. Wait for completion (should take 10-30 seconds)
3. Should see: ✅ Success message (no errors)

### Step 4: Verify
1. Go to "Table Editor" in Supabase
2. You should see new tables:
   - `tenants` ✅
   - `users` ✅
   - `audit_logs` ✅
   - Plus tenant_id columns on existing tables

### Step 5: Try Login Again
1. Go back to your app
2. Try creating account again
3. Should work now! ✅

---

## 🔧 IF YOU GET ERRORS

### Error: "relation 'public.tenants' already exists"
**Fix:** The tables were already created. Just continue.

### Error: "syntax error at..."
**Fix:** Copy the SQL file again, make sure you copied it all.

### Error: "permission denied"
**Fix:** You need admin access to the Supabase project. Check you're logged in as project owner.

### Still failing?
1. Try running just the first 50 lines
2. Check for any error messages
3. Compare with `supabase-schema-multitenant.sql` in your project

---

## ⏱️ TIME TO FIX

**5 minutes total:**
- 1 min: Go to Supabase
- 1 min: Copy SQL
- 1 min: Paste into SQL Editor
- 1 min: Click Run
- 1 min: Verify tables exist

**Then your app will work!**

---

## ✅ HOW TO KNOW IT WORKED

After running SQL and refreshing your app:

1. Go back to Login page
2. Click "New company? Create Account"
3. Fill in:
   ```
   Company Name: Test Company
   Email: test@example.com
   Password: TestPassword123!
   ```
4. Click "Create Account"
5. Should see: ✅ "Account created! Check your email to verify."
6. Click "Sign In"
7. Login
8. Should see: Dashboard/Home page ✅

**If you get past the login, SQL schema is working!**

---

## 📋 WHAT HAPPENS WHEN YOU RUN SQL

The script will:

1. ✅ Create `tenants` table (companies)
2. ✅ Create `users` table (team members)
3. ✅ Create `audit_logs` table (compliance)
4. ✅ Add `tenant_id` column to campaigns, ambassadeurs, strategies
5. ✅ Create indexes for performance
6. ✅ Create RLS policies for data isolation
7. ✅ Create helper function `get_current_tenant_id()`

**Result:** Your app can now store data with complete isolation between companies

---

## 🎯 NEXT STEPS AFTER SQL

Once SQL is executed:

1. **Create 2 test accounts** (see TESTING_GUIDE.md)
2. **Verify data isolation** (Company A cannot see Company B's data)
3. **Deploy to production** (see DEPLOYMENT_GUIDE.md)

---

**Go execute the SQL NOW! Your app is waiting. ⚡**

File location: `supabase-schema-multitenant.sql`
Destination: Supabase Dashboard → SQL Editor → New Query
