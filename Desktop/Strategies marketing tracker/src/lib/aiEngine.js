/**
 * AI Marketing Intelligence Engine
 * Analyse multi-dimensionnelle: Passé | Présent | Futur
 * Features: Comparaison stratégies, Suggestions intelligentes, Conversation interactive
 */

// Configuration IA
const AI_CONFIG = {
  analysisDepth: 'advanced',
  timeframes: ['past', 'present', 'future'],
  comparisonMetrics: ['roi', 'reach', 'engagement', 'cost_efficiency', 'trend'],
  confidenceThreshold: 0.65,
  growthFactor: 1.15, // 15% growth potential
}

/**
 * Normaliser les valeurs ROI (0-1 vs 0-100)
 * Si ROI > 100, c'est probablement déjà en pourcentage, diviser par 100
 */
function normalizeROI(value) {
  const num = parseFloat(value) || 0
  // Aggressive normalization: if > 100, it's already a percentage
  if (num > 100) {
    const normalized = num / 100
    // If still > 100 after division, divide again
    return normalized > 100 ? normalized / 100 : normalized
  }
  return num
}

/**
 * 1. ANALYSE HISTORIQUE (PASSÉ)
 * Extrait patterns, tendances, points chauds
 */
export function analyzeHistorical(campaigns) {
  const analysis = {
    totalCampaigns: campaigns.length,
    timespan: calculateTimespan(campaigns),
    channelPerformance: {},
    trends: [],
    seasonality: {},
    bestPerformers: [],
    worstPerformers: [],
  }

  // Grouper par canal et analyser
  const byChannel = {}
  campaigns.forEach(camp => {
    const canal = camp.canal || 'Autre'
    if (!byChannel[canal]) {
      byChannel[canal] = {
        campaigns: [],
        totalBudget: 0,
        totalReal: 0,
        totalROI: 0,
        totalReach: 0,
        totalEngagement: 0,
      }
    }
    byChannel[canal].campaigns.push(camp)
    byChannel[canal].totalBudget += camp.budget || 0
    byChannel[canal].totalReal += camp.budget_reel || 0
    byChannel[canal].totalROI += normalizeROI(camp.roi)  // Normalize ROI values
    byChannel[canal].totalReach += (parseFloat(camp.reach) || 0)
    byChannel[canal].totalEngagement += (parseFloat(camp.engagement) || 0)
  })

  // Calculer scores par canal
  Object.entries(byChannel).forEach(([canal, data]) => {
    const avgROI = data.totalROI / data.campaigns.length
    const avgReach = data.totalReach / data.campaigns.length
    const costEfficiency = avgReach / (data.totalBudget / data.campaigns.length)
    const trend = calculateTrend(data.campaigns)

    analysis.channelPerformance[canal] = {
      count: data.campaigns.length,
      avgROI: Math.round(avgROI * 100) / 100,  // ROI already in % from database
      avgReach: Math.round(avgReach),
      costEfficiency: Math.round(costEfficiency * 100) / 100,
      trend, // 'up', 'down', 'stable'
      totalSpent: data.totalBudget,
      totalEarned: data.totalReal,
      performanceScore: calculatePerformanceScore({
        roi: avgROI,
        reach: avgReach,
        costEfficiency,
        trend,
      }),
    }
  })

  // Identifier top & bottom performers
  const sorted = Object.entries(analysis.channelPerformance)
    .sort(([, a], [, b]) => b.performanceScore - a.performanceScore)
  analysis.bestPerformers = sorted.slice(0, 2)
  analysis.worstPerformers = sorted.slice(-2)

  // Détecter patterns saisonniers
  analysis.seasonality = detectSeasonality(campaigns)

  // Analyser tendances sur le temps
  analysis.trends = extractTrends(campaigns)

  return analysis
}

/**
 * 2. ANALYSE PRÉSENTE
 * État actuel, KPIs, comparaisons
 */
export function analyzePresent(campaigns, kpiFinanciers) {
  const analysis = {
    currentState: {},
    healthScore: 0,
    momentum: 'stable',
    alerts: [],
    opportunities: [],
  }

  // Calculer l'état actuel
  const recentCampaigns = campaigns.slice(-5) // Dernières 5 campagnes
  const currentMetrics = {
    avgROI: 0,
    avgReach: 0,
    budgetEfficiency: 0,
    engagementRate: 0,
  }

  if (recentCampaigns.length > 0) {
    currentMetrics.avgROI = recentCampaigns.reduce((s, c) => s + normalizeROI(c.roi), 0) / recentCampaigns.length
    currentMetrics.avgReach = recentCampaigns.reduce((s, c) => s + (parseFloat(c.reach) || 0), 0) / recentCampaigns.length
    const totalBudget = recentCampaigns.reduce((s, c) => s + (c.budget || 0), 0)
    currentMetrics.budgetEfficiency = totalBudget > 0 ? currentMetrics.avgReach / totalBudget : 0
    currentMetrics.engagementRate = recentCampaigns.reduce((s, c) => s + (parseFloat(c.engagement) || 0), 0) / recentCampaigns.length
  }

  analysis.currentState = currentMetrics

  // Calculer health score (0-100)
  analysis.healthScore = Math.round(
    (Math.min(currentMetrics.avgROI / 50, 1) * 0.4 +  // 40% poids ROI
     Math.min(currentMetrics.budgetEfficiency / 0.005, 1) * 0.3 +  // 30% poids efficacité budget
     Math.min(currentMetrics.engagementRate / 0.3, 1) * 0.3) * 100  // 30% poids engagement
  )

  // Détecter momentum
  if (recentCampaigns.length >= 3) {
    const trend = calculateTrend(recentCampaigns)
    analysis.momentum = trend === 'up' ? 'ascending' : trend === 'down' ? 'declining' : 'stable'
  }

  // Générer alerts
  if (currentMetrics.avgROI < 25) {
    analysis.alerts.push({
      level: 'warning',
      message: '⚠️ ROI actuel faible (< 25%). Considérez reallocation budgétaire.',
    })
  }
  if (currentMetrics.budgetEfficiency < 0.002) {
    analysis.alerts.push({
      level: 'critical',
      message: '🔴 Efficacité budgétaire très basse. Optimisation urgente.',
    })
  }

  // Identifier opportunities
  if (currentMetrics.avgROI > 40) {
    analysis.opportunities.push({
      level: 'high',
      message: '✅ ROI excellent! Augmentez budget pour maximiser impact.',
    })
  }

  return analysis
}

/**
 * 3. ANALYSE FUTURE (PRÉDICTIONS)
 * Forecast sur 3-6 mois, scenarios
 */
export function predictFuture(campaigns, channelPerformance) {
  const predictions = {
    forecast3months: {},
    forecast6months: {},
    scenarios: {
      optimistic: {},
      conservative: {},
      realistic: {},
    },
    recommendations: [],
  }

  // Forecaster par canal
  Object.entries(channelPerformance).forEach(([canal, perf]) => {
    const growthRate = perf.trend === 'up' ? AI_CONFIG.growthFactor : 0.95
    const historicalGrowth = calculateHistoricalGrowth(campaigns, canal)

    // Forecast 3 mois
    predictions.forecast3months[canal] = {
      expectedROI: Math.round(perf.avgROI * growthRate * 100) / 100,  // avgROI already in %
      expectedReach: Math.round(perf.avgReach * growthRate),
      confidence: Math.min(0.65 + (perf.count / 10) * 0.25, 0.95),
    }

    // Forecast 6 mois
    predictions.forecast6months[canal] = {
      expectedROI: Math.round(perf.avgROI * Math.pow(growthRate, 2) * 100) / 100,  // avgROI already in %
      expectedReach: Math.round(perf.avgReach * Math.pow(growthRate, 2)),
      confidence: Math.min(0.50 + (perf.count / 10) * 0.2, 0.80),
    }

    // Scenarios
    predictions.scenarios.optimistic[canal] = {
      roi: Math.round(perf.avgROI * 1.3 * 100) / 100,  // avgROI already in %
      reach: Math.round(perf.avgReach * 1.3),
      budget: Math.round(perf.totalSpent * 1.2),
    }
    predictions.scenarios.conservative[canal] = {
      roi: Math.round(perf.avgROI * 0.9 * 100) / 100,  // avgROI already in %
      reach: Math.round(perf.avgReach * 0.9),
      budget: Math.round(perf.totalSpent * 0.9),
    }
    predictions.scenarios.realistic[canal] = {
      roi: Math.round(perf.avgROI * growthRate * 100) / 100,  // avgROI already in %
      reach: Math.round(perf.avgReach * growthRate),
      budget: Math.round(perf.totalSpent * 1.05),
    }
  })

  return predictions
}

/**
 * 4. COMPARAISON AVEC STRATÉGIES SIMILAIRES
 * Benchmarking contre industry standards
 */
export function compareSimilarStrategies(campaigns, channelPerformance) {
  const comparison = {
    industryBenchmarks: getIndustryBenchmarks(),
    channelComparison: {},
    gaps: {},
    recommendations: [],
  }

  // Comparer chaque canal avec benchmark
  Object.entries(channelPerformance).forEach(([canal, perf]) => {
    const benchmark = comparison.industryBenchmarks[canal] || comparison.industryBenchmarks['default']
    
    comparison.channelComparison[canal] = {
      yourPerformance: perf.performanceScore,
      benchmarkScore: benchmark.score,
      gap: Math.round((perf.performanceScore - benchmark.score) * 100) / 100,
      percentageDifference: Math.round(((perf.performanceScore / benchmark.score) - 1) * 100),
      ranking: perf.performanceScore > benchmark.score ? 'Above Average' : 'Below Average',
    }

    // Identifier gaps
    if (perf.performanceScore < benchmark.score * 0.8) {
      comparison.gaps[canal] = {
        severity: 'critical',
        suggestion: `${canal} est 20% en dessous du benchmark. À optimiser urgente.`,
      }
    } else if (perf.performanceScore < benchmark.score) {
      comparison.gaps[canal] = {
        severity: 'warning',
        suggestion: `${canal} est légèrement en dessous du benchmark. À améliorer.`,
      }
    }
  })

  // Recommandations de réallocation
  const topPerformers = Object.entries(channelPerformance)
    .sort(([, a], [, b]) => b.performanceScore - a.performanceScore)
    .slice(0, 2)
    .map(([canal]) => canal)

  const underperformers = Object.entries(comparison.channelComparison)
    .filter(([, data]) => data.ranking === 'Below Average')
    .map(([canal]) => canal)

  if (topPerformers.length > 0 && underperformers.length > 0) {
    comparison.recommendations.push({
      type: 'reallocation',
      message: `Transférez 15-20% du budget de ${underperformers[0]} vers ${topPerformers[0]}`,
      impact: 'Gain potentiel: +8-12% ROI global',
    })
  }

  return comparison
}

/**
 * 5. GÉNÉRATION D'INSIGHTS INTELLIGENTS
 */
export function generateInsights(historical, present, predictions, comparison) {
  const insights = {
    keyFindings: [],
    actionItems: [],
    strategicRecommendations: [],
    discussionPoints: [],
  }

  // Key findings
  const bestChannel = Object.entries(historical.channelPerformance)
    .sort(([, a], [, b]) => b.performanceScore - a.performanceScore)[0]
  
  if (bestChannel) {
    insights.keyFindings.push({
      title: '🏆 Champion Channel',
      content: `${bestChannel[0]} est votre meilleur performer avec un score de ${Math.round(bestChannel[1].performanceScore)}/100`,
      actionable: true,
    })
  }

  // Action items basés sur les alerts
  present.alerts.forEach(alert => {
    insights.actionItems.push({
      priority: alert.level === 'critical' ? 'high' : 'medium',
      action: alert.message,
      timeline: alert.level === 'critical' ? '1 semaine' : '2-3 semaines',
    })
  })

  // Strategic recommendations
  Object.entries(predictions.scenarios.realistic).forEach(([canal, scenario]) => {
    if (scenario.roi > 40) {
      insights.strategicRecommendations.push({
        canal,
        strategy: 'Scale Up',
        reasoning: `${canal} a un ROI prédit de ${scenario.roi}%. Augmentez budget pour maximiser.`,
      })
    } else if (scenario.roi < 20) {
      insights.strategicRecommendations.push({
        canal,
        strategy: 'Optimize or Exit',
        reasoning: `${canal} a faible ROI (${scenario.roi}%). Optimisez ou réallouez budget.`,
      })
    }
  })

  // Discussion points pour le chat
  insights.discussionPoints = [
    `Avez-vous observé des changements externes (marché, compétition) affectant ${bestChannel ? bestChannel[0] : 'vos canaux'}?`,
    `Voulez-vous explorer une stratégie multi-canal combinant les meilleurs performers?`,
    `Comment pourriez-vous tester l'allocation du scénario "optimistic"?`,
    `Avez-vous des insights qualitatifs sur pourquoi certains canaux surpassent d'autres?`,
  ]

  return insights
}

/**
 * 6. GESTIONNAIRE DE CONVERSATION IA
 * Chat interactif avec contexte des données
 */
export class ConversationManager {
  constructor(analysis, selectedChannel = null) {
    this.analysis = analysis
    this.conversationHistory = []
    this.context = {
      lastTopic: null,
      userKnowledge: 'intermediate',
      focusChannel: selectedChannel, // Utiliser le canal sélectionné
    }
  }

  /**
   * Process user message et générer réponse IA contextuelle
   */
  processMessage(userMessage) {
    const message = userMessage.toLowerCase()
    let response = {}

    // Déterminer l'intent du user
    const intent = detectIntent(message)
    this.context.lastTopic = intent.topic

    // Générer réponse basée sur l'intent
    if (intent.topic === 'performance') {
      response = this.analyzePerformanceQuestion(userMessage, intent)
    } else if (intent.topic === 'comparison') {
      response = this.compareChannelsQuestion(userMessage, intent)
    } else if (intent.topic === 'prediction') {
      response = this.predictFutureQuestion(userMessage, intent)
    } else if (intent.topic === 'competition') {
      response = this.competitiveAnalysisQuestion(userMessage, intent)
    } else if (intent.topic === 'strategy') {
      response = this.suggestStrategyQuestion(userMessage, intent)
    } else {
      response = this.generalQuestion(userMessage, intent)
    }

    // Ajouter à l'historique
    this.conversationHistory.push({
      user: userMessage,
      ai: response,
      timestamp: new Date().toISOString(),
      topic: intent.topic,
    })

    return response
  }

  analyzePerformanceQuestion(message, intent) {
    let channel = extractChannel(message)
    
    // Si pas de canal extrait, utiliser le canal sélectionné
    if (!channel && this.context.focusChannel) {
      channel = this.context.focusChannel
    }
    
    const perf = this.analysis.historical.channelPerformance[channel]

    if (!perf) {
      return {
        type: 'clarification',
        message: `Je n'ai pas d'information sur le canal "${channel}". Lequel voulez-vous analyser: ${Object.keys(this.analysis.historical.channelPerformance).join(', ')}?`,
      }
    }

    return {
      type: 'analysis',
      channel,
      data: perf,
      interpretation: `
🎯 ${channel.toUpperCase()}
📊 Performance: ${Math.round(perf.performanceScore)}/100
📈 ROI Moyen: ${perf.avgROI}%
👥 Reach Moyen: ${perf.avgReach.toLocaleString()} 
💰 Efficacité Budgétaire: ${(perf.costEfficiency).toFixed(3)}
📉 Tendance: ${perf.trend === 'up' ? '📈 En hausse' : perf.trend === 'down' ? '📉 En baisse' : '➡️ Stable'}

${perf.trend === 'up' ? '✅ Positive momentum!' : '⚠️ À améliorer'}
      `,
      followUp: `Voulez-vous savoir comment optimiser ${channel}?`,
    }
  }

  compareChannelsQuestion(message, intent) {
    const channels = extractChannels(message)
    const comparison = Object.entries(this.analysis.historical.channelPerformance)
      .filter(([canal]) => channels.length === 0 || channels.includes(canal))

    if (comparison.length < 2) {
      const allChannels = Object.keys(this.analysis.historical.channelPerformance)
      return {
        type: 'clarification',
        message: `Vous voulez comparer quels canaux? Disponibles: ${allChannels.join(', ')}`,
      }
    }

    const sorted = comparison.sort(([, a], [, b]) => b.performanceScore - a.performanceScore)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    const gap = Math.round((best[1].performanceScore - worst[1].performanceScore) * 100) / 100

    return {
      type: 'comparison',
      channels: comparison.map(([canal, perf]) => ({ canal, score: perf.performanceScore })),
      interpretation: `
🏆 COMPARAISON DES CANAUX
━━━━━━━━━━━━━━━━━━━━━━
1️⃣ ${best[0].toUpperCase()}: ${Math.round(best[1].performanceScore)}/100 ⭐
2️⃣ ${worst[0].toUpperCase()}: ${Math.round(worst[1].performanceScore)}/100

📊 Écart: ${gap} points en faveur de ${best[0]}

${gap > 30 ? '🔴 Écart important! Considérez reallocation.' : gap > 15 ? '🟡 Écart modéré' : '🟢 Performance équilibrée'}
      `,
      followUp: `Voulez-vous réallouer le budget en faveur de ${best[0]}?`,
    }
  }

  // NEW: Competitive Intelligence & Benchmarking
  competitiveAnalysisQuestion(userMessage, intent) {
    const msg = userMessage.toLowerCase()
    const { historical, comparison } = this.analysis
    const channels = Object.entries(historical.channelPerformance)
      .sort(([, a], [, b]) => b.performanceScore - a.performanceScore)

    // Déterminer le type d'industrie/produit
    let industry = 'general'
    if (msg.includes('fintech') || msg.includes('appli') || msg.includes('application') || msg.includes('app')) industry = 'fintech'
    else if (msg.includes('ecommerce') || msg.includes('shop') || msg.includes('vente')) industry = 'ecommerce'
    else if (msg.includes('saas') || msg.includes('logiciel') || msg.includes('b2b')) industry = 'saas'
    else if (msg.includes('fmcg') || msg.includes('produit') || msg.includes('consommation')) industry = 'fmcg'
    else if (msg.includes('service') || msg.includes('coiffeur') || msg.includes('salon')) industry = 'service'

    // Database complète de stratégies gagnantes par industrie
    const competitiveIntelligence = {
      fintech: [
        { name: 'LinkedIn Account-Based Marketing + Webinars', channels: ['Digital'], ROI: 88, success_rate: 0.90, description: 'Cibler decision-makers via LinkedIn + webinars éducatifs' },
        { name: 'Influencer Tech Reviews + TikTok/YouTube', channels: ['Influence', 'Digital'], ROI: 72, success_rate: 0.82, description: 'Partenaires tech influencers pour authenticity' },
        { name: 'Product Hunt Launch + Communities', channels: ['Digital'], ROI: 85, success_rate: 0.88, description: 'Launch orchestré + early adopter communities' },
        { name: 'Referral Program + Incentive Loops', channels: ['Digital'], ROI: 95, success_rate: 0.85, description: 'Viral loop: réduction fees pour chaque referral' },
        { name: 'Email Nurture + Retargeting Ads', channels: ['Digital'], ROI: 68, success_rate: 0.80, description: 'Sequence emails + dynamic ads' },
      ],
      ecommerce: [
        { name: 'Email Remarketing + Dynamic Ads', channels: ['Digital'], ROI: 65, success_rate: 0.85 },
        { name: 'Influencer Unboxing + TikTok', channels: ['Influence'], ROI: 72, success_rate: 0.80 },
        { name: 'Affiliate Network + Blog', channels: ['Digital'], ROI: 55, success_rate: 0.75 },
        { name: 'Live Shopping (Livestream)', channels: ['Influence', 'Digital'], ROI: 68, success_rate: 0.70 },
        { name: 'User-Generated Content Campaign', channels: ['Influence', 'Digital'], ROI: 60, success_rate: 0.78 },
      ],
      saas: [
        { name: 'LinkedIn Account-Based Marketing', channels: ['Digital'], ROI: 85, success_rate: 0.88 },
        { name: 'Webinar + Email Nurture', channels: ['Digital'], ROI: 78, success_rate: 0.82 },
        { name: 'Industry Podcast Sponsoring', channels: ['Radio'], ROI: 52, success_rate: 0.65 },
        { name: 'Partner Co-Marketing', channels: ['Parrainage'], ROI: 70, success_rate: 0.75 },
        { name: 'Content Marketing (Blog + SEO)', channels: ['Digital'], ROI: 62, success_rate: 0.80 },
      ],
      fmcg: [
        { name: 'Influencer Sampling Campaign', channels: ['Influence', 'Terrain'], ROI: 55, success_rate: 0.80 },
        { name: 'Retail Activation + Social', channels: ['Terrain', 'Digital'], ROI: 48, success_rate: 0.72 },
        { name: 'Radio + OOH Integration', channels: ['Radio', 'Terrain'], ROI: 42, success_rate: 0.68 },
        { name: 'User-Generated Content Campaign', channels: ['Influence', 'Digital'], ROI: 60, success_rate: 0.78 },
        { name: 'Celebrity Endorsement + TV', channels: ['Radio'], ROI: 45, success_rate: 0.70 },
      ],
      service: [
        { name: 'Google Local Services Ads', channels: ['Digital'], ROI: 75, success_rate: 0.85 },
        { name: 'Community Events + Word-of-Mouth', channels: ['Terrain', 'Parrainage'], ROI: 50, success_rate: 0.70 },
        { name: 'Review Generation Strategy', channels: ['Digital'], ROI: 65, success_rate: 0.80 },
        { name: 'Local Influencer Partnerships', channels: ['Influence'], ROI: 58, success_rate: 0.75 },
        { name: 'Email Marketing + Loyalty Program', channels: ['Digital'], ROI: 62, success_rate: 0.78 },
      ],
      general: [
        { name: 'Email Remarketing + Dynamic Ads', channels: ['Digital'], ROI: 65, success_rate: 0.85 },
        { name: 'Influencer Partnerships', channels: ['Influence'], ROI: 72, success_rate: 0.80 },
        { name: 'Content Marketing', channels: ['Digital'], ROI: 55, success_rate: 0.75 },
        { name: 'Community Building', channels: ['Terrain', 'Digital'], ROI: 68, success_rate: 0.70 },
        { name: 'Strategic Partnerships', channels: ['Parrainage'], ROI: 70, success_rate: 0.75 },
      ],
    }

    // Obtenir les stratégies pour l'industrie détectée
    const industryStrategies = competitiveIntelligence[industry] || competitiveIntelligence.general
    
    // Analyser les tunnels gagnants compatibles avec les données actuelles
    const applicableStrategies = industryStrategies.filter(strategy => {
      // Vérifier si les canaux de la stratégie matchent nos canaux disponibles
      return strategy.channels.some(c => Object.keys(historical.channelPerformance).includes(c))
    })

    // Trier par ROI potentiel
    const topStrategies = applicableStrategies.sort((a, b) => b.ROI - a.ROI)

    // Calculer le gap vs meilleur performer existant
    const currentBestROI = Math.round(channels[0]?.[1].avgROI || 0)
    const opportunityGap = Math.round(Math.max(...topStrategies.map(s => s.ROI)) - currentBestROI)

    return {
      type: 'competition',
      interpretation: `
🎯 ANALYSE CONCURRENTIELLE - INDUSTRIE ${industry.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CONTEXTE ACTUEL:
• Meilleur performer: ${channels[0]?.[0] || '?'} (ROI: ${currentBestROI}%)
• Tous les canaux actifs: ${Object.keys(historical.channelPerformance).join(', ')}

🔍 RECHERCHE CONCURRENTIELLE:
• Industrie analysée: ${industry.charAt(0).toUpperCase() + industry.slice(1)}
• Gap opportunité vs leaders: +${opportunityGap.toFixed(0)}%
• Stratégies pertinentes trouvées: ${applicableStrategies.length}

🏆 TOP 5 STRATÉGIES GAGNANTES (Données de Marché ${industry.toUpperCase()}):

${topStrategies.slice(0, 5).map((strat, i) => `
${i + 1}. 🎯 ${strat.name}
   � Description: ${strat.description || 'Stratégie éprouvée'}
   �📈 ROI Benchmarked: ${Math.round(strat.ROI)}% (vs votre ${currentBestROI}%)
   ✅ Taux de succès: ${Math.round(strat.success_rate * 100)}%
   🎯 Canaux: ${strat.channels.join(' + ')}
   💡 Gain potentiel: +${Math.round(strat.ROI - currentBestROI)}% ROI
   ⏱️ Timeline: 4-8 semaines pour 1st results
`).join('')}

� PLAN D'ACTION RECOMMANDÉ:

✅ PHASE 1 - QUICK WIN (Semaine 1-2):
   • Stratégie: ${topStrategies[0]?.name}
   • Canaux: ${topStrategies[0]?.channels.join(' + ')}
   • Budget: 15-20% du budget total
   • Objectif: Valider ROI ${Math.round(topStrategies[0]?.ROI || 0)}%

📈 PHASE 2 - SCALING (Semaine 3-4):
   • Ajouter: ${topStrategies[1]?.name}
   • Combiner avec: ${channels[0]?.[0]}
   • Budget: 30-40% du budget
   • Objectif: Atteindre ROI ${Math.round(topStrategies[1]?.ROI || 0)}%

🔥 PHASE 3 - OPTIMIZATION (Semaine 5-8):
   • Tester: ${topStrategies[2]?.name}
   • Optimiser les meilleurs performers
   • Budget: 20-30% du budget
   • Objectif: Maximiser ROI & Efficiency

💰 ALLOCATION BUDGÉTAIRE OPTIMALE:
   • Test nouvelles stratégies: 15-25%
   • Scale winning formulas: 40-50%
   • Maintenance canaux existants: 25-35%

📊 KPIs À TRACKER:
   • ROI par stratégie (quotidien)
   • Cost Per Acquisition - CPA (quotidien)
   • Customer Lifetime Value - CLV (hebdomadaire)
   • Conversion Rate (quotidien)
   • Reach & Engagement (quotidien)

⚡ INSIGHTS CLÉS:
   • Les leaders du marché $(industry) utilisent ${topStrategies[0]?.channels.join(' + ')}
   • Opportunité réelle: +${opportunityGap.toFixed(0)}% ROI vs votre meilleur performer
   • Quick win possible en 2-3 semaines si vous lancez Phase 1
   • Risk: ${topStrategies[0]?.success_rate >= 0.85 ? 'FAIBLE ✅' : topStrategies[0]?.success_rate >= 0.75 ? 'MOYEN 🟡' : 'À ÉVALUER 🔴'}

🎯 NEXT STEPS:
   1. Approuver le plan d'action
   2. Allouer les ressources (team + budget)
   3. Lancer Phase 1 cette semaine
   4. Mesurer quotidiennement
   5. Adapter & optimiser
      `,
      followUp: `Veux-tu détailler l'exécution de "${topStrategies[0]?.name}"? Je peux créer un playbook complet.`,
    }
  }

  predictFutureQuestion(userMessage, intent) {
    const horizon = extractHorizon(userMessage) // '3months', '6months', etc
    const key = horizon === '6' ? 'forecast6months' : 'forecast3months'
    const forecast = this.analysis.predictions[key]

    return {
      type: 'prediction',
      timeframe: horizon === '6' ? '6 mois' : '3 mois',
      data: forecast,
      interpretation: `
🔮 PRÉDICTIONS SUR ${horizon === '6' ? '6 MOIS' : '3 MOIS'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Object.entries(forecast)
  .map(
    ([canal, data]) => `
${canal.toUpperCase()}:
• ROI Prédit: ${Math.round(data.expectedROI)}%
• Reach: ${data.expectedReach.toLocaleString()}
• Confiance: ${Math.round(data.confidence * 100)}%
    `
  )
  .join('')}

⚡ Ces prédictions se basent sur les tendances historiques et le momentum actuel.
      `,
      followUp: `Vous trouvez ces projections réalistes? Avez-vous des facteurs externes à considérer?`,
    }
  }

  suggestStrategyQuestion(userMessage, intent) {
    const msg = userMessage.toLowerCase()
    const { insights, historical, comparison } = this.analysis
    const recommendations = insights.strategicRecommendations

    // Questions spécifiques sur l'optimisation du budget
    if (msg.includes('optimis') && msg.includes('budget')) {
      const channels = Object.entries(historical.channelPerformance)
        .sort(([, a], [, b]) => b.performanceScore - a.performanceScore)
      
      const topChannels = channels.slice(0, 3)
      const bottomChannels = channels.slice(-2)

      return {
        type: 'strategy',
        interpretation: `
💰 RECOMMANDATIONS POUR OPTIMISER LE BUDGET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ANALYSE ACTUELLE:
${topChannels.map(([canal, perf]) => `• ${canal}: ${perf.performanceScore.toFixed(0)}/100 (ROI: ${Math.round(perf.avgROI)}%)`).join('\n')}

🎯 STRATÉGIES D'OPTIMISATION:

1️⃣ RÉALLOCATION BUDGÉTAIRE
   Transférez 15-20% du budget de ${bottomChannels[0]?.[0] || 'canaux faibles'} 
   vers ${topChannels[0][0]} (meilleur performer)
   💡 Gain estimé: +8-12% ROI global

2️⃣ AUGMENTATION SÉLECTIVE
   Augmentez le budget de ${topChannels[0][0]} de 10-15%
   🎯 Raison: Fort ROI (${Math.round(topChannels[0][1].avgROI)}%) + Momentum ${topChannels[0][1].trend}

3️⃣ RÉDUCTION CIBLÉE
   Réduisez budget de ${bottomChannels[0]?.[0]} de 20-30%
   ⚠️ Raison: Faible performance (${bottomChannels[0]?.[1].performanceScore.toFixed(0) || '?'}/100)

4️⃣ TEST & LEARN
   Allouez 5-10% à des tests sur ${topChannels[1]?.[0] || 'canaux prometteurs'}
   🧪 Tester différents créatifs/audiences

📈 IMPACT PROJETÉ:
   • ROI moyen: +15-18%
   • Reach: +20-25%
   • Efficacité: +12%

🚀 Prochaines étapes:
   1. Approuver les réallocations
   2. Implémenter progressivement sur 2 semaines
   3. Mesurer l'impact avec tracking détaillé
`,
        followUp: `Voulez-vous explorer un scénario spécifique ou affiner ces recommandations?`,
      }
    }

    // Questions sur l'allocation budgétaire
    if (msg.includes('alloc')) {
      const channels = Object.entries(historical.channelPerformance)
        .map(([canal, perf]) => ({ 
          canal, 
          score: perf.performanceScore,
          roi: perf.avgROI,
          spent: perf.totalSpent
        }))
        .sort((a, b) => b.score - a.score)
      
      const totalBudget = channels.reduce((s, c) => s + c.spent, 0)

      return {
        type: 'strategy',
        interpretation: `
💡 ALLOCATION BUDGÉTAIRE RECOMMANDÉE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ALLOCATION ACTUELLE (${totalBudget.toLocaleString()} FCFA):
${channels.map(c => `• ${c.canal}: ${((c.spent/totalBudget)*100).toFixed(0)}% (Score: ${c.score.toFixed(0)}/100, ROI: ${Math.round(c.roi)}%)`).join('\n')}

🎯 ALLOCATION RECOMMANDÉE:
${channels.map((c, i) => `• ${c.canal}: ${(20 + (i*15)).toFixed(0)}% (augmenter performance)`).join('\n')}

💰 RATIOS D'EFFICACITÉ:
${channels.map(c => `• ${c.canal}: ${(c.roi/c.spent*100000).toFixed(2)} ROI par 10k dépensés`).join('\n')}

✅ STRATÉGIE OPTIMALE:
   • Investir PLUS dans: ${channels[0].canal} (meilleur ROI)
   • Maintenir: ${channels[1]?.canal} 
   • Réduire/Tester: ${channels[channels.length-1].canal}

🚀 Budget réoptimisé: +${Math.round(Math.max(0, channels[0].roi - 25))}% de ROI potentiel
`,
        followUp: `Quelle allocation préférez-vous mettre en place?`,
      }
    }

    // NEW: Questions sur tunnels/stratégies alternatives de promotion
    if (msg.includes('tunnel') || msg.includes('alternatif') || msg.includes('nouvea') || (msg.includes('promotion') && (msg.includes('autre') || msg.includes('tunnel') || msg.includes('stratégi')))) {
      const channels = Object.entries(historical.channelPerformance)
        .sort(([, a], [, b]) => b.performanceScore - a.performanceScore)
      
      const topChannel = channels[0]
      const emergingChannels = channels.filter(([, perf]) => perf.trend === 'up').slice(0, 2)

      // Génération de stratégies alternatives basées sur les données
      const alternativeStrategies = [
        {
          name: '🎯 MULTI-CANAL SYNERGISÉ',
          description: `Combinez ${topChannel[0]} + ${emergingChannels[0]?.[0] || 'Digital'} pour effet de levier`,
          expected: `+25-30% reach, +15% ROI`,
          investment: '20-30% du budget',
          timeline: '3 mois',
          risk: 'Faible'
        },
        {
          name: '🚀 GUERRILLA/VIRAL',
          description: `Campagne ultra-ciblée sur ${emergingChannels[1]?.[0] || 'Influence'} + contenu viral`,
          expected: `+40% reach organique, ROI variable`,
          investment: '10-15% du budget',
          timeline: '4-6 semaines',
          risk: 'Moyen'
        },
        {
          name: '💡 CONTENT MARKETING',
          description: `Blog + LinkedIn (Digital) + Influence micro-creators pour build authority`,
          expected: `+20% brand awareness, +12% lead quality`,
          investment: '15-20% du budget',
          timeline: '2-3 mois',
          risk: 'Faible'
        },
        {
          name: '🤝 PARTENARIATS STRATÉGIQUES',
          description: `Co-marketing avec 3-5 partenaires complémentaires`,
          expected: `+35% reach, partage des coûts`,
          investment: '10-20% du budget',
          timeline: '2 mois setup',
          risk: 'Moyen'
        },
        {
          name: '📱 OMNICHANNEL INTÉGRÉ',
          description: `Storytelling cohérent: ${topChannel[0]} → ${channels[1]?.[0]} → ${channels[2]?.[0]}`,
          expected: `+50% conversion, +20% ROI`,
          investment: '25-35% du budget',
          timeline: '2-3 mois',
          risk: 'Moyen'
        },
      ]

      return {
        type: 'strategy',
        interpretation: `
🎨 TUNNELS DE PROMOTION ALTERNATIFS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CONTEXTE:
• Meilleur canal actuel: ${topChannel[0]} (${topChannel[1].performanceScore.toFixed(0)}/100)
• Momentum: ${emergingChannels.length > 0 ? 'Plusieurs canaux en croissance ✅' : 'À dynamiser'}

🔥 STRATÉGIES ALTERNATIVES RECOMMANDÉES:

${alternativeStrategies.map((strat, i) => `
${i + 1}. ${strat.name}
   📝 Description: ${strat.description}
   📈 Résultat attendu: ${strat.expected}
   💰 Budget nécessaire: ${strat.investment}
   ⏱️ Timeline: ${strat.timeline}
   ⚠️ Risque: ${strat.risk}
`).join('')}

✅ MON RECOMMENDATION TOP 3:
1️⃣ Commencez par MULTI-CANAL SYNERGISÉ (faible risque, haut ROI)
2️⃣ Testez CONTENT MARKETING en parallèle (build long-term assets)
3️⃣ Explorez PARTENARIATS (réduction des coûts d'acquisition)

🎯 PROCHAINES ÉTAPES:
• Choisir 1-2 tunnels pour tester
• Allouer 20-30% du budget à l'expérimentation
• Mesurer ROI sur 4-6 semaines
• Adapter et scaler les meilleurs performers

💬 Questions à se poser:
• Quel type de résultat est prioritaire? (reach, conversion, brand, ROI)
• Quel est votre capacity en ressources internes?
• Avez-vous des partenaires potentiels?
      `,
        followUp: `Quel tunnel vous intéresse pour tester? Je peux détailler la stratégie de mise en œuvre.`,
      }
    }

    // Fallback aux recommandations générales
    return {
      type: 'strategy',
      recommendations,
      interpretation: `
💡 STRATÉGIES RECOMMANDÉES
━━━━━━━━━━━━━━━━━━━━━━━━━

${recommendations
  .map(
    (rec, i) => `
${i + 1}. ${rec.strategy.toUpperCase()} - ${rec.canal}
   ${rec.reasoning}
    `
  )
  .join('')}

🎯 Mon conseil: Commencez par augmenter le budget des canaux "Scale Up" de 15-20%.
      `,
      followUp: `Laquelle de ces stratégies voulez-vous explorer davantage?`,
    }
  }

  generalQuestion(userMessage, intent) {
    const topPerformer = Object.entries(this.analysis.historical.channelPerformance)
      .sort(([, a], [, b]) => b.performanceScore - a.performanceScore)[0]

    return {
      type: 'general',
      message: `Je comprends votre question. Basé sur vos données, je peux vous aider avec:

📊 Analyse de performance par canal
📈 Comparaisons entre canaux
🔮 Prédictions futures
💡 Recommandations stratégiques
💰 Optimisation budgétaire

Votre meilleur canal actuellement: ${topPerformer ? topPerformer[0] : 'Données insuffisantes'}

Que puis-je faire pour vous?`,
    }
  }

  getConversationHistory() {
    return this.conversationHistory
  }

  clearHistory() {
    this.conversationHistory = []
  }
}

/**
 * UTILITAIRES HELPERS
 */

function calculateTimespan(campaigns) {
  if (campaigns.length === 0) return null
  const dates = campaigns.map(c => new Date(c.date_start)).filter(d => !isNaN(d))
  if (dates.length < 2) return null
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))
  const months = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 30)
  return Math.round(months)
}

function calculateTrend(campaigns) {
  if (campaigns.length < 2) return 'stable'
  const first = campaigns.slice(0, Math.ceil(campaigns.length / 2))
  const second = campaigns.slice(Math.ceil(campaigns.length / 2))
  
  const firstAvg = first.reduce((s, c) => s + normalizeROI(c.roi), 0) / first.length
  const secondAvg = second.reduce((s, c) => s + normalizeROI(c.roi), 0) / second.length
  
  return secondAvg > firstAvg * 1.1 ? 'up' : secondAvg < firstAvg * 0.9 ? 'down' : 'stable'
}

function calculatePerformanceScore(metrics) {
  const roiScore = Math.min(metrics.roi / 50, 1)
  const reachScore = Math.min(metrics.reach / 10000, 1)
  const efficiencyScore = Math.min(metrics.costEfficiency / 0.005, 1)
  const trendMultiplier = metrics.trend === 'up' ? 1.2 : metrics.trend === 'down' ? 0.8 : 1

  return (roiScore * 0.4 + reachScore * 0.3 + efficiencyScore * 0.3) * 100 * trendMultiplier
}

function detectSeasonality(campaigns) {
  const byMonth = {}
  campaigns.forEach(c => {
    const date = new Date(c.date_start)
    const month = date.getMonth()
    byMonth[month] = (byMonth[month] || 0) + 1
  })
  return byMonth
}

function extractTrends(campaigns) {
  // Analyser les patterns sur le temps
  return campaigns
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
    .slice(-10)
    .map(c => ({
      date: new Date(c.date_start).toLocaleDateString('fr-FR'),
      roi: c.roi,
      reach: c.reach,
    }))
}

function calculateHistoricalGrowth(campaigns, canal) {
  const channelCampaigns = campaigns.filter(c => c.canal === canal)
  if (channelCampaigns.length < 2) return 1
  const first = channelCampaigns.slice(0, Math.ceil(channelCampaigns.length / 2))
  const second = channelCampaigns.slice(Math.ceil(channelCampaigns.length / 2))
  const firstAvg = first.reduce((s, c) => s + normalizeROI(c.roi), 0) / first.length
  const secondAvg = second.reduce((s, c) => s + normalizeROI(c.roi), 0) / second.length
  return secondAvg / (firstAvg || 1)
}

function getIndustryBenchmarks() {
  return {
    Digital: { score: 75, roi: 35, reach_per_budget: 0.004 },
    Radio: { score: 60, roi: 25, reach_per_budget: 0.003 },
    Terrain: { score: 55, roi: 22, reach_per_budget: 0.002 },
    Influence: { score: 80, roi: 40, reach_per_budget: 0.005 },
    Parrainage: { score: 70, roi: 32, reach_per_budget: 0.0035 },
    Autre: { score: 50, roi: 20, reach_per_budget: 0.0015 },
    default: { score: 65, roi: 30, reach_per_budget: 0.003 },
  }
}

function detectIntent(message) {
  const msg = message.toLowerCase()
  
  // PRIORITÉ 1: Competitive/Benchmarking questions (AVANT comparison!)
  if (
    msg.includes('concurrenc') || 
    msg.includes('compétiteur') ||
    msg.includes('rivaux') ||
    msg.includes('concurrent') ||
    msg.includes('benchmark') ||
    msg.includes('industri') ||
    msg.includes('marché') ||
    msg.includes('similaire') ||
    msg.includes('comparable') ||
    msg.includes('leader') ||
    (msg.includes('recherch') && (msg.includes('stratégi') || msg.includes('promotion')))
  ) {
    return { topic: 'competition', confidence: 0.95 }
  }
  
  // Performance questions
  else if (msg.includes('comment') && (msg.includes('performance') || msg.includes('performe') || msg.includes('bien'))) {
    return { topic: 'performance', confidence: 0.95 }
  } else if (msg.includes('quel') && msg.includes('performance')) {
    return { topic: 'performance', confidence: 0.9 }
  }
  
  // Comparison questions (moins prioritaire que competitive)
  else if (msg.includes('compare') || msg.includes('vs') || msg.includes('meilleur') || msg.includes('entre')) {
    return { topic: 'comparison', confidence: 0.9 }
  }
  
  // Prediction/Future questions
  else if (msg.includes('futur') || msg.includes('prédi') || msg.includes('prochain') || msg.includes('6 mois') || msg.includes('3 mois')) {
    return { topic: 'prediction', confidence: 0.9 }
  }
  
  // Alternative strategies/tunnels
  else if (
    msg.includes('tunnel') || 
    msg.includes('promotion') ||
    msg.includes('stratégi') ||
    msg.includes('alternatif') ||
    msg.includes('nouvea') ||
    msg.includes('autres') ||
    msg.includes('proposer') ||
    msg.includes('suggestion') ||
    msg.includes('explorer') ||
    msg.includes('tester')
  ) {
    return { topic: 'strategy', confidence: 0.9 }
  }
  
  // Strategy/Optimization questions
  else if (
    msg.includes('optimis') || 
    msg.includes('budget') || 
    msg.includes('recommande') || 
    msg.includes('faire') ||
    msg.includes('devr') ||
    msg.includes('alloc') ||
    msg.includes('investir') ||
    msg.includes('alloca') ||
    msg.includes('transfér') ||
    msg.includes('améliorer') ||
    msg.includes('augment')
  ) {
    return { topic: 'strategy', confidence: 0.9 }
  }
  
  // Default
  else {
    return { topic: 'general', confidence: 0.5 }
  }
}

function extractChannel(message) {
  const channels = ['digital', 'radio', 'terrain', 'influence', 'parrainage', 'autre']
  for (const canal of channels) {
    if (message.includes(canal)) return canal
  }
  return null
}

function extractChannels(message) {
  const channels = ['digital', 'radio', 'terrain', 'influence', 'parrainage', 'autre']
  return channels.filter(canal => message.includes(canal))
}

function extractHorizon(message) {
  if (message.includes('6')) return '6'
  if (message.includes('3')) return '3'
  if (message.includes('trimestre')) return '3'
  if (message.includes('semestre')) return '6'
  return '3' // default
}

export default {
  analyzeHistorical,
  analyzePresent,
  predictFuture,
  compareSimilarStrategies,
  generateInsights,
  ConversationManager,
}
