-- ============================================================================
-- COMPLETE SCHEMA FIX FOR BUDGET_TOTAL & DATA REGISTRATION ISSUES
-- ============================================================================
-- This script fixes:
-- 1. budget_total column missing from strategies cache
-- 2. ambassadeurs not registering properly
-- 3. campaigns not registering properly
-- ============================================================================

-- STEP 1: DROP & RECREATE STRATEGIES TABLE WITH ALL COLUMNS
-- ============================================================================
-- Backup old data first
CREATE TABLE IF NOT EXISTS strategies_backup AS SELECT * FROM strategies;

-- Drop existing strategies table
DROP TABLE IF EXISTS strategies CASCADE;

-- Recreate strategies table with all required columns
CREATE TABLE public.strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  
  -- Basic info
  title TEXT,
  titre TEXT,
  description TEXT,
  objectifs TEXT,
  
  -- Timing
  annee INT,
  mois INT,
  semaine INT,
  date_start DATE,
  date_end DATE,
  
  -- Budget
  budget DECIMAL(12, 2),
  budget_total DECIMAL(12, 2),
  
  -- Strategy details
  canaux TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planifie', 'en-cours', 'realise')),
  versions JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_strategies_tenant_id ON strategies(tenant_id);
CREATE INDEX idx_strategies_campaign_id ON strategies(campaign_id);
CREATE INDEX idx_strategies_created_at ON strategies(created_at DESC);

-- Enable RLS
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS "Strategies - Isolate by tenant" ON public.strategies;
CREATE POLICY "Strategies - Isolate by tenant"
  ON public.strategies
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users 
      WHERE auth_id = auth.uid() 
      LIMIT 1
    )
  );

-- STEP 2: FIX AMBASSADEURS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ambassadeurs_backup AS SELECT * FROM ambassadeurs WHERE id IS NOT NULL;

DROP TABLE IF EXISTS ambassadeurs CASCADE;

CREATE TABLE public.ambassadeurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT,
  ambassadeur TEXT,
  email TEXT,
  phone TEXT,
  
  -- Channel
  canal TEXT DEFAULT 'Étudiant',
  
  -- Recruitment metrics
  filleuls_recrutes INT DEFAULT 0,
  utilisateurs_actifs INT DEFAULT 0,
  
  -- Rewards
  recompense_total DECIMAL(12, 2) DEFAULT 0,
  
  -- Comments
  commentaires TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ambassadeurs_tenant_id ON ambassadeurs(tenant_id);
CREATE INDEX idx_ambassadeurs_email ON ambassadeurs(email);
CREATE INDEX idx_ambassadeurs_created_at ON ambassadeurs(created_at DESC);

-- Enable RLS
ALTER TABLE public.ambassadeurs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS "Ambassadeurs - Isolate by tenant" ON public.ambassadeurs;
CREATE POLICY "Ambassadeurs - Isolate by tenant"
  ON public.ambassadeurs
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users 
      WHERE auth_id = auth.uid() 
      LIMIT 1
    )
  );

-- STEP 3: FIX CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns_backup AS SELECT * FROM campaigns WHERE id IS NOT NULL;

DROP TABLE IF EXISTS campaigns CASCADE;

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  action TEXT,
  
  -- Channel
  canal TEXT,
  
  -- Budget
  budget DECIMAL(12, 2),
  budget_reel DECIMAL(12, 2),
  
  -- Dates
  start_date DATE,
  end_date DATE,
  date_start DATE,
  date_end DATE,
  
  -- KPIs
  kpi_cible TEXT,
  kpi_reel TEXT,
  
  -- Performance
  roi DECIMAL(5, 2),
  
  -- Status & Owner
  etat TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  responsable TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_name ON campaigns(name);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS "Campaigns - Isolate by tenant" ON public.campaigns;
CREATE POLICY "Campaigns - Isolate by tenant"
  ON public.campaigns
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users 
      WHERE auth_id = auth.uid() 
      LIMIT 1
    )
  );

-- STEP 4: RECREATE KPI_FINANCIERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS kpi_financiers_backup AS SELECT * FROM kpi_financiers WHERE id IS NOT NULL;

DROP TABLE IF EXISTS kpi_financiers CASCADE;

CREATE TABLE public.kpi_financiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Time period
  mois INT,
  annee INT,
  
  -- Financial metrics
  revenue DECIMAL(12, 2),
  expenses DECIMAL(12, 2),
  roi DECIMAL(5, 2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_kpi_financiers_tenant_id ON kpi_financiers(tenant_id);
CREATE INDEX idx_kpi_financiers_date ON kpi_financiers(annee, mois);

-- Enable RLS
ALTER TABLE public.kpi_financiers ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS "KPI Financiers - Isolate by tenant" ON public.kpi_financiers;
CREATE POLICY "KPI Financiers - Isolate by tenant"
  ON public.kpi_financiers
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users 
      WHERE auth_id = auth.uid() 
      LIMIT 1
    )
  );

-- ============================================================================
-- RESTORE BACKUP DATA (if any exists)
-- ============================================================================
-- The following are commented out to prevent data loss during first application
-- Uncomment after verifying tables are created:
/*
-- Restore strategies
INSERT INTO strategies (id, tenant_id, campaign_id, title, description, objectifs, annee, mois, semaine, budget_total, canaux, status, created_at, updated_at)
SELECT id, tenant_id, campaign_id, titre AS title, description, objectifs, annee, mois, semaine, budget_total, canaux, COALESCE(status, 'draft'), created_at, updated_at
FROM strategies_backup
ON CONFLICT (id) DO NOTHING;

-- Restore ambassadeurs
INSERT INTO ambassadeurs (id, tenant_id, ambassadeur, email, phone, canal, filleuls_recrutes, utilisateurs_actifs, recompense_total, commentaires, status, created_at, updated_at)
SELECT id, tenant_id, ambassadeur, email, phone, COALESCE(canal, 'Étudiant'), filleuls_recrutes, utilisateurs_actifs, recompense_total, commentaires, COALESCE(status, 'active'), created_at, updated_at
FROM ambassadeurs_backup
ON CONFLICT (id) DO NOTHING;

-- Restore campaigns
INSERT INTO campaigns (id, tenant_id, name, description, action, canal, budget, budget_reel, start_date, end_date, kpi_cible, kpi_reel, roi, etat, status, responsable, created_at, updated_at)
SELECT id, tenant_id, name, description, action, canal, budget, budget_reel, start_date, end_date, kpi_cible, kpi_reel, roi, etat, COALESCE(status, 'active'), responsable, created_at, updated_at
FROM campaigns_backup
ON CONFLICT (id) DO NOTHING;

-- Restore KPI financiers
INSERT INTO kpi_financiers (id, tenant_id, mois, annee, revenue, expenses, roi, created_at, updated_at)
SELECT id, tenant_id, mois, annee, revenue, expenses, roi, created_at, updated_at
FROM kpi_financiers_backup
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the schema is correct:
/*
-- Check strategies table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'strategies' ORDER BY ordinal_position;

-- Check ambassadeurs table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'ambassadeurs' ORDER BY ordinal_position;

-- Check campaigns table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'campaigns' ORDER BY ordinal_position;

-- Test inserting data
INSERT INTO strategies (tenant_id, title, budget_total, status) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Test', 1000, 'draft');

INSERT INTO ambassadeurs (tenant_id, ambassadeur, canal, status) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Test Ambassador', 'Étudiant', 'active');

INSERT INTO campaigns (tenant_id, name, status) 
VALUES ((SELECT id FROM tenants LIMIT 1), 'Test Campaign', 'active');
*/

-- ============================================================================
-- CLEANUP NOTES
-- ============================================================================
/*
After running this script and verifying everything works:

1. To drop backup tables:
   DROP TABLE IF EXISTS strategies_backup;
   DROP TABLE IF EXISTS ambassadeurs_backup;
   DROP TABLE IF EXISTS campaigns_backup;
   DROP TABLE IF EXISTS kpi_financiers_backup;

2. The schema cache should be automatically cleared by Supabase after this script runs

3. If you still see schema cache errors:
   - Clear browser cache and localStorage
   - Sign out and sign back in
   - Restart the application

4. Testing the fix:
   - Add a new strategy with budget_total
   - Add a new ambassadeur
   - Add a new campaign
   - All should save without schema errors
*/
