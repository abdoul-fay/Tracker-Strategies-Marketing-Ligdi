import { CONFIG } from '../config'

/**
 * Système d'alertes pour les seuils marketing
 * Retourne les alertes basées sur les données de campagnes
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
          fontSize: '12px',
          color: style.text,
          fontWeight: '600'
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
        padding: '12px 16px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '8px',
        marginBottom: '10px',
        color: style.text
      }}
    >
      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{alert.title}</div>
      <div style={{ fontSize: '14px', opacity: 0.9 }}>{alert.message}</div>
    </div>
  )
}

/**
 * Container pour afficher toutes les alertes
 */
export function AlertContainer({ alerts, maxDisplay = 5 }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div
        style={{
          padding: '16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          color: '#059669',
          textAlign: 'center',
          fontWeight: '600'
        }}
      >
        ✅ Tout est bon ! Aucune alerte.
      </div>
    )
  }

  const displayedAlerts = alerts.slice(0, maxDisplay)
  const hiddenCount = alerts.length - displayedAlerts.length

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#1a1a2e', fontSize: '16px' }}>
        🔔 Alertes ({alerts.length})
      </h3>
      <div>
        {displayedAlerts.map(alert => (
          <AlertBadge key={alert.id} alert={alert} />
        ))}
        {hiddenCount > 0 && (
          <div
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              color: '#666',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            +{hiddenCount} autres alertes non affichées
          </div>
        )}
      </div>
    </div>
  )
}

export default { generateAlerts, AlertBadge, AlertContainer }
