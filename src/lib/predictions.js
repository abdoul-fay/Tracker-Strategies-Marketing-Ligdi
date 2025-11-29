/**
 * Module de prédictions ML simple
 * Utilise une régression linéaire pour prédire les tendances futures
 */

/**
 * Calcule une régression linéaire simple (y = ax + b)
 * @param {Array} dataPoints - Données historiques [{x, y}, ...]
 * @returns {Object} {slope, intercept, r2}
 */
function linearRegression(dataPoints) {
  if (dataPoints.length < 2) return null

  const n = dataPoints.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0

  dataPoints.forEach((point, i) => {
    const x = i
    const y = point.value
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
    sumY2 += y * y
  })

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // R² coefficient
  const meanY = sumY / n
  let ssRes = 0, ssTot = 0
  dataPoints.forEach((point, i) => {
    const predicted = slope * i + intercept
    const actual = point.value
    ssRes += Math.pow(actual - predicted, 2)
    ssTot += Math.pow(actual - meanY, 2)
  })
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  return { slope, intercept, r2 }
}

/**
 * Prédit les valeurs futures basées sur l'historique
 * @param {Array} historicalData - Données historiques [value1, value2, ...]
 * @param {number} monthsToPredict - Nombre de mois à prédire (3, 6, 12...)
 * @returns {Array} Prédictions futures avec confiance
 */
export function predictFutureTrend(historicalData = [], monthsToPredict = 3) {
  if (!historicalData || historicalData.length < 2) {
    return []
  }

  // Convertir les données en points (index, valeur)
  const dataPoints = historicalData.map((value, index) => ({
    value,
    index
  }))

  const regression = linearRegression(dataPoints)
  if (!regression) return []

  const { slope, intercept, r2 } = regression
  const predictions = []
  const startIndex = historicalData.length

  // Générer les prédictions
  for (let i = 1; i <= monthsToPredict; i++) {
    const predictedIndex = startIndex + i - 1
    const predictedValue = slope * predictedIndex + intercept
    const confidence = Math.max(0, Math.min(100, r2 * 100)) // 0-100%

    predictions.push({
      month: i,
      predicted: Math.max(0, predictedValue), // Ne pas aller en dessous de 0
      confidence,
      trend: slope > 0 ? 'up' : slope < 0 ? 'down' : 'stable'
    })
  }

  return predictions
}

/**
 * Détecte les anomalies dans les données
 * Utilise l'écart-type pour identifier les valeurs inhabituelles
 */
export function detectAnomalies(data = []) {
  if (data.length < 3) return []

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  const stdDev = Math.sqrt(variance)

  const anomalies = []
  const threshold = 2 // 2 écarts-types = ~95% confiance

  data.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev)
    if (zScore > threshold) {
      anomalies.push({
        index,
        value,
        severity: zScore > 3 ? 'high' : 'medium'
      })
    }
  })

  return anomalies
}

/**
 * Calcule le momentum (accélération/décélération des changements)
 */
export function calculateMomentum(data = []) {
  if (data.length < 3) return 0

  const recent = data.slice(-3)
  const older = data.slice(-6, -3)

  const recentGrowth = (recent[recent.length - 1] - recent[0]) / recent[0]
  const olderGrowth = (older[older.length - 1] - older[0]) / older[0]

  return recentGrowth - olderGrowth
}

/**
 * Génère des insights basés sur les données
 */
export function generateInsights(historicalData = [], predictions = []) {
  const insights = []

  if (!historicalData || historicalData.length < 2) {
    return insights
  }

  // Trend analysis
  const recent = historicalData.slice(-3)
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const oldAvg = historicalData.slice(0, 3).reduce((a, b) => a + b, 0) / 3

  if (recentAvg > oldAvg * 1.1) {
    insights.push({
      type: 'growth',
      message: `📈 Croissance positive: +${((recentAvg - oldAvg) / oldAvg * 100).toFixed(1)}%`,
      severity: 'positive'
    })
  } else if (recentAvg < oldAvg * 0.9) {
    insights.push({
      type: 'decline',
      message: `📉 Décroissance détectée: ${((recentAvg - oldAvg) / oldAvg * 100).toFixed(1)}%`,
      severity: 'warning'
    })
  }

  // Momentum
  const momentum = calculateMomentum(historicalData)
  if (momentum > 0.05) {
    insights.push({
      type: 'acceleration',
      message: '🚀 Accélération de la croissance détectée',
      severity: 'positive'
    })
  } else if (momentum < -0.05) {
    insights.push({
      type: 'deceleration',
      message: '⚠️ Ralentissement de la croissance',
      severity: 'warning'
    })
  }

  // Predictions
  if (predictions.length > 0) {
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    if (avgConfidence > 80) {
      insights.push({
        type: 'forecast',
        message: `🎯 Prédictions fiables (confiance: ${avgConfidence.toFixed(0)}%)`,
        severity: 'info'
      })
    } else if (avgConfidence < 50) {
      insights.push({
        type: 'forecast',
        message: `⚠️ Données insuffisantes pour prédictions fiables`,
        severity: 'warning'
      })
    }
  }

  // Anomalies
  const anomalies = detectAnomalies(historicalData)
  if (anomalies.length > 0) {
    insights.push({
      type: 'anomaly',
      message: `🔍 ${anomalies.length} anomalie(s) détectée(s)`,
      severity: anomalies.some(a => a.severity === 'high') ? 'warning' : 'info'
    })
  }

  return insights
}

export default {
  predictFutureTrend,
  detectAnomalies,
  calculateMomentum,
  generateInsights
}
