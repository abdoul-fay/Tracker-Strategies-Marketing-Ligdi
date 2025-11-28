# 🤖 ROADMAP: BUDGET INTELLIGENCE (Version 1.2.0)

**Date:** 27 Novembre 2025  
**Status:** ✅ Prêt à commencer  
**Priority:** 🔴 HIGH

---

## 🎯 OBJECTIF PRINCIPAL

Créer une **page Budget Intelligence** avec un **système de recommandations IA** qui:
- Analyse les données historiques des campagnes
- Évalue la performance de chaque canal
- Recommande l'allocation optimale du budget par canal
- Prédit le ROI potentiel
- Génère des insights actionables

---

## 📋 SPÉCIFICATIONS DÉTAILLÉES

### Page Structure
```
BudgetIntelligence/
├── BudgetIntelligence.jsx    (Nouveau composant)
├── BudgetIntelligence.css    (Nouveau style)
└── Intégration dans App.jsx  (Navigation)
```

### Données à Analyser
```
✅ Campagnes existantes (Supabase: campaigns table)
✅ KPI Financiers (localStorage: kpiFinanciers key)
✅ Stratégies (localStorage: ligdiData key)
✅ Budget réel vs prévu (écarts)
✅ ROI par campagne
✅ Reach et Engagement par canal
```

### Canaux à Analyser (6)
```
1. Terrain
2. Radio
3. Digital
4. Influence
5. Parrainage
6. Autre
```

### Algorithme de Recommandation

#### Phase 1: Analyse de Performance
```javascript
Pour chaque canal:
  - Calculer ROI moyen historique
  - Calculer % atteint (Réel / Budget)
  - Évaluer Reach par budget dépensé
  - Score performance = (ROI + %atteint + Reach) / 3
```

#### Phase 2: Allocation Budgétaire
```javascript
Budget total disponible = XXXX FCFA

Pour chaque canal:
  - Score normalisé = (Score du canal / Somme des scores) * 100
  - Budget recommandé = (Budget total * Score normalisé) / 100
  - Delta = Budget recommandé - Budget actuel
  - % ajustement = (Delta / Budget actuel) * 100
```

#### Phase 3: Insights & Recommandations
```javascript
IF ROI > moyenne + écart-type:
  "🚀 Continuer l'investissement dans [Canal]"
ELSE IF ROI < moyenne - écart-type:
  "⚠️ Réduire investissement dans [Canal]"
ELSE:
  "📊 Maintenir investissement dans [Canal]"

IF Reach augmente > 20%:
  "📈 [Canal] gagne du terrain, augmentez budget"
ELSE IF Reach stagne < -10%:
  "📉 [Canal] perd en performance"
```

---

## 🛠️ IMPLÉMENTATION

### Étape 1: Créer le Composant

**Fichier:** `src/pages/BudgetIntelligence.jsx`

```javascript
// Structure générale
import { useState, useMemo } from 'react'
import './BudgetIntelligence.css'
import { db } from '../lib/supabase'

export default function BudgetIntelligence({ campagnes }) {
  // 1. État local
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [allocationMode, setAllocationMode] = useState('optimize') // optimize, balance, conservative
  
  // 2. Calculs (useMemo pour performance)
  const analysis = useMemo(() => analyzeChannelPerformance(campagnes), [campagnes])
  const recommendations = useMemo(() => generateRecommendations(analysis), [analysis])
  const budgetAllocation = useMemo(() => calculateOptimalAllocation(analysis, allocationMode), [analysis, allocationMode])
  
  // 3. Render
  return (
    <div className="budget-intelligence">
      {/* Header */}
      {/* Filters & Controls */}
      {/* Performance Analysis Cards */}
      {/* Channel Performance Breakdown */}
      {/* Budget Allocation Recommendations */}
      {/* ROI Prediction Chart */}
      {/* Insights & Actions */}
      {/* Implementation Plan */}
    </div>
  )
}

// Helper functions
function analyzeChannelPerformance(campagnes) { /* ... */ }
function generateRecommendations(analysis) { /* ... */ }
function calculateOptimalAllocation(analysis, mode) { /* ... */ }
```

### Étape 2: Créer les Functions Utilitaires

**Fichier:** `src/lib/budgetIntelligence.js`

```javascript
// Analyse de performance par canal
export function analyzeChannelPerformance(campagnes) {
  const channels = {}
  
  // Grouper par canal
  campagnes.forEach(camp => {
    const canal = camp.canal || 'Autre'
    if (!channels[canal]) {
      channels[canal] = {
        campaigns: [],
        totalBudget: 0,
        totalReal: 0,
        totalROI: 0,
        totalReach: 0,
        count: 0
      }
    }
    channels[canal].campaigns.push(camp)
    channels[canal].totalBudget += camp.budget || 0
    channels[canal].totalReal += camp.budget_reel || 0
    channels[canal].totalROI += camp.roi || 0
    channels[canal].totalReach += camp.reach || 0
    channels[canal].count += 1
  })
  
  // Calculer les moyennes et scores
  Object.keys(channels).forEach(canal => {
    const data = channels[canal]
    data.avgROI = data.totalROI / data.count
    data.avgPercentAtteint = (data.totalReal / data.totalBudget) * 100
    data.reachPerBudget = data.totalReach / data.totalBudget
    
    // Score global (0-100)
    data.performanceScore = (
      (data.avgROI / 100) * 40 +           // 40% poids ROI
      ((data.avgPercentAtteint / 100)) * 30 +  // 30% poids % atteint
      (Math.min(data.reachPerBudget / 100, 1)) * 30 // 30% poids reach
    ) * 100
  })
  
  return channels
}

// Générer les recommandations
export function generateRecommendations(analysis) {
  const recommendations = []
  const avgPerformance = Object.values(analysis).reduce((sum, c) => sum + c.performanceScore, 0) / Object.keys(analysis).length
  
  Object.entries(analysis).forEach(([canal, data]) => {
    // Logique de recommandation
    if (data.performanceScore > avgPerformance * 1.2) {
      recommendations.push({
        canal,
        action: 'AUGMENTER',
        reason: `${canal} dépasse la performance moyenne de ${(data.performanceScore - avgPerformance).toFixed(0)}%`,
        priority: 'HIGH',
        amount: Math.round(data.totalBudget * 0.15) // +15%
      })
    } else if (data.performanceScore < avgPerformance * 0.8) {
      recommendations.push({
        canal,
        action: 'RÉDUIRE',
        reason: `${canal} est sous-performant de ${(avgPerformance - data.performanceScore).toFixed(0)}%`,
        priority: 'MEDIUM',
        amount: Math.round(data.totalBudget * 0.10) // -10%
      })
    } else {
      recommendations.push({
        canal,
        action: 'MAINTENIR',
        reason: `${canal} maintient une performance stable`,
        priority: 'LOW',
        amount: 0
      })
    }
  })
  
  return recommendations
}

// Calculer l'allocation optimale
export function calculateOptimalAllocation(analysis, mode = 'optimize') {
  const totalBudget = Object.values(analysis).reduce((sum, c) => sum + c.totalBudget, 0)
  const allocation = {}
  
  // Normaliser les scores
  const scores = Object.entries(analysis).map(([canal, data]) => ({
    canal,
    score: data.performanceScore
  }))
  
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
  
  scores.forEach(({ canal, score }) => {
    let percentage = (score / totalScore) * 100
    
    // Ajuster selon le mode
    if (mode === 'balance') {
      // Distribution plus équilibrée (plateau vers 20% chacun)
      percentage = percentage * 0.7 + 16.7
    } else if (mode === 'conservative') {
      // Distribution plus conservatrice
      percentage = percentage * 0.9 + 5
    }
    
    allocation[canal] = {
      percentage: Math.round(percentage * 100) / 100,
      amount: Math.round((percentage / 100) * totalBudget),
      current: analysis[canal].totalBudget,
      delta: Math.round((percentage / 100) * totalBudget) - analysis[canal].totalBudget
    }
  })
  
  return allocation
}

// Prédire le ROI
export function predictROI(allocation, analysis, growthFactor = 1.15) {
  const predictions = {}
  
  Object.entries(allocation).forEach(([canal, alloc]) => {
    const current = analysis[canal]
    const budgetIncrease = alloc.percentage / (current.totalBudget / (current.totalBudget + Object.values(allocation).reduce((sum, a) => sum + a.delta, 0)))
    
    predictions[canal] = {
      currentROI: current.avgROI,
      predictedROI: current.avgROI * (1 + ((alloc.delta / current.totalBudget) * growthFactor)),
      improvement: (current.avgROI * (1 + ((alloc.delta / current.totalBudget) * growthFactor))) - current.avgROI
    }
  })
  
  return predictions
}
```

### Étape 3: Créer le CSS

**Fichier:** `src/pages/BudgetIntelligence.css`

```css
.budget-intelligence {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
}

.budget-intelligence h1 {
  color: #6366f1;
  font-size: 2rem;
  margin-bottom: 32px;
  font-weight: 800;
}

/* Cards de performance */
.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.performance-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(60, 60, 120, 0.08);
  border-left: 4px solid #6366f1;
  transition: all 0.3s ease;
}

.performance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(60, 60, 120, 0.12);
}

/* Recommandations */
.recommendations-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(60, 60, 120, 0.08);
  margin-bottom: 32px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  background: #f8fafc;
  border-left: 4px solid;
}

.recommendation-item.high {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.recommendation-item.medium {
  border-left-color: #f59e0b;
  background: #fffbf0;
}

.recommendation-item.low {
  border-left-color: #10b981;
  background: #f0fdf4;
}

/* Budget allocation chart */
.allocation-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(60, 60, 120, 0.08);
}

/* ... Ajouter plus de styles selon besoin ... */
```

### Étape 4: Intégrer dans App.jsx

**Modification:** `src/App.jsx`

```javascript
import BudgetIntelligence from './pages/BudgetIntelligence'

// Dans le return:
{currentPage === 'intelligence' && <BudgetIntelligence campagnes={campagnes} />}
```

### Étape 5: Ajouter Navbar Link

**Modification:** `src/components/Navbar.jsx`

```javascript
<li>
  <button 
    className={`nav-link ${currentPage === 'intelligence' ? 'active' : ''}`}
    onClick={() => setCurrentPage('intelligence')}
  >
    🤖 Budget Intelligence
  </button>
</li>
```

---

## 📊 AFFICHAGES DANS LA PAGE

### 1. Performance Summary Cards
```
┌─────────────────────────────────────────────────────┐
│  Canal Name    │ ROI Avg │ % Atteint │ Score │ Trend│
├─────────────────────────────────────────────────────┤
│  Digital       │  45%    │   92%     │  87   │  ⬆️  │
│  Radio         │  35%    │   78%     │  65   │  ⬆️  │
│  Influence     │  50%    │   88%     │  92   │  ⬆️  │
│  Terrain       │  25%    │   65%     │  45   │  ⬇️  │
│  Parrainage    │  55%    │   95%     │  98   │  ⬆️  │
│  Autre         │  20%    │   50%     │  30   │  ⬇️  │
└─────────────────────────────────────────────────────┘
```

### 2. Recommandations Prioritisées
```
🔴 HIGH - AUGMENTER Influence
   Raison: Dépasse performance moyenne de 25%
   Budget actuel: 150,000 FCFA → Recommandé: 172,500 FCFA (+15%)

🟠 MEDIUM - RÉDUIRE Terrain
   Raison: Sous-performant de 35%
   Budget actuel: 200,000 FCFA → Recommandé: 180,000 FCFA (-10%)

🟢 LOW - MAINTENIR Digital
   Raison: Performance stable
   Budget actuel: 300,000 FCFA → Recommandé: 310,000 FCFA (±0%)
```

### 3. Allocation Budgétaire Optimale
```
Mode: Optimisé (Maximize ROI)

Digital      : 22% (330,000 FCFA)   [Actuellement: 300,000]
Influence    : 28% (420,000 FCFA)   [Actuellement: 150,000]
Parrainage   : 25% (375,000 FCFA)   [Actuellement: 250,000]
Radio        : 15% (225,000 FCFA)   [Actuellement: 200,000]
Terrain      : 8%  (120,000 FCFA)   [Actuellement: 200,000]
Autre        : 2%  (30,000 FCFA)    [Actuellement: 100,000]
─────────────────────────────────────────
TOTAL        : 100% (1,500,000 FCFA)
```

### 4. ROI Prediction Chart
```
BarChart: Current ROI vs Predicted ROI

Digital:    40% → 46% (+6%)
Influence:  50% → 55% (+5%)
Parrainage: 55% → 58% (+3%)
Radio:      35% → 38% (+3%)
Terrain:    25% → 23% (-2%)
Autre:      20% → 18% (-2%)
```

### 5. Insights Section
```
💡 KEY INSIGHTS:

✅ Influence et Parrainage sont vos meilleurs ROI
   Augmentez l'allocation pour maximiser gains

⚠️ Terrain en déclin
   Considérez réallocation vers Digital & Influence

📈 Digital croissance potentielle
   +5% d'augmentation budget → +6% de ROI

💰 Économies potentielles
   En optimisant allocation: +8% de ROI global
```

---

## 🧪 TESTS À EFFECTUER

```javascript
✅ Affichage correct des données
✅ Calculs de scores corrects
✅ Recommandations logiques
✅ Graphiques interactifs
✅ Responsive design
✅ Performance avec beaucoup de campagnes
✅ Changement de modes d'allocation
✅ Export recommandations possible
```

---

## 📅 TIMELINE ESTIMÉE

| Phase | Durée | Effort |
|-------|-------|--------|
| **Design & Specs** | 1 jour | 4h |
| **Implementation** | 2 jours | 12h |
| **Testing** | 1 jour | 6h |
| **Documentation** | 0.5 jours | 2h |
| **Total** | **4-5 jours** | **24h** |

---

## 📝 CHECKLIST DE LANCEMENT

- [ ] Créer BudgetIntelligence.jsx
- [ ] Créer budgetIntelligence.js (helpers)
- [ ] Créer BudgetIntelligence.css
- [ ] Intégrer dans App.jsx
- [ ] Ajouter route Navbar
- [ ] Tester toutes les fonctionnalités
- [ ] Valider calculs
- [ ] Documenter page
- [ ] Push sur GitHub
- [ ] Tag v1.2.0

---

## 🎯 RÉSULTAT FINAL

Une **page Budget Intelligence** qui:
- Analyse performance par canal
- Recommande allocation optimale
- Prédit ROI potentiel
- Génère insights actionables
- Aide la prise de décision

**Impact:** ➕ 5-10% de ROI potentiel en optimisant allocation budgétaire!

---

**Prêt à commencer?** 🚀

Suivre cette roadmap pour implémenter Budget Intelligence v1.2.0
