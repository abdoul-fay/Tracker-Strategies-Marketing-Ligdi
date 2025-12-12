import { useMemo } from 'react'
import { generateRecommendations, formatRecommendation } from '../lib/recommendations'
import './Recommendations.css'

export default function Recommendations({ campagnes = [] }) {
  const kpiTargets = useMemo(() => {
    try {
      const saved = localStorage.getItem('kpiSettings')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }, [])

  const recommendations = useMemo(() => {
    const recs = generateRecommendations(campagnes, kpiTargets)
    return recs
      .map(formatRecommendation)
      .sort((a, b) => a.priority - b.priority)
  }, [campagnes, kpiTargets])

  const highPriority = recommendations.filter(r => r.severity === 'high')
  const mediumPriority = recommendations.filter(r => r.severity === 'medium')

  return (
    <div className="recommendations">
      <div className="recommendations-header">
        <h1>🎯 Recommandations Intelligentes</h1>
        <p>Actions concrètes basées sur votre analyse</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="recommendations-empty">
          <h3>✅ Tout va bien !</h3>
          <p>Aucune recommandation - Continuez vos efforts !</p>
        </div>
      ) : (
        <>
          {/* Résumé */}
          <div className="recommendations-summary">
            <div className="summary-card critical">
              <div className="summary-number">{highPriority.length}</div>
              <div className="summary-label">Actions Critiques</div>
            </div>
            <div className="summary-card warning">
              <div className="summary-number">{mediumPriority.length}</div>
              <div className="summary-label">Actions à Considérer</div>
            </div>
          </div>

          {/* Recommandations Critiques */}
          {highPriority.length > 0 && (
            <div className="recommendations-section critical-section">
              <h2>🚨 Actions Critiques à Prendre</h2>
              <div className="recommendations-grid">
                {highPriority.map((rec, i) => (
                  <div key={i} className="recommendation-card critical-card">
                    <div className="rec-icon">{rec.icon}</div>
                    <div className="rec-content">
                      <h3>{rec.title}</h3>
                      <p className="rec-action"><strong>→ {rec.action}</strong></p>
                      <p className="rec-details">{rec.details}</p>
                      {rec.metric && (
                        <div className="rec-metric">Métrique: {rec.metric.toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommandations Modérées */}
          {mediumPriority.length > 0 && (
            <div className="recommendations-section warning-section">
              <h2>⚡ Actions à Considérer</h2>
              <div className="recommendations-grid">
                {mediumPriority.map((rec, i) => (
                  <div key={i} className="recommendation-card warning-card">
                    <div className="rec-icon">{rec.icon}</div>
                    <div className="rec-content">
                      <h3>{rec.title}</h3>
                      <p className="rec-action"><strong>→ {rec.action}</strong></p>
                      <p className="rec-details">{rec.details}</p>
                      {rec.metric && (
                        <div className="rec-metric">Métrique: {rec.metric.toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guide d'Action */}
          <div className="recommendations-guide">
            <h2>📋 Guide d'Action</h2>
            <div className="guide-steps">
              <div className="guide-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Lire les recommandations critiques</h4>
                  <p>Identifiez les actions qui auront le plus d'impact sur vos performances</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Analyser les détails</h4>
                  <p>Allez voir les détails des campagnes mentionnées pour comprendre pourquoi</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Implémenter les changements</h4>
                  <p>Ajustez vos budgets, canaux, ou stratégies selon les recommandations</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Suivre les résultats</h4>
                  <p>Revenez à la Vue d'Ensemble pour voir les améliorations</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
