-- ============================================================================
-- CREATE KPI SETTINGS TABLE IN SUPABASE
-- ============================================================================
-- Stocke les paramètres KPI par tenant (pour que chaque client ait ses propres seuils)
-- Exécutez ce SQL dans Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kpi_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Objectifs de performance
  roi_target DECIMAL(10, 2) DEFAULT 200,
  reach_target INTEGER DEFAULT 10000,
  budget_max_per_campaign DECIMAL(12, 2) DEFAULT 100000,
  budget_max_global DECIMAL(12, 2) DEFAULT 500000,
  engagement_target DECIMAL(5, 2) DEFAULT 5,
  cost_per_result_max DECIMAL(10, 2) DEFAULT 50,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Assurer qu'un seul paramètre par tenant
  UNIQUE(tenant_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_kpi_settings_tenant_id ON public.kpi_settings(tenant_id);

-- Enable RLS on kpi_settings
ALTER TABLE public.kpi_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see KPI settings from their tenant
DROP POLICY IF EXISTS "KPI Settings - Isolate by tenant" ON public.kpi_settings;
CREATE POLICY "KPI Settings - Isolate by tenant"
  ON public.kpi_settings
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users 
      WHERE auth_id = auth.uid() 
      LIMIT 1
    )
  );

COMMIT;
