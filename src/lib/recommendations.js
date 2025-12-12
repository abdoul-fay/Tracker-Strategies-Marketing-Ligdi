/**
 * Système de Recommandations Intelligentes
 * Génère des actions concrètes basées sur l'analyse des données
 */

export function generateRecommendations(campagnes = [], kpiTargets = {}) {
  const recommendations = []

  if (campagnes.length === 0) return recommendations

  // Analyse globale
  const totalBudget = campagnes.reduce((sum, c) => sum + (c.budget || 0), 0)
  const totalReal = campagnes.reduce((sum, c) => sum + (c.budget_reel || 0), 0)
  const totalReach = campagnes.reduce((sum, c) => sum + (c.reach || 0), 0)
  const avgROI = campagnes.length > 0 
    ? campagnes.reduce((sum, c) => sum + (c.roi || 0), 0) / campagnes.length 
    : 0

  // 1. Recommandation Budget
  if (totalReal > totalBudget * 1.2) {
    recommendations.push({
      type: 'budget_overrun',
      severity: 'high',
      icon: '🚨',
      title: 'Budget dépassé de 20%+',
      action: 'Réduisez les dépenses ou augmentez vos cibles',
      details: `Vous avez dépensé ${(totalReal / totalBudget * 100).toFixed(0)}% de votre budget prévu`,
      metric: 'budget'
    })
  } else if (totalReal < totalBudget * 0.7) {
    recommendations.push({
      type: 'budget_underutilized',
      severity: 'medium',
      icon: '💡',
      title: 'Budget sous-utilisé',
      action: 'Investissez plus dans vos canaux performants',
      details: `Vous n'avez utilisé que ${(totalReal / totalBudget * 100).toFixed(0)}% de votre budget`,
      metric: 'budget'
    })
  }

  // 2. Recommandation ROI
  const targetROI = kpiTargets.roi || 100
  if (avgROI < targetROI * 0.5) {
    recommendations.push({
      type: 'roi_low',
      severity: 'high',
      icon: '📉',
      title: 'ROI très faible',
      action: 'Analyez et optimisez vos stratégies',
      details: `Votre ROI moyen (${avgROI.toFixed(1)}%) est loin de la cible (${targetROI}%)`,
      metric: 'roi'
    })
  }

  // 3. Recommandation par Canal
  const byCanal = {}
  campagnes.forEach(c => {
    const canal = c.canal || 'Autre'
    if (!byCanal[canal]) {
      byCanal[canal] = { budget: 0, reach: 0, roi: 0, count: 0 }
    }
    byCanal[canal].budget += c.budget || 0
    byCanal[canal].reach += c.reach || 0
    byCanal[canal].roi += c.roi || 0
    byCanal[canal].count += 1
  })

  // Trouver le meilleur et le pire canal
  let bestCanal = null
  let worstCanal = null
  let bestROI = -Infinity
  let worstROI = Infinity

  Object.entries(byCanal).forEach(([canal, data]) => {
    const roi = data.roi / data.count
    if (roi > bestROI) {
      bestROI = roi
      bestCanal = { canal, roi: bestROI.toFixed(1) }
    }
    if (roi < worstROI) {
      worstROI = roi
      worstCanal = { canal, roi: worstROI.toFixed(1) }
    }
  })

  if (bestCanal && worstCanal && bestROI > worstROI * 2) {
    recommendations.push({
      type: 'channel_imbalance',
      severity: 'high',
      icon: '🎯',
      title: `Concentrez sur ${bestCanal.canal}`,
      action: `${bestCanal.canal} performe ${(bestROI / worstROI).toFixed(1)}x mieux`,
      details: `${bestCanal.canal}: ${bestCanal.roi}% vs ${worstCanal.canal}: ${worstCanal.roi}%`,
      metric: 'channel'
    })
  }

  // 4. Recommandation Reach
  const targetReach = kpiTargets.reach || 50000
  if (totalReach < targetReach * 0.5) {
    recommendations.push({
      type: 'reach_low',
      severity: 'medium',
      icon: '👥',
      title: 'Reach insuffisant',
      action: 'Augmentez votre couverture ou votre budget',
      details: `Vous avez atteint ${totalReach.toLocaleString('fr-FR')} sur ${targetReach.toLocaleString('fr-FR')} cibles`,
      metric: 'reach'
    })
  }

  // 5. Recommandations Campagnes Individuelles
  const lowPerformers = campagnes
    .filter(c => c.roi < avgROI * 0.7)
    .sort((a, b) => (a.roi || 0) - (b.roi || 0))
    .slice(0, 3)

  lowPerformers.forEach(camp => {
    recommendations.push({
      type: 'campaign_underperforming',
      severity: 'medium',
      icon: '⚠️',
      title: `${camp.nom} performe mal`,
      action: 'Optimisez cette campagne ou arrêtez-la',
      details: `ROI: ${camp.roi}% (vs moyenne ${avgROI.toFixed(1)}%)`,
      metric: 'campaign',
      campaignId: camp.id
    })
  })

  // 6. Recommandation Coût par Utilisateur
  campagnes.forEach(c => {
    if (c.budget && c.reach && c.reach > 0) {
      const coutParUtil = c.budget / c.reach
      if (coutParUtil > 100) { // Plus de 100 FCFA par utilisateur
        recommendations.push({
          type: 'high_cost_per_user',
          severity: 'medium',
          icon: '💰',
          title: `${c.nom} coûte trop cher par utilisateur`,
          action: 'Réduisez le coût ou augmentez la portée',
          details: `${coutParUtil.toFixed(0)} FCFA par utilisateur`,
          metric: 'efficiency'
        })
      }
    }
  })

  return recommendations
}

/**
 * Formatte une recommandation pour l'affichage
 */
export function formatRecommendation(rec) {
  return {
    ...rec,
    priority: rec.severity === 'high' ? 1 : rec.severity === 'medium' ? 2 : 3,
    color: rec.severity === 'high' ? '#ef4444' : rec.severity === 'medium' ? '#f59e0b' : '#3b82f6'
  }
}
