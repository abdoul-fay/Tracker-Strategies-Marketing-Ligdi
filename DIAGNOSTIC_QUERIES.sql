-- ============================================================================
-- DIAGNOSTIC & TESTING SCRIPT
-- ============================================================================
-- Use this script to verify the schema fix worked correctly
-- Run each section separately in Supabase SQL Editor
-- ============================================================================

-- SECTION 1: VERIFY TABLE STRUCTURES
-- ============================================================================
-- Run this to verify all tables have the correct columns

-- Check strategies table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'strategies' 
ORDER BY ordinal_position;

-- Should show: budget_total column exists and is NUMERIC/DECIMAL

---

-- Check ambassadeurs table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'ambassadeurs' 
ORDER BY ordinal_position;

-- Should show: ambassadeur, filleuls_recrutes, utilisateurs_actifs, recompense_total

---

-- Check campaigns table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
ORDER BY ordinal_position;

-- Should show: name, action, budget, budget_reel, date_start, date_end, kpi_cible, kpi_reel

---

-- SECTION 2: VERIFY RLS IS ENABLED
-- ============================================================================
-- Run this to confirm Row-Level Security is active

SELECT 
  tablename, 
  rowsecurity,
  relpersistence
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('strategies', 'ambassadeurs', 'campaigns', 'kpi_financiers')
ORDER BY tablename;

-- Should show: rowsecurity = true for all tables

---

-- SECTION 3: VERIFY INDEXES EXIST
-- ============================================================================
-- Run this to check if performance indexes are in place

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('strategies', 'ambassadeurs', 'campaigns')
ORDER BY tablename, indexname;

-- Should show multiple indexes per table, including tenant_id indexes

---

-- SECTION 4: CHECK ROW COUNT PER TABLE
-- ============================================================================
-- Run this to see how much data is in each table

SELECT 
  'strategies' as table_name,
  COUNT(*) as row_count
FROM strategies
UNION ALL
SELECT 
  'ambassadeurs' as table_name,
  COUNT(*) as row_count
FROM ambassadeurs
UNION ALL
SELECT 
  'campaigns' as table_name,
  COUNT(*) as row_count
FROM campaigns
UNION ALL
SELECT 
  'kpi_financiers' as table_name,
  COUNT(*) as row_count
FROM kpi_financiers
ORDER BY table_name;

---

-- SECTION 5: TEST INSERT - STRATEGY
-- ============================================================================
-- Run this to verify you can insert a strategy with budget_total

-- First get a valid tenant_id
WITH tenant AS (
  SELECT id FROM tenants LIMIT 1
)
INSERT INTO strategies (
  tenant_id,
  title,
  description,
  annee,
  mois,
  semaine,
  budget_total,
  canaux,
  status
) VALUES (
  (SELECT id FROM tenant),
  'TEST Strategy - ' || NOW()::text,
  'This is a test strategy for schema verification',
  2025,
  3,
  1,
  1000000,
  'Digital',
  'draft'
)
RETURNING id, title, budget_total, created_at;

-- Expected: Returns a record with budget_total = 1000000

---

-- SECTION 6: TEST INSERT - AMBASSADEUR
-- ============================================================================
-- Run this to verify you can insert an ambassadeur

WITH tenant AS (
  SELECT id FROM tenants LIMIT 1
)
INSERT INTO ambassadeurs (
  tenant_id,
  ambassadeur,
  canal,
  filleuls_recrutes,
  utilisateurs_actifs,
  recompense_total,
  commentaires,
  status
) VALUES (
  (SELECT id FROM tenant),
  'TEST Ambassador - ' || NOW()::text,
  'Étudiant',
  50,
  25,
  10000,
  'This is a test record',
  'active'
)
RETURNING id, ambassadeur, filleuls_recrutes, recompense_total;

-- Expected: Returns a record with all the values you inserted

---

-- SECTION 7: TEST INSERT - CAMPAIGN
-- ============================================================================
-- Run this to verify you can insert a campaign

WITH tenant AS (
  SELECT id FROM tenants LIMIT 1
)
INSERT INTO campaigns (
  tenant_id,
  name,
  action,
  canal,
  budget,
  budget_reel,
  kpi_cible,
  kpi_reel,
  date_start,
  date_end,
  status
) VALUES (
  (SELECT id FROM tenant),
  'TEST Campaign - ' || NOW()::text,
  'Distribution',
  'Terrain',
  100000,
  95000,
  '5000',
  '5200',
  NOW()::date,
  (NOW() + interval '30 days')::date,
  'active'
)
RETURNING id, name, budget, budget_reel, kpi_cible;

-- Expected: Returns a campaign record with all values

---

-- SECTION 8: VERIFY DATA ISOLATION (RLS)
-- ============================================================================
-- Run this as an authenticated user to verify only their tenant's data is visible

-- Create a test user if needed:
-- (This requires admin access in Supabase Auth settings)

-- Then run this to see what data a user can access:
SELECT 
  'Strategies visible to current user:' as info,
  COUNT(*) as count
FROM strategies
WHERE tenant_id = (
  SELECT tenant_id FROM users 
  WHERE auth_id = auth.uid() 
  LIMIT 1
);

SELECT 
  'Ambassadeurs visible to current user:' as info,
  COUNT(*) as count
FROM ambassadeurs
WHERE tenant_id = (
  SELECT tenant_id FROM users 
  WHERE auth_id = auth.uid() 
  LIMIT 1
);

SELECT 
  'Campaigns visible to current user:' as info,
  COUNT(*) as count
FROM campaigns
WHERE tenant_id = (
  SELECT tenant_id FROM users 
  WHERE auth_id = auth.uid() 
  LIMIT 1
);

---

-- SECTION 9: CHECK FOR DUPLICATES/ORPHANS
-- ============================================================================
-- Run this to find any data integrity issues

-- Find strategies with null tenant_id
SELECT COUNT(*) as strategies_with_null_tenant
FROM strategies
WHERE tenant_id IS NULL;

-- Find ambassadeurs with null tenant_id
SELECT COUNT(*) as ambassadeurs_with_null_tenant
FROM ambassadeurs
WHERE tenant_id IS NULL;

-- Find campaigns with null tenant_id
SELECT COUNT(*) as campaigns_with_null_tenant
FROM campaigns
WHERE tenant_id IS NULL;

-- All should return 0

---

-- SECTION 10: PERFORMANCE CHECK
-- ============================================================================
-- Run this to analyze query performance

-- Check if indexes are being used effectively
EXPLAIN ANALYZE
SELECT * FROM strategies 
WHERE tenant_id = (SELECT id FROM tenants LIMIT 1)
ORDER BY created_at DESC
LIMIT 10;

-- Should show: Index Scan (good), not Seq Scan (bad)

---

-- SECTION 11: LIST BACKUP TABLES
-- ============================================================================
-- Run this to see if backup tables exist

SELECT 
  tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%_backup'
ORDER BY tablename;

-- Should show: strategies_backup, ambassadeurs_backup, campaigns_backup, kpi_financiers_backup
-- These can be deleted after verifying new tables work

---

-- SECTION 12: CLEAN UP BACKUP TABLES (OPTIONAL)
-- ============================================================================
-- Run this ONLY after confirming everything works

-- Drop backup tables
DROP TABLE IF EXISTS strategies_backup;
DROP TABLE IF EXISTS ambassadeurs_backup;
DROP TABLE IF EXISTS campaigns_backup;
DROP TABLE IF EXISTS kpi_financiers_backup;

-- Confirm they're deleted
SELECT 
  tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%_backup';

-- Should return no results

---

-- SECTION 13: FULL SCHEMA VERIFICATION REPORT
-- ============================================================================
-- Run this entire block to get a complete status report

WITH table_info AS (
  SELECT 
    'strategies' as table_name,
    COUNT(*) as record_count,
    (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'strategies'
    ) as column_count
  FROM strategies
  UNION ALL
  SELECT 
    'ambassadeurs' as table_name,
    COUNT(*) as record_count,
    (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'ambassadeurs'
    ) as column_count
  FROM ambassadeurs
  UNION ALL
  SELECT 
    'campaigns' as table_name,
    COUNT(*) as record_count,
    (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns'
    ) as column_count
  FROM campaigns
  UNION ALL
  SELECT 
    'kpi_financiers' as table_name,
    COUNT(*) as record_count,
    (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'kpi_financiers'
    ) as column_count
  FROM kpi_financiers
)
SELECT * FROM table_info ORDER BY table_name;

-- ============================================================================
-- DEBUGGING TIPS
-- ============================================================================
/*

If you see errors, here's what to check:

1. "Table does not exist"
   → Run the complete schema fix script again
   → Wait 30 seconds for Supabase to sync

2. "Column does not exist"
   → Check Table Structure (Section 1)
   → May need to restart browser and re-login

3. "Permission denied" or "RLS violation"
   → You may not have a valid tenant_id
   → Check that you're logged in
   → Run verification at line: SELECT get_current_tenant_id();

4. "Syntax error" in INSERT statements
   → Copy/paste error
   → Try running one INSERT at a time
   → Check all values are properly quoted

5. "Too many rows" or slow queries
   → The data set may be large
   → Increase LIMIT in SELECT queries
   → Indexes should help (see Section 10)

6. Schema cache still showing old structure
   → Clear browser cache: localStorage.clear()
   → Sign out and sign back in
   → Wait 60 seconds for Supabase sync
   → Restart browser completely

*/

-- ============================================================================
-- END OF DIAGNOSTIC SCRIPT
-- ============================================================================
