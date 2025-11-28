/**
 * SQL pour créer/mettre à jour les tables Supabase
 * Copie-colle ça dans l'éditeur SQL de Supabase
 */

-- Table KPI Financiers (CORRECTE)
CREATE TABLE IF NOT EXISTS kpi_financiers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  mois TEXT NOT NULL,
  cible JSONB NOT NULL,
  reel JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table Strategies
CREATE TABLE IF NOT EXISTS strategies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  mois TEXT,
  annee INT,
  semaine INT,
  titre TEXT NOT NULL,
  description TEXT,
  objectifs TEXT,
  budgetTotal NUMERIC,
  canaux TEXT,
  versions JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table Ambassadeurs
CREATE TABLE IF NOT EXISTS ambassadeurs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  region TEXT,
  specialites TEXT,
  performance JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE kpi_financiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadeurs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, secure later)
CREATE POLICY "Allow all operations on kpi_financiers" ON kpi_financiers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on strategies" ON strategies
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on ambassadeurs" ON ambassadeurs
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_kpi_mois ON kpi_financiers(mois);
CREATE INDEX idx_strategies_mois ON strategies(mois);
CREATE INDEX idx_ambassadeurs_nom ON ambassadeurs(nom);
