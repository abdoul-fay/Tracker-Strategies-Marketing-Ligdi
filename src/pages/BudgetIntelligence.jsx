import { useState, useEffect, useRef, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import './BudgetIntelligence.css'
import {
  analyzeHistorical,
  analyzePresent,
  predictFuture,
  compareSimilarStrategies,
  generateInsights,
  ConversationManager,
} from '../lib/aiEngine'

// Formatteur de nombres: k, M, G seulement si >= 10 chiffres (1 milliard+)
const formatNumber = (num) => {
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'G';
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

const PERIODS = [
  { value: 'all', label: '📊 Tous les périodes' },
  { value: 'month', label: '📅 Ce mois' },
  { value: '3months', label: '📈 3 derniers mois' },
  { value: '6months', label: '📊 6 derniers mois' },
]

export default function BudgetIntelligence({ campagnes = [] }) {
  console.log('🔵 BudgetIntelligence mounted with campagnes:', campagnes)
  const [activeTab, setActiveTab] = useState('analysis')
  const [period, setPeriod] = useState('all')
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [chatMessage, setChatMessage] = useState('')
  const [conversationHistory, setConversationHistory] = useState([])
  const [aiReady, setAiReady] = useState(false)
  const [error, setError] = useState(null)
  const conversationManagerRef = useRef(null)
  const chatEndRef = useRef(null)

  // Filtrer les campagnes par période
  const filteredCampaigns = useMemo(() => {
    if (!campagnes || campagnes.length === 0) return []
    
    const now = new Date()
    return campagnes.filter(c => {
      if (!c.date_start) return true // Si pas de date, inclure
      
      const campaignDate = new Date(c.date_start)
      
      if (period === 'month') {
        return campaignDate.getMonth() === now.getMonth() && campaignDate.getFullYear() === now.getFullYear()
      } else if (period === '3months') {
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        return campaignDate >= threeMonthsAgo
      } else if (period === '6months') {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        return campaignDate >= sixMonthsAgo
      }
      return true
    })
  }, [campagnes, period])

  // Analyser les données avec IA
  const analysis = useMemo(() => {
    try {
      if (!filteredCampaigns || filteredCampaigns.length === 0) {
        console.log('⚠️ Pas de campagnes filtrées')
        return null
      }
      
      console.log('📊 Analyse avec', filteredCampaigns.length, 'campagnes')
      console.log('🔍 Raw campaigns (last 3):', filteredCampaigns.slice(-3).map(c => ({
        nom: c.nom,
        roi: c.roi,
        reach: c.reach,
        budget: c.budget,
        type_roi: typeof c.roi,
      })))
      
      console.log('Functions disponibles:', {
        analyzeHistorical: typeof analyzeHistorical,
        analyzePresent: typeof analyzePresent,
        predictFuture: typeof predictFuture,
        compareSimilarStrategies: typeof compareSimilarStrategies,
        generateInsights: typeof generateInsights,
      })

      const historical = analyzeHistorical(filteredCampaigns)
      console.log('✅ Historical channelPerformance:', Object.entries(historical.channelPerformance).map(([canal, perf]) => ({
        canal,
        avgROI: perf.avgROI,
        avgReach: perf.avgReach,
        performanceScore: perf.performanceScore,
      })))
      
      const present = analyzePresent(filteredCampaigns, {})
      console.log('✅ Present:', present)
      
      const predictions = predictFuture(filteredCampaigns, historical.channelPerformance)
      console.log('✅ Predictions:', predictions)
      
      const comparison = compareSimilarStrategies(filteredCampaigns, historical.channelPerformance)
      console.log('✅ Comparison:', comparison)
      
      const insights = generateInsights(
        { ...historical },
        present,
        predictions,
        comparison
      )
      console.log('✅ Insights:', insights)

      return {
        historical,
        present,
        predictions,
        comparison,
        insights,
      }
    } catch (err) {
      console.error('❌ Erreur analyse:', err)
      console.error('Stack:', err.stack)
      setError(err.message || 'Erreur inconnue')
      return null
    }
  }, [filteredCampaigns])

  // Initialiser AI Conversation Manager
  useEffect(() => {
    if (analysis && !aiReady) {
      conversationManagerRef.current = new ConversationManager(analysis, selectedChannel)
      setAiReady(true)
    }
  }, [analysis, aiReady, selectedChannel])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory])

  // Gérer envoi message
  const handleSendMessage = () => {
    if (!chatMessage.trim() || !conversationManagerRef.current) return

    const response = conversationManagerRef.current.processMessage(chatMessage)
    setConversationHistory([
      ...conversationHistory,
      {
        user: chatMessage,
        ai: response,
        timestamp: new Date(),
      },
    ])
    setChatMessage('')
  }

  if (error) {
    return (
      <div className="budget-intelligence" style={{ padding: '20px' }}>
        <h1>🤖 Budget Intelligence IA</h1>
        <div style={{ 
          color: 'red', 
          padding: '20px', 
          backgroundColor: '#ffe6e6', 
          borderRadius: '8px',
          border: '2px solid red',
          marginTop: '20px'
        }}>
          <h3>❌ ERREUR</h3>
          <p><strong>{error}</strong></p>
          <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
            👉 Vérifiez la console (F12) pour plus de détails.
          </p>
          <details style={{ marginTop: '10px', fontSize: '11px' }}>
            <summary>Informations de débogage</summary>
            <pre>{JSON.stringify({ 
              campagnes: campagnes?.length, 
              filteredCampaigns: filteredCampaigns?.length, 
              period 
            }, null, 2)}</pre>
          </details>
        </div>
      </div>
    )
  }

  if (!analysis || filteredCampaigns.length === 0) {
    return (
      <div className="budget-intelligence" style={{ padding: '20px' }}>
        <h1>🤖 Budget Intelligence IA</h1>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          border: '2px solid #ffc107',
          marginTop: '20px'
        }}>
          <p>⚠️ <strong>Pas assez de données pour cette période.</strong></p>
          <ul style={{ marginTop: '10px', fontSize: '14px' }}>
            <li>Campagnes totales: <strong>{campagnes ? campagnes.length : 0}</strong></li>
            <li>Campagnes filtrées: <strong>{filteredCampaigns ? filteredCampaigns.length : 0}</strong></li>
            <li>Période: <strong>{period}</strong></li>
          </ul>
          <p style={{ marginTop: '15px' }}>➕ Essayez de:</p>
          <ul style={{ marginLeft: '20px' }}>
            <li>Sélectionner une autre période</li>
            <li>Ajouter des campagnes dans "Plan Marketing"</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="budget-intelligence">
      <h1>🤖 Budget Intelligence IA Avancée</h1>
      <p className="subtitle">Analyse Multi-Dimensionnelle: Passé | Présent | Futur</p>

      {/* Période Selector */}
      <div className="intelligence-controls">
        <select value={period} onChange={e => setPeriod(e.target.value)}>
          {PERIODS.map(p => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Health Score Card */}
      <div className="health-score-card">
        <div className="score-display">
          <div className="score-number" style={{ color: getScoreColor(analysis.present.healthScore) }}>
            {analysis.present.healthScore}
          </div>
          <div className="score-label">Marketing Health</div>
          <div className="score-status">{getScoreStatus(analysis.present.healthScore)}</div>
        </div>
        <div className="score-details">
          <div className="metric">
            <span>📊 Momentum:</span> <strong>{analysis.present.momentum}</strong>
          </div>
          <div className="metric">
            <span>💰 Avg ROI:</span> <strong>{Math.max(0, Math.min(Math.round(analysis.present.currentState.avgROI), 1000))}%</strong>
          </div>
          <div className="metric">
            <span>👥 Avg Reach:</span> <strong>{Math.max(0, (analysis.present.currentState.avgReach / 1000).toFixed(1))}k</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="intelligence-tabs">
        <button className={`tab ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>
          📊 Analyse Historique
        </button>
        <button className={`tab ${activeTab === 'comparison' ? 'active' : ''}`} onClick={() => setActiveTab('comparison')}>
          📈 Comparatif & Benchmarking
        </button>
        <button className={`tab ${activeTab === 'predictions' ? 'active' : ''}`} onClick={() => setActiveTab('predictions')}>
          🔮 Prédictions Futures
        </button>
        <button className={`tab ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>
          💡 Insights
        </button>
        <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          💬 Chat IA
        </button>
      </div>

      {/* ONGLET 1: ANALYSE HISTORIQUE */}
      {activeTab === 'analysis' && (
        <div className="tab-content">
          <h2>📊 Analyse Historique Détaillée</h2>

          {/* Performance par canal */}
          <div className="section">
            <h3>Performance par Canal</h3>
            <div className="channel-grid">
              {Object.entries(analysis.historical.channelPerformance).map(([canal, perf]) => (
                <div
                  key={canal}
                  className={`channel-card ${selectedChannel === canal ? 'selected' : ''}`}
                  onClick={() => setSelectedChannel(selectedChannel === canal ? null : canal)}
                >
                  <div className="channel-header">
                    <h4>{canal}</h4>
                    <span className="score">{Math.round(perf.performanceScore)}/100</span>
                  </div>
                  <div className="channel-metrics">
                    <div>📈 ROI: {(() => {
                      const roi = perf.avgROI
                      // If ROI > 100, it might be double-encoded, divide by 10
                      const normalizedROI = roi > 100 ? roi / 10 : roi
                      return Math.min(Math.round(normalizedROI * 10) / 10, 1000)
                    })()}%</div>
                    <div>👥 Reach: {Math.max(0, (perf.avgReach / 1000).toFixed(1))}k</div>
                    <div>💰 Efficacité: {(perf.costEfficiency || 0).toFixed(3)}</div>
                    <div className={`trend ${perf.trend}`}>
                      {perf.trend === 'up' ? '📈 Hausse' : perf.trend === 'down' ? '📉 Baisse' : '➡️ Stable'}
                    </div>
                  </div>
                  <div className="channel-budget">
                    Dépensé: {(perf.totalSpent / 1000).toFixed(0)}k FCFA
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Graphique ROI Timeline */}
          <div className="section">
            <h3>📈 Évolution ROI</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysis.historical.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="roi" stroke="#6366f1" name="ROI %" />
                <Line type="monotone" dataKey="reach" stroke="#3b82f6" name="Reach" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top & Worst Performers */}
          <div className="section-grid">
            <div className="section-card">
              <h3>🏆 Top Performers</h3>
              {analysis.historical.bestPerformers.map(([canal, perf]) => (
                <div key={canal} className="performer-item">
                  <span className="performer-name">{canal}</span>
                  <span className="performer-score">{Math.round(perf.performanceScore)}/100</span>
                </div>
              ))}
            </div>
            <div className="section-card">
              <h3>⚠️ À Améliorer</h3>
              {analysis.historical.worstPerformers.map(([canal, perf]) => (
                <div key={canal} className="performer-item">
                  <span className="performer-name">{canal}</span>
                  <span className="performer-score">{Math.round(perf.performanceScore)}/100</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 2: COMPARATIF & BENCHMARKING */}
      {activeTab === 'comparison' && (
        <div className="tab-content">
          <h2>📊 Comparatif avec Standards Industrie</h2>

          {/* Benchmark comparison chart */}
          <div className="section">
            <h3>Votre Performance vs Benchmark</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={Object.entries(analysis.comparison.channelComparison).map(([canal, comp]) => ({
                  canal,
                  yourPerf: comp.yourPerformance,
                  benchmark: comp.benchmarkScore,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="canal" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="yourPerf" fill="#6366f1" name="Votre Performance" />
                <Bar dataKey="benchmark" fill="#10b981" name="Benchmark Industrie" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gaps & Recommendations */}
          <div className="section">
            <h3>🎯 Opportunités d'Amélioration</h3>
            <div className="gaps-grid">
              {Object.entries(analysis.comparison.gaps).map(([canal, gap]) => (
                <div key={canal} className={`gap-card ${gap.severity}`}>
                  <h4>{canal}</h4>
                  <p className="severity">{gap.severity.toUpperCase()}</p>
                  <p className="suggestion">{gap.suggestion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="section">
            <h3>💡 Recommandations de Réallocation</h3>
            {analysis.comparison.recommendations.map((rec, i) => (
              <div key={i} className="recommendation-item">
                <span className="rec-type">{rec.type}</span>
                <p>{rec.message}</p>
                <p className="impact">{rec.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONGLET 3: PRÉDICTIONS FUTURES */}
      {activeTab === 'predictions' && (
        <div className="tab-content">
          <h2>🔮 Prédictions Futures (3 & 6 Mois)</h2>

          {/* 3-Month Forecast */}
          <div className="section">
            <h3>📅 Prédictions 3 Mois</h3>
            <div className="forecast-grid">
              {Object.entries(analysis.predictions.forecast3months).map(([canal, pred]) => (
                <div key={canal} className="forecast-card">
                  <h4>{canal}</h4>
                  <div className="forecast-metric">
                    <span>ROI Prédit:</span>
                    <strong className="value">{pred.expectedROI}%</strong>
                  </div>
                  <div className="forecast-metric">
                    <span>Reach Prédit:</span>
                    <strong className="value">{(pred.expectedReach / 1000).toFixed(1)}k</strong>
                  </div>
                  <div className="forecast-metric">
                    <span>Confiance:</span>
                    <strong className="value confidence">{Math.round(pred.confidence * 100)}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6-Month Forecast */}
          <div className="section">
            <h3>📊 Prédictions 6 Mois</h3>
            <div className="forecast-grid">
              {Object.entries(analysis.predictions.forecast6months).map(([canal, pred]) => (
                <div key={canal} className="forecast-card">
                  <h4>{canal}</h4>
                  <div className="forecast-metric">
                    <span>ROI Prédit:</span>
                    <strong className="value">{pred.expectedROI}%</strong>
                  </div>
                  <div className="forecast-metric">
                    <span>Reach Prédit:</span>
                    <strong className="value">{(pred.expectedReach / 1000).toFixed(1)}k</strong>
                  </div>
                  <div className="forecast-metric">
                    <span>Confiance:</span>
                    <strong className="value confidence">{Math.round(pred.confidence * 100)}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div className="section">
            <h3>🎲 Scénarios Alternatifs</h3>
            <div className="scenarios-container">
              {['optimistic', 'realistic', 'conservative'].map(scenario => (
                <div key={scenario} className={`scenario-card ${scenario}`}>
                  <h4 className="scenario-title">
                    {scenario === 'optimistic' ? '🚀' : scenario === 'realistic' ? '📊' : '⚠️'} {scenario.toUpperCase()}
                  </h4>
                  <div className="scenario-data">
                    {Object.entries(analysis.predictions.scenarios[scenario]).map(([canal, data]) => (
                      <div key={canal} className="scenario-item">
                        <span>{canal}:</span>
                        <span className="scenario-value">
                          ROI {data.roi}% • Reach {(data.reach / 1000).toFixed(1)}k • Budget {(data.budget / 1000).toFixed(0)}k
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 4: INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="tab-content">
          <h2>💡 Insights Intelligents</h2>

          {/* Key Findings */}
          <div className="section">
            <h3>🎯 Découvertes Clés</h3>
            {analysis.insights.keyFindings.map((finding, i) => (
              <div key={i} className="insight-card">
                <h4>{finding.title}</h4>
                <p>{finding.content}</p>
                {finding.actionable && <span className="actionable">✓ Actionnable</span>}
              </div>
            ))}
          </div>

          {/* Action Items */}
          <div className="section">
            <h3>📋 Actions Recommandées</h3>
            {analysis.insights.actionItems.map((item, i) => (
              <div key={i} className={`action-item priority-${item.priority}`}>
                <div className="action-header">
                  <span className="priority">{item.priority.toUpperCase()}</span>
                  <span className="timeline">{item.timeline}</span>
                </div>
                <p>{item.action}</p>
              </div>
            ))}
          </div>

          {/* Strategic Recommendations */}
          <div className="section">
            <h3>🎪 Recommandations Stratégiques</h3>
            {analysis.insights.strategicRecommendations.map((rec, i) => (
              <div key={i} className="strategy-card">
                <div className="strategy-header">
                  <h4>{rec.canal}</h4>
                  <span className={`strategy-badge ${rec.strategy.toLowerCase().replace(' ', '-')}`}>{rec.strategy}</span>
                </div>
                <p>{rec.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONGLET 5: CHAT IA */}
      {activeTab === 'chat' && (
        <div className="tab-content chat-tab">
          <h2>💬 Chat IA Interactif</h2>
          <p className="chat-intro">
            Discutez avec l'IA sur vos stratégies marketing, posez des questions, explorez des scénarios.
          </p>

          <div className="chat-container">
            {/* Messages */}
            <div className="messages">
              {conversationHistory.length === 0 && (
                <div className="welcome-message">
                  <h3>👋 Bienvenue dans Budget Intelligence Chat!</h3>
                  <p>Je peux vous aider avec:</p>
                  <ul>
                    <li>📊 Analyse de performance par canal</li>
                    <li>📈 Comparaisons stratégiques</li>
                    <li>🔮 Prédictions et scénarios</li>
                    <li>💡 Recommandations optimisées</li>
                    <li>💰 Stratégies de réallocation budgétaire</li>
                  </ul>
                  <p className="chat-prompt">Exemple de questions:</p>
                  <div className="example-questions">
                    <button onClick={() => setChatMessage('Comment performe Digital?')} className="example-btn">
                      Comment performe Digital?
                    </button>
                    <button onClick={() => setChatMessage('Compare Digital vs Influence')} className="example-btn">
                      Compare Digital vs Influence
                    </button>
                    <button onClick={() => setChatMessage('Qu recommandes-tu pour les 6 mois?')} className="example-btn">
                      Qu recommandes-tu pour les 6 mois?
                    </button>
                  </div>
                </div>
              )}

              {conversationHistory.map((msg, i) => (
                <div key={i} className="message-pair">
                  <div className="message user-message">
                    <p>{msg.user}</p>
                  </div>
                  <div className="message ai-message">
                    <div className="message-type-badge">{msg.ai.type || 'response'}</div>
                    <p>{msg.ai.message || msg.ai.interpretation}</p>
                    {msg.ai.followUp && <p className="follow-up">👉 {msg.ai.followUp}</p>}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                type="text"
                placeholder="Posez une question sur vos stratégies marketing..."
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSendMessage()
                  }
                }}
              />
              <button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                Envoyer 📤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getScoreColor(score) {
  if (score >= 80) return '#10b981' // green
  if (score >= 60) return '#f59e0b' // orange
  return '#ef4444' // red
}

function getScoreStatus(score) {
  if (score >= 80) return '✅ Excellent'
  if (score >= 60) return '⚠️ Bon'
  return '🔴 À améliorer'
}
