/**
 * Système d'alertes adaptatif
 * Les seuils d'alerte s'adaptent selon:
 * 1. Les KPI cibles fixés par l'utilisateur
 * 2. L'historique des campagnes (ROI, performances)
 * 3. Le budget prévu vs résultats obtenus
 */

/**
 * Calcule les seuils d'alerte adaptatifs basé sur l'historique
 * @param {Array} campagnes - Liste des campagnes historiques
 * @param {Object} kpiTargets - KPI cibles (ex: {roi: 300, reach: 50000, ...} ou {roiTarget: 300, reachTarget: 50000, ...})
 * @returns {Object} Seuils adaptatifs
 */
export function calculateAdaptiveThresholds(campagnes = [], kpiTargets = {}) {
  console.log('🔍 calculateAdaptiveThresholds - Campagnes:', campagnes.length, campagnes)
  
  // Normaliser les noms de champs (Supabase ou JS)
  const normalizeTargets = (targets) => ({
    roi: targets.roiTarget || targets.roi_target || targets.roi || 0,
    reach: targets.reachTarget || targets.reach_target || targets.reach || 0,
    budgetPerCampaign: targets.budgetMaxPerCampaign || targets.budget_max_per_campaign || targets.budgetPerCampaign || 0,
    budgetGlobal: targets.budgetMaxGlobal || targets.budget_max_global || targets.budgetGlobal || 0
  })
  
  const normalizedTargets = normalizeTargets(kpiTargets)
  
  if (campagnes.length === 0) {
    console.log('❌ Aucune campagne, retour des seuils par défaut')
    return getDefaultThresholds()
  }

  // Analyse de l'historique
  const budgets = campagnes.map(c => c.budget || 0).filter(b => b > 0)
  const rois = campagnes.map(c => c.roi || 0).filter(r => r >= 0)
  const reaches = campagnes.map(c => c.reach || 0).filter(r => r > 0)

  console.log('📊 Budgets trouvés:', budgets, 'Rois:', rois, 'Reaches:', reaches)

  const avgBudget = budgets.length > 0 ? budgets.reduce((a, b) => a + b, 0) / budgets.length : 0
  const avgROI = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : 0
  const avgReach = reaches.length > 0 ? reaches.reduce((a, b) => a + b, 0) / reaches.length : 0
  const maxBudget = budgets.length > 0 ? Math.max(...budgets) : 0

  console.log('📈 Moyennes - Budget:', avgBudget, 'ROI:', avgROI, 'Reach:', avgReach, 'Max Budget:', maxBudget)

  // Calcul dynamique des seuils
  const budgetThreshold = Math.max(maxBudget * 1.15, avgBudget * 1.3)
  const globalThreshold = Math.max(maxBudget * campagnes.length * 0.7, avgBudget * campagnes.length * 1.3)
  
  const thresholds = {
    // Budget: utiliser les targets si disponibles, sinon utiliser l'historique
    budgetPerCampaign: normalizedTargets.budgetPerCampaign || budgetThreshold,
    budgetGlobal: normalizedTargets.budgetGlobal || globalThreshold,
    
    // ROI: basé sur l'objectif - 20% de tolérance
    roiMin: (normalizedTargets.roi || avgROI * 0.8) * 0.8,
    roiTarget: normalizedTargets.roi || avgROI,
    
    // Reach: basé sur l'objectif - 15% de tolérance
    reachMin: (normalizedTargets.reach || avgReach * 0.85) * 0.85,
    reachTarget: normalizedTargets.reach || avgReach,
    
    // Efficacité: coût par résultat
    costPerResultMax: avgBudget / Math.max(avgReach, 1) * 1.5,
    
    // Variance acceptable (écart-type)
    budgetVarianceMax: calculateStdDev(budgets) * 1.5
  }

  console.log('✅ Seuils calculés:', thresholds)
  return thresholds
}

/**
 * Génère les alertes basées sur les seuils adaptatifs
 * @param {Array} campagnes - Toutes les campagnes
 * @param {Object} thresholds - Seuils adaptatifs
 * @returns {Array} Alertes intelligentes
 */
export function generateAdaptiveAlerts(campagnes = [], thresholds = {}) {
  const alerts = []

  if (campagnes.length === 0) {
    return alerts
  }

  // Utiliser les seuils fournis, sinon utiliser les defaults
  const finalThresholds = thresholds && Object.keys(thresholds).length > 0 
    ? thresholds 
    : getDefaultThresholds()

  // Analyser chaque campagne
  campagnes.forEach(campagne => {
    const budget = campagne.budget || 0
    const roi = campagne.roi || 0
    const reach = campagne.reach || 0
    const name = campagne.nom || 'Sans nom'

    // Alerte 1: Budget anormalement élevé
    if (budget > finalThresholds.budgetPerCampaign) {
      const excess = ((budget - finalThresholds.budgetPerCampaign) / finalThresholds.budgetPerCampaign * 100).toFixed(1)
      alerts.push({
        type: 'budget_high',
        severity: excess > 50 ? 'high' : 'medium',
        campaign: name,
        message: `⚠️ Budget élevé: ${budget.toLocaleString('fr-FR')} FCFA (+${excess}% vs seuil)`,
        value: budget,
        threshold: finalThresholds.budgetPerCampaign,
        explanation: `Budget dépasse le seuil adaptatif (seuil: ${finalThresholds.budgetPerCampaign.toLocaleString('fr-FR')} FCFA)`
      })
    }

    // Alerte 2: ROI faible (ne cible pas l'objectif)
    if (roi > 0 && roi < finalThresholds.roiMin) {
      alerts.push({
        type: 'roi_low',
        severity: 'high',
        campaign: name,
        message: `📉 ROI faible: ${roi.toFixed(1)}% (cible: ${finalThresholds.roiTarget.toFixed(1)}%)`,
        value: roi,
        threshold: finalThresholds.roiTarget,
        explanation: `ROI inférieur à l'objectif adaptatif. Stratégie à revoir.`
      })
    }

    // Alerte 3: Reach faible
    if (reach > 0 && reach < finalThresholds.reachMin) {
      alerts.push({
        type: 'reach_low',
        severity: 'medium',
        campaign: name,
        message: `👥 Reach faible: ${reach.toLocaleString('fr-FR')} (cible: ${finalThresholds.reachTarget.toLocaleString('fr-FR')})`,
        value: reach,
        threshold: finalThresholds.reachTarget,
        explanation: `Portée inférieure au seuil adaptatif. Augmentez la visibilité ou le budget.`
      })
    }

    // Alerte 4: Coût par résultat élevé
    if (reach > 0 && budget > 0) {
      const costPerResult = budget / reach
      if (costPerResult > finalThresholds.costPerResultMax) {
        alerts.push({
          type: 'efficiency_low',
          severity: 'medium',
          campaign: name,
          message: `💰 Efficacité faible: ${costPerResult.toFixed(2)} FCFA/résultat`,
          value: costPerResult,
          threshold: finalThresholds.costPerResultMax,
          explanation: `Coût par résultat dépasse le seuil adaptatif (${finalThresholds.costPerResultMax.toFixed(2)} FCFA max)`
        })
      }
    }
  })

  // Alertes globales
  const totalBudget = campagnes.reduce((sum, c) => sum + (c.budget || 0), 0)
  const avgROI = campagnes.length > 0 
    ? campagnes.reduce((sum, c) => sum + (c.roi || 0), 0) / campagnes.length 
    : 0

  // Alerte: Budget global dépassé
  if (totalBudget > finalThresholds.budgetGlobal) {
    const excess = ((totalBudget - finalThresholds.budgetGlobal) / finalThresholds.budgetGlobal * 100).toFixed(1)
    alerts.push({
      type: 'budget_global_high',
      severity: 'high',
      campaign: 'Global',
      message: `📊 Budget global élevé: ${totalBudget.toLocaleString('fr-FR')} FCFA (+${excess}%)`,
      value: totalBudget,
      threshold: finalThresholds.budgetGlobal,
      explanation: `Le budget total dépasse le seuil adaptatif basé sur votre historique (${finalThresholds.budgetGlobal.toLocaleString('fr-FR')} FCFA).`
    })
  }

  // Alerte: Performance globale faible
  if (avgROI < finalThresholds.roiMin) {
    alerts.push({
      type: 'performance_global_low',
      severity: 'high',
      campaign: 'Global',
      message: `📉 ROI moyen faible: ${avgROI.toFixed(1)}% (cible: ${finalThresholds.roiTarget.toFixed(1)}%)`,
      value: avgROI,
      threshold: finalThresholds.roiTarget,
      explanation: `Les performances globales ne répondent pas aux objectifs adaptatifs.`
    })
  }

  return alerts
}

/**
 * Évalue si une stratégie a atteint les objectifs
 * @param {Object} campagne - La campagne à évaluer
 * @param {Object} targets - Les objectifs cibles
 * @returns {Object} Évaluation stratégie
 */
export function evaluateStrategySuccess(campagne, targets = {}) {
  const { budget, roi, reach, engagement } = campagne
  const { roiTarget = 200, reachTarget = 10000, budgetMax = 100000 } = targets

  const results = {
    budgetOK: !budget || budget <= budgetMax,
    roiOK: roi && roi >= roiTarget * 0.8, // 80% de l'objectif = succès
    reachOK: reach && reach >= reachTarget * 0.8,
    overallSuccess: false,
    successRate: 0,
    recommendations: []
  }

  let successCount = 0
  let totalCriteria = 0

  // Vérifier chaque critère
  if (budget !== undefined) {
    totalCriteria++
    if (results.budgetOK) successCount++
    else results.recommendations.push(`Réduire le budget (actuel: ${budget}, max: ${budgetMax})`)
  }

  if (roi !== undefined) {
    totalCriteria++
    if (results.roiOK) successCount++
    else results.recommendations.push(`Améliorer le ROI (actuel: ${roi}%, cible: ${roiTarget}%)`)
  }

  if (reach !== undefined) {
    totalCriteria++
    if (results.reachOK) successCount++
    else results.recommendations.push(`Augmenter la portée (actuelle: ${reach}, cible: ${reachTarget})`)
  }

  // Succès = 2/3 critères atteints minimum
  results.successRate = totalCriteria > 0 ? (successCount / totalCriteria * 100) : 0
  results.overallSuccess = successCount >= Math.ceil(totalCriteria * 0.66)

  return results
}

/**
 * Calcule l'écart-type d'un array
 */
function calculateStdDev(values) {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Seuils par défaut si aucune historique
 */
function getDefaultThresholds() {
  return {
    budgetPerCampaign: 100000,      // 100k FCFA par campagne
    budgetGlobal: 500000,            // 500k FCFA global
    roiMin: 100,                     // ROI minimum 100%
    roiTarget: 200,                  // ROI cible 200%
    reachMin: 5000,                  // Reach minimum 5k
    reachTarget: 10000,              // Reach cible 10k
    costPerResultMax: 50,            // 50 FCFA max par résultat
    budgetVarianceMax: 50000         // 50k variance acceptable
  }
}

export default {
  calculateAdaptiveThresholds,
  generateAdaptiveAlerts,
  evaluateStrategySuccess
}
