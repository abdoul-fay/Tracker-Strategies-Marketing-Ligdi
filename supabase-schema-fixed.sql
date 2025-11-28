/**
 * SQL CORRIGÉ - Colonnes SANS accents, en snake_case
 * COPIE-COLLE DANS SUPABASE SQL EDITOR
 */

-- SUPPRIMER les anciennes tables
DROP TABLE IF EXISTS kpi_financiers CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;
DROP TABLE IF EXISTS ambassadeurs CASCADE;

-- ============ TABLE KPI FINANCIERS ============
CREATE TABLE kpi_financiers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  mois TEXT NOT NULL,
  cible JSONB NOT NULL DEFAULT '{}',
  reel JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ TABLE STRATEGIES ============
CREATE TABLE strategies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  mois TEXT,
  annee INT,
  semaine INT,
  titre TEXT NOT NULL,
  description TEXT,
  objectifs TEXT,
  budget_total NUMERIC,
  canaux TEXT,
  versions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ TABLE AMBASSADEURS ============
CREATE TABLE ambassadeurs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ambassadeur TEXT NOT NULL,
  canal TEXT DEFAULT 'Étudiant',
  filleuls_recrutes INT DEFAULT 0,
  utilisateurs_actifs INT DEFAULT 0,
  recompense_total INT DEFAULT 0,
  commentaires TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ ENABLE RLS ============
ALTER TABLE kpi_financiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadeurs ENABLE ROW LEVEL SECURITY;

-- ============ CREATE POLICIES ============
CREATE POLICY "Allow all operations on kpi_financiers" ON kpi_financiers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on strategies" ON strategies
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on ambassadeurs" ON ambassadeurs
  FOR ALL USING (true) WITH CHECK (true);

-- ============ CREATE INDEXES ============
CREATE INDEX idx_kpi_mois ON kpi_financiers(mois);
CREATE INDEX idx_strategies_mois ON strategies(mois);
CREATE INDEX idx_ambassadeurs_canal ON ambassadeurs(canal);
