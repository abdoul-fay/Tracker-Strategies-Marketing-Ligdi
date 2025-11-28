# 🚀 Deployment Guide - Budget Intelligence IA v1.2.0

## Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Vercel (gratuit) ou Netlify
- Projet Supabase configuré

## Local Development

```bash
# Installation
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Démarrer le serveur de développement
npm run dev
# Ouvrir http://localhost:5173
```

## Build for Production

```bash
npm run build
# Sortie: dist/ (793.19 kB minified)
```

## Option 1: Déployer sur Vercel ⭐ Recommandé

### Étape 1: Préparer le repo GitHub
```bash
git add .
git commit -m "feat: Budget Intelligence IA v1.2.0"
git push origin main
```

### Étape 2: Connecter à Vercel
1. Aller sur https://vercel.com
2. Cliquer "New Project"
3. Importer le repo GitHub "Tracker-Strategies-Marketing-Ligdi"
4. Cliquer "Import"

### Étape 3: Configurer les variables d'environnement
1. Dans "Environment Variables", ajouter:
   - `VITE_SUPABASE_URL`: https://your-project.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: your-anon-key

2. Cliquer "Deploy"
3. Attendre ~2 min pour la compilation
4. URL en direct: https://your-app.vercel.app

### Déploiements futurs
Chaque `git push` vers `main` déclenche automatiquement un nouveau déploiement!

## Option 2: Déployer sur Netlify

### Étape 1: Connecter GitHub
1. Aller sur https://netlify.com
2. Cliquer "New site from Git"
3. Sélectionner GitHub et le repo

### Étape 2: Configurer le build
- Build command: `npm run build`
- Publish directory: `dist`

### Étape 3: Ajouter les secrets
Dans "Site settings" → "Build & deploy" → "Environment":
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Étape 4: Déployer
Cliquer "Deploy" - Netlify fera le rest!

## Configuration Supabase

### Tables requises:
1. `campaigns` (id, nom, canal, budget, roi, reach, engagement, date_start, etc.)
2. `kpi_financiers` (id, mois, revenue, expenses, etc.)
3. `strategies` (id, nom, type, description)
4. `ambassadors` (id, nom, channel, performance)
5. `budget_recommendations` (id, campaign_id, suggestion, impact)

### Clés à récupérer:
- **URL du projet**: Settings → API → Project URL
- **Anon Key**: Settings → API → Project API keys → anon public

## Troubleshooting

### "VITE_SUPABASE_URL is not defined"
✅ Solution: Ajouter les variables d'environnement dans Vercel/Netlify

### "Build fails with 500KB warning"
✅ C'est un avertissement seulement - le déploiement fonctionne quand même

### "Campaigns not loading"
✅ Vérifier:
- Supabase URL correcte
- Clés Supabase valides
- Table `campaigns` existe et a des données
- RLS policies configurées correctement

## Features inclus dans v1.2.0

### 📊 5 Onglets d'Analyse
- **Analyse**: Health score, channel performance, ROI evolution
- **Comparatif**: Your vs Benchmark, gap analysis, recommendations
- **Prédictions**: 3-month & 6-month forecasts, 3 scenarios
- **Insights**: Key findings, action items, strategic recommendations
- **Chat IA**: Intelligent conversations with marketing context

### 🤖 AI Engine Capabilities
- Multi-temporal analysis (past/present/future)
- Performance scoring and health metrics
- Industry benchmarking (5 industries)
- Competitive strategy analysis
- Alternative tunnel recommendations
- Intent-based smart routing

### 🔧 Optimizations
- Production build: 793.19 kB (gzipped: 227.03 kB)
- Responsive design (works on mobile/tablet/desktop)
- Real-time data with Supabase
- Enhanced error handling and logging

## Monitoring après déploiement

1. **Vercel Dashboard**:
   - Voir les déploiements: https://vercel.com/dashboard
   - Analytics: Cliquer sur le projet → Analytics
   - Logs: Cliquer sur le projet → Logs

2. **Netlify Dashboard**:
   - Voir les déploiements: https://app.netlify.com
   - Logs: Site settings → Logs

## Prochaines étapes

- [ ] Configurer les domaines personnalisés
- [ ] Ajouter SSL certificate (auto avec Vercel/Netlify)
- [ ] Configurer les CI/CD pipelines
- [ ] Ajouter les webhooks Supabase
- [ ] Configurer les alertes de performance

## Support

Pour plus d'aide:
- Docs Vercel: https://vercel.com/docs
- Docs Netlify: https://docs.netlify.com
- Docs Supabase: https://supabase.com/docs
