import { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import DashboardKPI from './DashboardKPI'
import './Dashboard.css'

export default function Dashboard({ campagnes }) {
  const stats = useMemo(() => {
    const byMonth = {}
    const byCanal = {}

    campagnes.forEach(c => {
      const month = c.date ? c.date.substring(0, 7) : 'N/A'
      
      if (!byMonth[month]) {
        byMonth[month] = { budget: 0, real: 0, kpi: 0, roi: 0, count: 0 }
      }
      byMonth[month].budget += c.budgetPrevx || 0
      byMonth[month].real += c.budgetReal || 0
      byMonth[month].roi += c.roi || 0
      byMonth[month].count += 1

      const canal = c.canal || 'Autre'
      if (!byCanal[canal]) {
        byCanal[canal] = { budget: 0, real: 0 }
      }
      byCanal[canal].budget += c.budgetPrevx || 0
      byCanal[canal].real += c.budgetReal || 0
    })

    return { byMonth, byCanal }
  }, [campagnes])

  const totalBudget = Object.values(stats.byMonth).reduce((sum, m) => sum + m.budget, 0)
  const totalReal = Object.values(stats.byMonth).reduce((sum, m) => sum + m.real, 0)
  const totalRoi = Object.values(stats.byMonth).reduce((sum, m) => sum + m.roi, 0)
  const avgEcart = totalBudget > 0 ? (((totalReal / totalBudget - 1) * 100).toFixed(2)) : 0

  // Préparer les données pour les graphiques
  const monthLabels = Object.keys(stats.byMonth).sort()
  
  const budgetChartData = monthLabels.map(month => ({
    month,
    'Budget Prévu': stats.byMonth[month].budget,
    'Budget Réel': stats.byMonth[month].real,
  }))

  const roiChartData = monthLabels.map(month => ({
    month,
    'ROI': stats.byMonth[month].roi,
  }))

  const canalData = Object.entries(stats.byCanal).sort().map(([canal, data]) => ({
    name: canal,
    value: data.budget,
  }))

  const COLORS = ['#0066cc', '#28a745', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14']

  if (campagnes.length === 0) {
    return (
      <div className="dashboard">
        <h1>📊 Dashboard KPI</h1>
        <div className="empty-state">
          <p>Aucune campagne enregistrée. Ajoutez des campagnes pour voir le dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1>📊 Dashboard KPI</h1>

        <DashboardKPI />

      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Budget Total Prévu</h3>
          <p className="value">{totalBudget.toLocaleString()} F</p>
        </div>
        <div className="kpi-card">
          <h3>Budget Total Réel</h3>
          <p className="value">{totalReal.toLocaleString()} F</p>
        </div>
        <div className="kpi-card">
          <h3>Écart Budgétaire</h3>
          <p className="value" style={{ color: avgEcart > 0 ? '#dc3545' : '#28a745' }}>{avgEcart}%</p>
        </div>
        <div className="kpi-card">
          <h3>ROI Total Estimé</h3>
          <p className="value">{totalRoi.toLocaleString()} F</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h2>📈 Évolution Budget Prévu vs Réel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Budget Prévu" stroke="#0066cc" strokeWidth={2} />
              <Line type="monotone" dataKey="Budget Réel" stroke="#dc3545" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>💰 ROI par Mois</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ROI" fill="#28a745" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>📊 Répartition Budget par Canal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={canalData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {canalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>KPI par Mois</h2>
        <table>
          <thead>
            <tr>
              <th>Mois</th>
              <th>Budget Prévu</th>
              <th>Budget Réel</th>
              <th>Écart %</th>
              <th>ROI Estimé</th>
              <th>Campagnes</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.byMonth).sort().map(([month, data]) => {
              const ecart = data.budget > 0 ? ((data.real / data.budget - 1) * 100).toFixed(2) : 0
              return (
                <tr key={month}>
                  <td><strong>{month}</strong></td>
                  <td>{data.budget.toLocaleString()}</td>
                  <td>{data.real.toLocaleString()}</td>
                  <td style={{ color: ecart > 0 ? '#dc3545' : '#28a745' }}>{ecart}%</td>
                  <td>{data.roi.toLocaleString()}</td>
                  <td>{data.count}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="dashboard-section">
        <h2>Répartition par Canal</h2>
        <table>
          <thead>
            <tr>
              <th>Canal</th>
              <th>Budget Prévu</th>
              <th>Budget Réel</th>
              <th>% Budget Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.byCanal).sort().map(([canal, data]) => {
              const pct = totalBudget > 0 ? ((data.budget / totalBudget) * 100).toFixed(1) : 0
              return (
                <tr key={canal}>
                  <td><strong>{canal}</strong></td>
                  <td>{data.budget.toLocaleString()}</td>
                  <td>{data.real.toLocaleString()}</td>
                  <td>{pct}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>


    </div>
  )
}
