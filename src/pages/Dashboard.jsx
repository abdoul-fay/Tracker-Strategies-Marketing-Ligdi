import { useMemo, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import DashboardKPI from './DashboardKPI'
import { generateAlerts, AlertContainer } from '../components/AlertSystem'
import './Dashboard.css'

// Formatteur de nombres: k, M, G seulement si >= 10 chiffres (1 milliard+)
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
    const byCanal = {}

    campagnes.forEach(c => {
      const month = c.date_start ? c.date_start.substring(0, 7) : 'N/A'
      
      if (!byMonth[month]) {
        byMonth[month] = { budget: 0, real: 0, kpi: 0, roi: 0, count: 0 }
      }
      byMonth[month].budget += c.budget || 0
      byMonth[month].real += c.budget_reel || 0
      byMonth[month].roi += c.roi || 0
      byMonth[month].count += 1

      const canal = c.canal || 'Autre'
      if (!byCanal[canal]) {
        byCanal[canal] = { budget: 0, real: 0 }
      }
      byCanal[canal].budget += c.budget || 0
      byCanal[canal].real += c.budget_reel || 0
    })
    return { byMonth, byCanal }
  }, [campagnes])

  const chartData = Object.entries(stats.byMonth).map(([month, data]) => ({
    month,
    budget: data.budget,
    real: data.real,
    roi: (data.roi / (data.count || 1)).toFixed(2)
  }))

  const pieData = Object.entries(stats.byCanal).map(([canal, data]) => ({
    name: canal,
    value: data.budget,
    real: data.real
  }))

  const alerts = generateAlerts(campagnes)
  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="dashboard">
      <h1>📊 Dashboard Marketing</h1>

      {/* Section Alertes */}
      <div style={{ marginBottom: 20, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
        <AlertContainer alerts={alerts} maxDisplay={3} />
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 'bold', marginRight: 10 }}>Période :</label>
        <select value={period} onChange={e => setPeriod(e.target.value)}>
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Budget Total</h3>
          <p className="value">{formatNumber(Object.values(stats.byMonth).reduce((sum, m) => sum + m.budget, 0))} FCFA</p>
        </div>
        <div className="kpi-card">
          <h3>Budget Réel</h3>
          <p className="value">{formatNumber(Object.values(stats.byMonth).reduce((sum, m) => sum + m.real, 0))} FCFA</p>
        </div>
        <div className="kpi-card">
          <h3>Nombre de Campagnes</h3>
          <p className="value">{campagnes.length}</p>
        </div>
        <div className="kpi-card">
          <h3>ROI Moyen</h3>
          <p className="value">{(Object.values(stats.byMonth).reduce((sum, m) => sum + m.roi, 0) / (Object.keys(stats.byMonth).length || 1)).toFixed(2)}%</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>📈 Évolution Budget par Mois</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="budget" stroke="#6366f1" name="Budget Prévu" />
            <Line type="monotone" dataKey="real" stroke="#3b82f6" name="Budget Réel" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-section">
        <h2>🎯 Répartition Budget par Canal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-section">
        <h2>📊 Comparaison Budget par Canal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pieData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#6366f1" name="Budget Prévu" />
            <Bar dataKey="real" fill="#3b82f6" name="Budget Réel" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DashboardKPI />
    </div>
  )
}
