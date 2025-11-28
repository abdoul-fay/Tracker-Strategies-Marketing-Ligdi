/**
 * SQL pour SUPPRIMER et RECRÉER les tables correctement
 * COPIE-COLLE DANS SUPABASE SQL EDITOR
 */

-- SUPPRIMER les anciennes tables
DROP TABLE IF EXISTS kpi_financiers CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;
DROP TABLE IF EXISTS ambassadeurs CASCADE;

-- RECRÉER les tables CORRECTEMENT

-- Table KPI Financiers
CREATE TABLE kpi_financiers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  mois TEXT NOT NULL,
  cible JSONB NOT NULL DEFAULT '{}',
  reel JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table Strategies
CREATE TABLE strategies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  mois TEXT,
  annee INT,
  semaine INT,
  titre TEXT NOT NULL,
  description TEXT,
  objectifs TEXT,
  budgetTotal NUMERIC,
  canaux TEXT,
  versions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table Ambassadeurs
CREATE TABLE ambassadeurs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  region TEXT,
  specialites TEXT,
  performance JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE kpi_financiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadeurs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all)
CREATE POLICY "Allow all operations on kpi_financiers" ON kpi_financiers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on strategies" ON strategies
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on ambassadeurs" ON ambassadeurs
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_kpi_mois ON kpi_financiers(mois);
CREATE INDEX idx_strategies_mois ON strategies(mois);
CREATE INDEX idx_ambassadeurs_nom ON ambassadeurs(nom);
