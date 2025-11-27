import { useMemo } from 'react'
import './BudgetGlobal.css'

export default function BudgetGlobal({ campagnes }) {
  const budgetData = useMemo(() => {
    const byMonth = {}

    campagnes.forEach(c => {
      const month = c.date ? c.date.substring(0, 7) : 'N/A'
      
      if (!byMonth[month]) {
        byMonth[month] = {
          budgetPrevx: 0,
          budgetReal: 0,
          byCanal: {}
        }
      }
      byMonth[month].budgetPrevx += c.budgetPrevx || 0
      byMonth[month].budgetReal += c.budgetReal || 0

      const canal = c.canal || 'Autre'
      if (!byMonth[month].byCanal[canal]) {
        byMonth[month].byCanal[canal] = { prevx: 0, real: 0 }
      }
      byMonth[month].byCanal[canal].prevx += c.budgetPrevx || 0
      byMonth[month].byCanal[canal].real += c.budgetReal || 0
    })

    return byMonth
  }, [campagnes])

  const totalPrevx = Object.values(budgetData).reduce((sum, m) => sum + m.budgetPrevx, 0)
  const totalReal = Object.values(budgetData).reduce((sum, m) => sum + m.budgetReal, 0)
  const ecartGlobal = totalPrevx > 0 ? ((totalReal / totalPrevx - 1) * 100).toFixed(2) : 0

  return (
    <div className="budget-global">
      <h1>💰 Budget Global</h1>

      <div className="budget-summary">
        <div className="summary-item">
          <h3>Budget Total Prévu</h3>
          <p>{totalPrevx.toLocaleString()} FCFA</p>
        </div>
        <div className="summary-item">
          <h3>Budget Total Réel</h3>
          <p>{totalReal.toLocaleString()} FCFA</p>
        </div>
        <div className="summary-item">
          <h3>Écart Global</h3>
          <p style={{ color: ecartGlobal > 0 ? '#dc3545' : '#28a745' }}>
            {ecartGlobal}%
          </p>
        </div>
        <div className="summary-item">
          <h3>Économies / Dépassements</h3>
          <p style={{ color: (totalReal - totalPrevx) > 0 ? '#dc3545' : '#28a745' }}>
            {(totalReal - totalPrevx).toLocaleString()} FCFA
          </p>
        </div>
      </div>

      <div className="budget-table">
        <h2>Budget par Mois</h2>
        <table>
          <thead>
            <tr>
              <th>Mois</th>
              <th>Budget Prévu</th>
              <th>Budget Réel</th>
              <th>Écart (FCFA)</th>
              <th>Écart %</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(budgetData).sort().map(([month, data]) => {
              const ecart = data.budgetReal - data.budgetPrevx
              const ecartPct = data.budgetPrevx > 0 ? ((data.budgetReal / data.budgetPrevx - 1) * 100).toFixed(2) : 0
              const statut = ecart > 0 ? '❌ Dépassement' : '✅ Dans budget'

              return (
                <tr key={month}>
                  <td><strong>{month}</strong></td>
                  <td>{data.budgetPrevx.toLocaleString()}</td>
                  <td>{data.budgetReal.toLocaleString()}</td>
                  <td style={{ color: ecart > 0 ? '#dc3545' : '#28a745' }}>
                    {ecart.toLocaleString()}
                  </td>
                  <td style={{ color: ecartPct > 0 ? '#dc3545' : '#28a745' }}>
                    {ecartPct}%
                  </td>
                  <td>{statut}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="budget-by-canal">
        <h2>Budget par Canal</h2>
        {Object.entries(budgetData).sort().map(([month, data]) => (
          <div key={`canal-${month}`} className="canal-section">
            <h3>{month}</h3>
            <table>
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Budget Prévu</th>
                  <th>Budget Réel</th>
                  <th>Écart %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.byCanal).sort().map(([canal, values]) => {
                  const ecart = values.prevx > 0 ? ((values.real / values.prevx - 1) * 100).toFixed(2) : 0
                  return (
                    <tr key={`${month}-${canal}`}>
                      <td>{canal}</td>
                      <td>{values.prevx.toLocaleString()}</td>
                      <td>{values.real.toLocaleString()}</td>
                      <td style={{ color: ecart > 0 ? '#dc3545' : '#28a745' }}>{ecart}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {campagnes.length === 0 && (
        <div className="empty-state">
          <p>Aucune donnée budgétaire. Ajoutez des campagnes pour voir le suivi.</p>
        </div>
      )}
    </div>
  )
}
