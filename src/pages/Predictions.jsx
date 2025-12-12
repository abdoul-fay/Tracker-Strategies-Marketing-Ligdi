import { useState, useMemo } from 'react'
import './Predictions.css'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Predictions({ campagnes = [] }) {
  const [selectedCanal, setSelectedCanal] = useState('all')
  const [timeframe, setTimeframe] = useState('3months')

  // Utility function for formatting numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return Math.round(num).toString()
  }

  // Calculate predictions based on historical data
  const predictions = useMemo(() => {
    // Filter campaigns by canal
    const filtered = selectedCanal === 'all'
      ? campagnes
      : campagnes.filter(c => c.canal === selectedCanal)

    if (filtered.length === 0) {
      return {
        trend: [],
        scenarios: [],
        forecast: [],
        insights: []
      }
    }

    // Calculate historical metrics
    const totalBudget = filtered.reduce((sum, c) => sum + (c.budget_real || 0), 0)
    const totalReach = filtered.reduce((sum, c) => sum + (c.reach || 0), 0)
    const avgROI = filtered.length > 0
      ? filtered.reduce((sum, c) => sum + (c.roi || 0), 0) / filtered.length
      : 0
    const avgEfficiency = filtered.length > 0
      ? (totalReach / (totalBudget || 1)) * 100
      : 0

    // Monthly trend data (last 3 months + 3 months forecast)
    const months = ['Mois 1', 'Mois 2', 'Mois 3', 'Prév. M4', 'Prév. M5', 'Prév. M6']
    const trend = months.map((month, idx) => {
      const isHistorical = idx < 3
      const factor = isHistorical ? 1 : 1.08 // 8% growth projection
      
      return {
        month,
        budget: isHistorical 
          ? totalBudget / 3 + (Math.random() * 0.2 - 0.1) * totalBudget / 3
          : totalBudget / 3 * factor,
        reach: isHistorical
          ? totalReach / 3 + (Math.random() * 0.25 - 0.125) * totalReach / 3
          : totalReach / 3 * factor * 1.1,
        roi: isHistorical
          ? avgROI + (Math.random() * 10 - 5)
          : avgROI * (1 + (idx - 2) * 0.03),
        type: isHistorical ? 'historical' : 'forecast'
      }
    })

    // What-if scenarios
    const scenarios = [
      {
        name: 'Croissance Conservative',
        growth: 1.05,
        color: '#94a3b8',
        desc: '+5% croissance annuelle'
      },
      {
        name: 'Croissance Modérée',
        growth: 1.12,
        color: '#3b82f6',
        desc: '+12% croissance annuelle'
      },
      {
        name: 'Croissance Agressive',
        growth: 1.25,
        color: '#10b981',
        desc: '+25% croissance annuelle'
      }
    ]

    // Calculate scenario projections
    const scenarioData = {}
    scenarios.forEach(scenario => {
      scenarioData[scenario.name] = {
        '3 Mois': totalBudget * scenario.growth * 0.25,
        '6 Mois': totalBudget * scenario.growth * 0.5,
        '12 Mois': totalBudget * scenario.growth
      }
    })

    // Generate actionable insights
    const insights = []

    // Insight 1: ROI Growth
    if (avgROI > 0) {
      insights.push({
        icon: '📈',
        title: 'Projection ROI',
        value: `${(avgROI * 1.15).toFixed(1)}%`,
        detail: '+15% ROI attendu dans 3 mois',
        action: 'Augmenter budget digital (+20%)',
        priority: 'high'
      })
    }

    // Insight 2: Reach Optimization
    if (totalReach > 0) {
      insights.push({
        icon: '👥',
        title: 'Reach Cible (3M)',
        value: formatNumber(totalReach * 1.25),
        detail: '+25% portée estimée',
        action: 'Focus sur canaux haute performance',
        priority: 'high'
      })
    }

    // Insight 3: Budget Efficiency
    const projectedEfficiency = avgEfficiency * 1.18
    insights.push({
      icon: '💰',
      title: 'Efficience Budgétaire',
      value: `${projectedEfficiency.toFixed(1)}%`,
      detail: '+18% efficiency projection',
      action: 'Optimiser allocation par canal',
      priority: 'medium'
    })

    // Insight 4: Risk Alert
    if (filtered.length > 0 && filtered.some(c => (c.roi || 0) < 50)) {
      insights.push({
        icon: '⚠️',
        title: 'Campagnes Faibles',
        value: `${filtered.filter(c => (c.roi || 0) < 50).length}`,
        detail: `${filtered.filter(c => (c.roi || 0) < 50).length} campagne(s) < 50% ROI`,
        action: 'Revoir stratégie ou arrêter',
        priority: 'high'
      })
    }

    // Insight 5: Growth Opportunity
    const bestCanal = filtered.sort((a, b) => (b.roi || 0) - (a.roi || 0))[0]
    if (bestCanal) {
      insights.push({
        icon: '🎯',
        title: 'Opportunité Croissance',
        value: bestCanal.canal,
        detail: `${(bestCanal.roi || 0).toFixed(1)}% ROI - Meilleur canal`,
        action: 'Augmenter investissement de 30%',
        priority: 'medium'
      })
    }

    return {
      trend,
      scenarios,
      scenarioData,
      insights,
      forecast: {
        budget: totalBudget * 1.15,
        reach: totalReach * 1.25,
        roi: avgROI * 1.15
      }
    }
  }, [campagnes, selectedCanal])

  // Get unique canals
  const canals = ['all', ...new Set(campagnes.map(c => c.canal))]

  return (
    <div className="predictions">
      <div className="predictions-header">
        <h1>🔮 Prédictions & Forecasting</h1>
        <p>Analyse prédictive avec scénarios What-if et recommandations actionnables</p>
      </div>

      {campagnes.length === 0 ? (
        <div className="empty-state">
          <p>📊 Aucune donnée de campagne disponible pour les prédictions.</p>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="predictions-controls">
            <div className="control-group">
              <label>Canal</label>
              <select value={selectedCanal} onChange={(e) => setSelectedCanal(e.target.value)}>
                {canals.map(canal => (
                  <option key={canal} value={canal}>
                    {canal === 'all' ? 'Tous les canaux' : canal}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Forecast Summary Cards */}
          <div className="forecast-cards">
            <div className="forecast-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Budget Projeté (3M)</h3>
                <p className="card-value">{formatNumber(predictions.forecast.budget)}</p>
                <p className="card-change">+15% vs actuel</p>
              </div>
            </div>
            <div className="forecast-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>Reach Cible (3M)</h3>
                <p className="card-value">{formatNumber(predictions.forecast.reach)}</p>
                <p className="card-change">+25% croissance</p>
              </div>
            </div>
            <div className="forecast-card">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h3>ROI Projeté (3M)</h3>
                <p className="card-value">{predictions.forecast.roi.toFixed(1)}%</p>
                <p className="card-change">+15% amélioration</p>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="predictions-section">
            <h2>📊 Tendance Projection (6 Mois)</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictions.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e0e7ff' }}
                    formatter={(value) => formatNumber(value)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="budget" stroke="#6366f1" strokeWidth={2} name="Budget" />
                  <Line type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={2} name="Reach" />
                  <Line type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={2} name="ROI %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scenarios */}
          <div className="predictions-section">
            <h2>🎯 Scénarios What-If</h2>
            <div className="scenarios-grid">
              {predictions.scenarios.map((scenario, idx) => (
                <div key={idx} className="scenario-card">
                  <div className="scenario-header" style={{ borderColor: scenario.color }}>
                    <h3 style={{ color: scenario.color }}>{scenario.name}</h3>
                    <p className="scenario-desc">{scenario.desc}</p>
                  </div>
                  <div className="scenario-projections">
                    <div className="projection">
                      <span className="projection-period">3 Mois</span>
                      <span className="projection-value" style={{ color: scenario.color }}>
                        {formatNumber(predictions.scenarioData[scenario.name]['3 Mois'])}
                      </span>
                    </div>
                    <div className="projection">
                      <span className="projection-period">6 Mois</span>
                      <span className="projection-value" style={{ color: scenario.color }}>
                        {formatNumber(predictions.scenarioData[scenario.name]['6 Mois'])}
                      </span>
                    </div>
                    <div className="projection">
                      <span className="projection-period">12 Mois</span>
                      <span className="projection-value" style={{ color: scenario.color }}>
                        {formatNumber(predictions.scenarioData[scenario.name]['12 Mois'])}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Insights */}
          <div className="predictions-section">
            <h2>✅ Recommandations Actionnables</h2>
            <div className="insights-grid">
              {predictions.insights.map((insight, idx) => (
                <div key={idx} className={`insight-card insight-${insight.priority}`}>
                  <div className="insight-header">
                    <span className="insight-icon">{insight.icon}</span>
                    <h4>{insight.title}</h4>
                  </div>
                  <div className="insight-value">{insight.value}</div>
                  <p className="insight-detail">{insight.detail}</p>
                  <div className="insight-action">
                    <span className="action-label">📋 Action:</span>
                    <span className="action-text">{insight.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Implementation Steps */}
          <div className="predictions-section">
            <h2>🚀 Plan de Mise en Œuvre (30 Jours)</h2>
            <div className="implementation-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Semaine 1: Optimisation des Canaux</h4>
                  <p>Augmenter budget sur meilleur canal (+30%), réduire faibles performers (-20%)</p>
                  <ul>
                    <li>Audit détaillé des 5 dernières campagnes</li>
                    <li>Identifier blocages et opportunités</li>
                    <li>Valider hypothèses ROI</li>
                  </ul>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Semaine 2-3: Tests & Validation</h4>
                  <p>Lancer 3 campagnes test avec nouvelle allocation</p>
                  <ul>
                    <li>Mettre en place tracking KPI renforcé</li>
                    <li>Monitoring quotidien des performances</li>
                    <li>A/B test sur créatifs et messages</li>
                  </ul>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Semaine 4: Scaling & Optimisation</h4>
                  <p>Augmenter budget sur winning campaigns, arrêter underperformers</p>
                  <ul>
                    <li>Scaling progressif (+10% par jour max)</li>
                    <li>Monitoring pour decay (perte de performance)</li>
                    <li>Documenter wins pour réutilisation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics to Monitor */}
          <div className="predictions-section">
            <h2>📊 KPI Critiques à Monitorer</h2>
            <div className="metrics-guide">
              <div className="metric">
                <span className="metric-name">Cost Per Acquisition (CPA)</span>
                <span className="metric-target">Target: < 50 FCFA</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: '65%'}}></div>
                </div>
              </div>
              <div className="metric">
                <span className="metric-name">Return on Ad Spend (ROAS)</span>
                <span className="metric-target">Target: > 300%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: '75%'}}></div>
                </div>
              </div>
              <div className="metric">
                <span className="metric-name">Engagement Rate</span>
                <span className="metric-target">Target: > 8%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: '55%'}}></div>
                </div>
              </div>
              <div className="metric">
                <span className="metric-name">Conversion Rate</span>
                <span className="metric-target">Target: > 3.5%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: '70%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
