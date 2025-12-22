-- ============================================================================
-- FIX NUMERIC FIELD OVERFLOW IN CAMPAIGNS TABLE
-- ============================================================================
-- The roi column is DECIMAL(5, 2) which limits values to max 999.99
-- This causes "numeric field overflow" errors when saving ROI values
-- Run this SQL in Supabase to fix the limits
-- ============================================================================

-- Step 1: Check current column types
-- SELECT column_name, data_type, numeric_precision, numeric_scale 
-- FROM information_schema.columns 
-- WHERE table_name = 'campaigns' AND column_name IN ('roi', 'budget_reel', 'budget');

-- Step 2: Alter roi column from DECIMAL(5, 2) to DECIMAL(12, 2)
-- This allows values up to 9,999,999,999.99 instead of 999.99
ALTER TABLE public.campaigns 
  ALTER COLUMN roi SET DATA TYPE DECIMAL(12, 2);

-- Step 3: Ensure budget_reel is also DECIMAL(12, 2)
ALTER TABLE public.campaigns 
  ALTER COLUMN budget_reel SET DATA TYPE DECIMAL(12, 2);

-- Step 4: Verify the changes
-- SELECT column_name, data_type, numeric_precision, numeric_scale 
-- FROM information_schema.columns 
-- WHERE table_name = 'campaigns' 
-- ORDER BY ordinal_position;

COMMIT;
