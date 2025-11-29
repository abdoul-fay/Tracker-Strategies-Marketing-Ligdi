import { CONFIG } from '../config'
import { calculateMomentum, detectAnomalies } from '../lib/predictions'
import { useState } from 'react'

/**
 * Système d'alertes avancées pour les seuils marketing
 * Retourne les alertes basées sur les données de campagnes + ML
 */
export function generateAlerts(campagnes = []) {
  const alerts = []
  const thresholds = CONFIG.ALERT_THRESHOLDS

  if (!campagnes || campagnes.length === 0) return alerts

  // 1. Vérifier les campagnes qui dépassent le budget individuel
  campagnes.forEach(camp => {
    if (camp.budget > thresholds.maxBudgetPerCampaign) {
      alerts.push({
        id: `budget_${camp.id}`,
        type: 'danger',
        title: '⚠️ Budget élevé',
        message: `Campagne "${camp.name}": ${camp.budget.toLocaleString()} FCFA (limite: ${thresholds.maxBudgetPerCampaign.toLocaleString()})`,
        severity: 'high'
      })
    }
  })

  // 2. Vérifier le budget total
  const totalBudget = campagnes.reduce((sum, c) => sum + (c.budget || 0), 0)
  if (totalBudget > thresholds.maxTotalBudget) {
    alerts.push({
      id: 'total_budget',
      type: 'warning',
      title: '📊 Budget global élevé',
      message: `Total: ${totalBudget.toLocaleString()} FCFA (limite: ${thresholds.maxTotalBudget.toLocaleString()})`,
      severity: 'medium'
    })
  }

  // 3. Vérifier les ROI faibles
  campagnes.forEach(camp => {
    if (camp.roi && camp.roi < thresholds.minROI) {
      alerts.push({
        id: `roi_${camp.id}`,
        type: 'warning',
        title: '📉 ROI faible',
        message: `Campagne "${camp.name}": ROI ${camp.roi.toFixed(2)}% (minimum: ${thresholds.minROI}%)`,
        severity: 'medium'
      })
    }
  })

  // 4. Vérifier l'écart budget vs réel
  campagnes.forEach(camp => {
    if (camp.budget > 0) {
      const deviation = Math.abs((camp.budget_reel - camp.budget) / camp.budget) * 100
      if (deviation > thresholds.maxBudgetDeviation) {
        alerts.push({
          id: `deviation_${camp.id}`,
          type: camp.budget_reel > camp.budget ? 'danger' : 'info',
          title: camp.budget_reel > camp.budget ? '💸 Budget dépassé' : '✅ Économies',
          message: `Campagne "${camp.name}": écart de ${deviation.toFixed(1)}%`,
          severity: camp.budget_reel > camp.budget ? 'high' : 'low'
        })
      }
    }
  })

  // 5. Alertes avancées : Croissance / Décroissance
  if (campagnes.length >= 3) {
    const recentCamps = campagnes.slice(0, 3)
    const recentBudget = recentCamps.reduce((sum, c) => sum + (c.budget || 0), 0) / recentCamps.length
    const olderCamps = campagnes.slice(3, 6)
    const olderBudget = olderCamps.length > 0 
      ? olderCamps.reduce((sum, c) => sum + (c.budget || 0), 0) / olderCamps.length
      : recentBudget

    const growthRate = (recentBudget - olderBudget) / olderBudget * 100
    if (growthRate > 20) {
      alerts.push({
        id: 'growth_spike',
        type: 'info',
        title: '📈 Croissance de budget',
        message: `Augmentation détectée: +${growthRate.toFixed(1)}%`,
        severity: 'low'
      })
    } else if (growthRate < -20 && olderCamps.length > 0) {
      alerts.push({
        id: 'growth_decline',
        type: 'warning',
        title: '📉 Réduction de budget',
        message: `Diminution détectée: ${growthRate.toFixed(1)}%`,
        severity: 'medium'
      })
    }
  }

  // 6. Alertes d'anomalies (ROI extrêmement hauts/bas)
  const roiValues = campagnes.map(c => c.roi || 0).filter(r => r !== 0)
  if (roiValues.length >= 3) {
    const anomalies = detectAnomalies(roiValues)
    anomalies.forEach((anom, i) => {
      if (i < 2) { // Afficher max 2 anomalies
        const camp = campagnes[anom.index]
        if (camp && anom.value > 20) {
          alerts.push({
            id: `roi_anomaly_${camp.id}`,
            type: 'success',
            title: '🚀 ROI exceptionnel',
            message: `Campagne "${camp.name}": ROI ${anom.value.toFixed(2)}%`,
            severity: 'low'
          })
        } else if (camp && anom.value < -10) {
          alerts.push({
            id: `roi_anomaly_neg_${camp.id}`,
            type: 'danger',
            title: '⚠️ ROI très faible',
            message: `Campagne "${camp.name}": ROI ${anom.value.toFixed(2)}%`,
            severity: 'high'
          })
        }
      }
    })
  }

  return alerts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

/**
 * Composant d'affichage des alertes
 */
export function AlertBadge({ alert, compact = false }) {
  const typeStyles = {
    danger: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#dc2626' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#d97706' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#1d4ed8' },
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#059669' }
  }

  const style = typeStyles[alert.type] || typeStyles.info

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: '12px',
          fontSize: 'clamp(10px, 1.5vw, 12px)',
          color: style.text,
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}
        title={alert.message}
      >
        <span>{alert.title.split(' ')[0]}</span>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 'clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '8px',
        marginBottom: '10px',
        color: style.text,
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
    >
      <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>{alert.title}</div>
      <div style={{ fontSize: 'clamp(11px, 2vw, 14px)', opacity: 0.9 }}>{alert.message}</div>
    </div>
  )
}

/**
 * Container pour afficher toutes les alertes
 */
export function AlertContainer({ alerts, maxDisplay = 5 }) {
  const [isOpen, setIsOpen] = useState(false)

  const alertCount = alerts?.length || 0
  const hasAlerts = alertCount > 0
  
  // Déterminer la couleur du bouton basée sur la sévérité des alertes
  const maxSeverity = alerts?.reduce((max, alert) => {
    const severityMap = { danger: 3, high: 3, warning: 2, medium: 2, info: 1, low: 1 }
    return Math.max(max, severityMap[alert.severity] || 0)
  }, 0)
  
  const buttonColor = maxSeverity === 3 ? '#ef4444' : maxSeverity === 2 ? '#f59e0b' : '#10b981'
  const buttonBgColor = maxSeverity === 3 ? 'rgba(239, 68, 68, 0.1)' : maxSeverity === 2 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'

  if (!hasAlerts) {
    return (
      <div
        style={{
          padding: '10px 12px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          color: '#059669',
          textAlign: 'center',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: 'clamp(12px, 2vw, 15px)',
          minHeight: '40px'
        }}
      >
        ✅ Tout est bon ! Aucune alerte.
      </div>
    )
  }

  const displayedAlerts = isOpen ? alerts : alerts.slice(0, maxDisplay)
  const hiddenCount = !isOpen ? (alerts.length - maxDisplay) : 0

  return (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
          background: buttonBgColor,
          border: `2px solid ${buttonColor}`,
          borderRadius: '8px',
          color: buttonColor,
          fontSize: 'clamp(13px, 2.5vw, 15px)',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
          marginBottom: isOpen ? '12px' : '0',
          minHeight: '44px',
          gap: '8px',
          flexWrap: 'nowrap'
        }}
        onMouseOver={e => e.target.style.background = buttonColor + '20'}
        onMouseOut={e => e.target.style.background = buttonBgColor}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>
          🔔 Alertes ({alertCount})
        </span>
        <span style={{ fontSize: 'clamp(14px, 3vw, 18px)', transition: 'transform 0.3s', flexShrink: 0 }}>
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            background: 'white',
            border: `1px solid ${buttonColor}`,
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: 'clamp(8px, 2vw, 12px)',
            animation: 'slideDown 0.3s ease',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {displayedAlerts.map(alert => (
            <AlertBadge key={alert.id} alert={alert} />
          ))}
          {hiddenCount > 0 && (
            <div
              style={{
                padding: '8px 12px',
                fontSize: 'clamp(11px, 2vw, 13px)',
                color: '#666',
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              +{hiddenCount} autres alertes
            </div>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          button {
            min-height: 48px;
          }
          
          div[style*="animation: slideDown"] {
            max-height: 50vh;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  )
}

export default { generateAlerts, AlertBadge, AlertContainer }
