import { useState, useMemo } from 'react'
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { predictFutureTrend, generateInsights, detectAnomalies } from '../lib/predictions'
import { generateAdaptiveAlerts, calculateAdaptiveThresholds, evaluateStrategySuccess } from '../lib/adaptiveAlerts'
import './AdvancedAnalytics.css'

// Formatteur de nombres
const formatNumber = (num) => {
  const absNum = Math.abs(num)
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'G'
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
}

export default function AdvancedAnalytics({ campagnes = [] }) {
  const [predictionMonths, setPredictionMonths] = useState(3)
  const [selectedMetric, setSelectedMetric] = useState('budget')

  // Charger les paramètres KPI
  const kpiSettings = useMemo(() => {
    try {
      const saved = localStorage.getItem('kpiSettings')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }, [])

  // Calculer l'historique mensuel
  const monthlyHistory = useMemo(() => {
    const months = {}
    campagnes.forEach(camp => {
      const month = camp.created_at 
        ? new Date(camp.created_at).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
        : 'N/A'
      
      if (!months[month]) {
        months[month] = { budget: 0, real: 0, roi: 0, count: 0 }
      }
      months[month].budget += camp.budget || 0
      months[month].real += camp.budget_reel || 0
      months[month].roi += camp.roi || 0
      months[month].count += 1
    })

    return Object.entries(months).map(([month, data]) => ({
      month,
      budget: data.budget,
      real: data.real,
      roi: data.count > 0 ? data.roi / data.count : 0
    }))
  }, [campagnes])

  // Prédictions
  const budgetHistory = monthlyHistory.map(m => m.budget)
  const predictions = useMemo(() => {
    return predictFutureTrend(budgetHistory, predictionMonths)
  }, [budgetHistory, predictionMonths])

  // Insights
  const insights = useMemo(() => {
    return generateInsights(budgetHistory, predictions)
  }, [budgetHistory, predictions])

  // Anomalies
  const anomalies = useMemo(() => {
    return detectAnomalies(budgetHistory)
  }, [budgetHistory])

  // Alertes adaptatives
  const thresholds = useMemo(() => {
    const calc = calculateAdaptiveThresholds(campagnes, kpiSettings)
    console.log('📋 Thresholds calculated in AdvancedAnalytics:', calc)
    return calc
  }, [campagnes, kpiSettings])

  const adaptiveAlerts = useMemo(() => {
    console.log('🎯 Generating alerts with thresholds:', thresholds)
    const alerts = generateAdaptiveAlerts(campagnes, thresholds)
    console.log('🚨 Generated alerts:', alerts)
    return alerts
  }, [campagnes, thresholds])

  // Préparer les données pour le graphique (historique + prédictions)
  const chartData = useMemo(() => {
    const historical = monthlyHistory.map(m => ({
      ...m,
      isPredicted: false,
      confidence: 100
    }))

    const predicted = predictions.map((p, i) => ({
      month: `+${p.month}m`,
      budget: p.predicted,
      real: null,
      roi: null,
      isPredicted: true,
      confidence: p.confidence,
      trend: p.trend
    }))

    return [...historical, ...predicted]
  }, [monthlyHistory, predictions])

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <h1>🔮 Analyse Avancée & Prédictions</h1>
        <p>Tendances futures et insights intelligents basés sur ML</p>
      </div>

      {/* Section Alertes Adaptatives */}
      {adaptiveAlerts.length > 0 && (
        <div className="adaptive-alerts-section">
          <h2>⚠️ Alertes Intelligentes Adaptatives</h2>
          <div className="alerts-grid">
            {adaptiveAlerts.map((alert, i) => (
              <div key={i} className={`alert-card alert-${alert.severity}`}>
                <div className="alert-header">
                  <strong>{alert.message}</strong>
                </div>
                <div className="alert-body">
                  <p className="alert-campaign">{alert.campaign}</p>
                  <p className="alert-explanation">{alert.explanation}</p>
                  <div className="alert-values">
                    <span>Actuel: {typeof alert.value === 'number' ? alert.value.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : alert.value}</span>
                    <span>Seuil: {typeof alert.threshold === 'number' ? alert.threshold.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : alert.threshold}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Insights */}
      <div className="insights-section">
        <h2>💡 Insights Intelligents</h2>
        <div className="insights-grid">
          {insights.length > 0 ? (
            insights.map((insight, i) => (
              <div key={i} className={`insight-card insight-${insight.severity}`}>
                <div className="insight-title">{insight.message}</div>
                <div className="insight-type">({insight.type})</div>
              </div>
            ))
          ) : (
            <div className="insight-card">
              <p>Pas assez de données pour générer des insights. Ajoutez plus de campagnes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Section Graphique Prédictions */}
      <div className="prediction-section">
        <div className="section-header">
          <h2>📊 Prédictions Budget (Régression Linéaire)</h2>
          <div className="controls">
            <select 
              value={predictionMonths} 
              onChange={e => setPredictionMonths(parseInt(e.target.value))}
              className="select-input"
            >
              <option value={3}>3 mois</option>
              <option value={6}>6 mois</option>
              <option value={12}>12 mois</option>
            </select>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatNumber(value)}
                labelFormatter={(label) => `Mois: ${label}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="budget" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorBudget)"
                name="Budget Historique"
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#f59e0b"
                strokeDasharray="5 5"
                dot={{fill: '#f59e0b'}}
                name="Prédictions"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            Pas de données pour afficher les prédictions
          </div>
        )}

        {predictions.length > 0 && (
          <div className="predictions-table">
            <h3>Détail des prédictions</h3>
            <table>
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Budget Prédit</th>
                  <th>Confiance</th>
                  <th>Tendance</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p, i) => (
                  <tr key={i}>
                    <td>+{p.month} mois</td>
                    <td>{formatNumber(p.predicted)} F</td>
                    <td>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ 
                            width: `${p.confidence}%`,
                            background: p.confidence > 80 ? '#10b981' : p.confidence > 60 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                        {p.confidence.toFixed(0)}%
                      </div>
                    </td>
                    <td>
                      {p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '➡️'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section Anomalies */}
      {anomalies.length > 0 && (
        <div className="anomalies-section">
          <h2>🔍 Anomalies Détectées</h2>
          <div className="anomalies-list">
            {anomalies.map((anom, i) => (
              <div key={i} className={`anomaly-item severity-${anom.severity}`}>
                <span className="anomaly-badge">
                  {anom.severity === 'high' ? '🔴' : '🟠'}
                </span>
                <span className="anomaly-text">
                  Mois {anom.index + 1}: {formatNumber(anom.value)} F
                  {anom.severity === 'high' ? ' (Critique)' : ' (Attention)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Résumées */}
      <div className="summary-stats">
        <div className="stat-item">
          <h3>📊 Données Analysées</h3>
          <p>{monthlyHistory.length} mois d'historique</p>
        </div>
        <div className="stat-item">
          <h3>🎯 Campagnes</h3>
          <p>{campagnes.length} campagnes totales</p>
        </div>
        <div className="stat-item">
          <h3>💰 Budget Total</h3>
          <p>{formatNumber(campagnes.reduce((sum, c) => sum + (c.budget || 0), 0))} F</p>
        </div>
        <div className="stat-item">
          <h3>📈 Tendance</h3>
          <p>{predictions.length > 0 ? (predictions[0].trend === 'up' ? '📈 Haussière' : predictions[0].trend === 'down' ? '📉 Baissière' : '➡️ Stable') : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
