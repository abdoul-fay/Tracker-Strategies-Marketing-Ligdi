import { useMemo, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import DashboardKPI from './DashboardKPI'
import { generateAlerts, AlertContainer } from '../components/AlertSystem'
import { exportCampagnesPDF } from '../lib/pdfExport'
import './Dashboard.css'

// Formatteur de nombres
const formatNumber = (num) => {
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'G';
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

const PERIODS = [
  { value: 'week', label: 'Hebdomadaire' },
  { value: 'month', label: 'Mensuel' },
  { value: 'year', label: 'Annuel' }
];

export default function Dashboard({ campagnes }) {
  const [period, setPeriod] = useState('week');
  
  const stats = useMemo(() => {
    const byMonth = {}

    campagnes.forEach(c => {
      const month = c.date_start ? c.date_start.substring(0, 7) : 'N/A'
      
      if (!byMonth[month]) {
        byMonth[month] = { budget: 0, real: 0, roi: 0, count: 0 }
      }
      byMonth[month].budget += c.budget || 0
      byMonth[month].real += c.budget_reel || 0
      byMonth[month].roi += c.roi || 0
      byMonth[month].count += 1
    })
    return { byMonth }
  }, [campagnes])

  const chartData = Object.entries(stats.byMonth).map(([month, data]) => ({
    month,
    budget: data.budget,
    real: data.real,
    roi: (data.roi / (data.count || 1)).toFixed(2)
  }))

  // Calcul des KPI prioritaires
  const kpiSummary = useMemo(() => {
    const totalBudget = Object.values(stats.byMonth).reduce((sum, m) => sum + m.budget, 0)
    const totalReal = Object.values(stats.byMonth).reduce((sum, m) => sum + m.real, 0)
    const totalReach = campagnes.reduce((sum, c) => sum + (c.reach || 0), 0)
    
    // ROI = (Reach × 171 F par utilisateur) / Budget Réel Dépensé
    const roiValue = totalReal > 0 ? (totalReach * 171) / totalReal : 0
    
    return {
      budgetPrevu: totalBudget,
      budgetReel: totalReal,
      economie: totalBudget - totalReal,
      ecart: totalBudget > 0 ? ((totalBudget - totalReal) / totalBudget * 100).toFixed(1) : 0,
      roi: roiValue.toFixed(2),
      reach: totalReach,
      campagnes: campagnes.length
    }
  }, [stats, campagnes])

  const alerts = generateAlerts(campagnes)

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>📊 Dashboard Marketing</h1>
        <button
          onClick={() => exportCampagnesPDF(campagnes)}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
          onMouseOver={e => e.target.style.background = '#4f46e5'}
          onMouseOut={e => e.target.style.background = '#6366f1'}
        >
          📥 Export PDF
        </button>
      </div>

      {/* Section Alertes */}
      <div style={{ marginBottom: 20, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
        <AlertContainer alerts={alerts} maxDisplay={3} />
      </div>

      {/* Section KPI Prioritaires */}
      <div className="kpi-grid-primary">
        <div className="kpi-card-primary">
          <div className="kpi-label">💰 Budget Réel Dépensé</div>
          <div className="kpi-value">{formatNumber(kpiSummary.budgetReel)}</div>
          <div className="kpi-unit">FCFA</div>
        </div>
        
        <div className="kpi-card-primary">
          <div className="kpi-label">🎯 ROI (Retour/Utilisateur)</div>
          <div className="kpi-value">{kpiSummary.roi}</div>
          <div className="kpi-unit">F par utilisateur</div>
        </div>

        <div className={`kpi-card-primary ${kpiSummary.ecart >= 0 ? 'positive' : 'negative'}`}>
          <div className="kpi-label">📈 Écart Budgétaire</div>
          <div className="kpi-value">{kpiSummary.ecart}%</div>
          <div className="kpi-unit">Prévu vs Réel</div>
        </div>

        <div className="kpi-card-primary">
          <div className="kpi-label">👥 Utilisateurs Atteints</div>
          <div className="kpi-value">{formatNumber(kpiSummary.reach)}</div>
          <div className="kpi-unit">{kpiSummary.campagnes} campagnes</div>
        </div>
      </div>

      {/* Section Évolution Budget */}
      <div className="dashboard-section">
        <h2>📈 Évolution Budget & ROI</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value) => formatNumber(value)}
              contentStyle={{ background: '#fff', borderRadius: '6px', border: '1px solid #ddd' }}
            />
            <Legend />
            <Line type="monotone" dataKey="budget" stroke="#6366f1" name="Budget Prévu" strokeWidth={2} />
            <Line type="monotone" dataKey="real" stroke="#10b981" name="Budget Réel" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Section KPI Financiers Détaillés */}
      <DashboardKPI />
    </div>
  )
}
