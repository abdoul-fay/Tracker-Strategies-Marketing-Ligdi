import { useMemo, useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { db } from '../lib/supabase'
import { generateAlerts, AlertContainer } from '../components/AlertSystem'
import './Overview.css'

const formatNumber = (num) => {
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'G';
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

export default function Overview({ campagnes = [] }) {
  const [filterCanal, setFilterCanal] = useState('tous')
  const [kpiSettings, setKpiSettings] = useState({})

  // Charger les paramètres KPI depuis Supabase
  useEffect(() => {
    const loadKPISettings = async () => {
      try {
        const settings = await db.getKPISettings()
        if (settings) {
          setKpiSettings({
            roiTarget: settings.roi_target || 200,
            reachTarget: settings.reach_target || 10000,
            budgetMaxPerCampaign: settings.budget_max_per_campaign || 100000,
            budgetMaxGlobal: settings.budget_max_global || 500000,
            engagementTarget: settings.engagement_target || 5,
            costPerResultMax: settings.cost_per_result_max || 50
          })
        }
      } catch (err) {
        console.error('❌ Erreur chargement KPI settings:', err)
      }
    }
    loadKPISettings()
  }, [])

  const stats = useMemo(() => {
    const filtered = filterCanal === 'tous' 
      ? campagnes 
      : campagnes.filter(c => c.canal === filterCanal)

    const byMonth = {}
    const canals = new Set()

    filtered.forEach(c => {
      canals.add(c.canal || 'Autre')
      const month = c.date_start ? c.date_start.substring(0, 7) : 'N/A'
      if (!byMonth[month]) {
        byMonth[month] = { budget: 0, real: 0, roi: 0, count: 0, reach: 0 }
      }
      byMonth[month].budget += c.budget || 0
      byMonth[month].real += c.budget_reel || 0
      byMonth[month].roi += c.roi || 0
      byMonth[month].reach += c.reach || 0
      byMonth[month].count += 1
    })

    const totalBudget = filtered.reduce((sum, c) => sum + (c.budget || 0), 0)
    const totalReal = filtered.reduce((sum, c) => sum + (c.budget_reel || 0), 0)
    const totalReach = filtered.reduce((sum, c) => sum + (c.reach || 0), 0)
    const avgROI = filtered.length > 0 ? filtered.reduce((sum, c) => sum + (c.roi || 0), 0) / filtered.length : 0
    const roiValue = totalReal > 0 ? (totalReach * 171) / totalReal : 0

    return {
      byMonth,
      canals: Array.from(canals),
      totalBudget,
      totalReal,
      totalReach,
      avgROI,
      roi: roiValue.toFixed(2),
      economie: totalBudget - totalReal,
      ecart: totalBudget > 0 ? ((totalBudget - totalReal) / totalBudget * 100).toFixed(1) : 0,
      campagnesCount: filtered.length
    }
  }, [campagnes, filterCanal])

  const chartData = Object.entries(stats.byMonth).map(([month, data]) => ({
    month,
    budget: data.budget,
    real: data.real,
    roi: (data.roi / (data.count || 1)).toFixed(2)
  }))

  const canalData = stats.canals.map(canal => {
    const canalCamps = filterCanal === 'tous' 
      ? campagnes.filter(c => (c.canal || 'Autre') === canal)
      : campagnes.filter(c => c.canal === filterCanal)
    
    return {
      name: canal,
      budget: canalCamps.reduce((sum, c) => sum + (c.budget || 0), 0),
      real: canalCamps.reduce((sum, c) => sum + (c.budget_reel || 0), 0),
      reach: canalCamps.reduce((sum, c) => sum + (c.reach || 0), 0)
    }
  })

  const kpiTargets = useMemo(() => {
    return {
      roiTarget: kpiSettings.roiTarget || 200,
      reachTarget: kpiSettings.reachTarget || 10000,
      budgetMaxPerCampaign: kpiSettings.budgetMaxPerCampaign || 100000,
      budgetMaxGlobal: kpiSettings.budgetMaxGlobal || 500000,
      engagementTarget: kpiSettings.engagementTarget || 5,
      costPerResultMax: kpiSettings.costPerResultMax || 50
    }
  }, [kpiSettings])

  const cibleVsReel = useMemo(() => {
    try {
      const saved = localStorage.getItem('kpiFinanciers')
      if (!saved) return null
      const data = JSON.parse(saved)
      if (!Array.isArray(data) || data.length === 0) return null
      
      const latest = data[0]
      const cible = typeof latest.cible === 'string' ? JSON.parse(latest.cible) : latest.cible || {}
      const reel = typeof latest.reel === 'string' ? JSON.parse(latest.reel) : latest.reel || {}
      
      return { cible, reel, mois: latest.mois }
    } catch {
      return null
    }
  }, [])

  const alerts = generateAlerts(campagnes, kpiSettings)
  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="overview">
      <div className="overview-header">
        <h1>📊 Vue d'Ensemble Complète</h1>
        <p>Tous vos KPI au même endroit</p>
      </div>

      {/* Section Alertes */}
      {alerts.length > 0 && (
        <div className="overview-section">
          <h2>⚠️ Alertes Actives</h2>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
            <AlertContainer alerts={alerts} maxDisplay={5} />
          </div>
        </div>
      )}

      {/* KPI Clés */}
      <div className="overview-kpi-grid">
        <div className="overview-kpi-card">
          <div className="kpi-label">💰 Budget Réel</div>
          <div className="kpi-value">{formatNumber(stats.totalReal)}</div>
          <div className="kpi-desc">FCFA dépensé</div>
        </div>

        <div className="overview-kpi-card">
          <div className="kpi-label">👥 Utilisateurs</div>
          <div className="kpi-value">{formatNumber(stats.totalReach)}</div>
          <div className="kpi-desc">contacts atteints</div>
        </div>

        <div className="overview-kpi-card">
          <div className="kpi-label">🎯 ROI Moyen</div>
          <div className="kpi-value">{stats.avgROI.toFixed(1)}%</div>
          <div className="kpi-desc">rendement moyen</div>
        </div>

        <div className={`overview-kpi-card ${stats.ecart >= 0 ? 'positive' : 'negative'}`}>
          <div className="kpi-label">📈 Écart</div>
          <div className="kpi-value">{stats.ecart}%</div>
          <div className="kpi-desc">{stats.campagnesCount} campagnes</div>
        </div>
      </div>

      {/* Filtre Canal */}
      <div className="overview-filter">
        <label>Filtrer par canal :</label>
        <select value={filterCanal} onChange={(e) => setFilterCanal(e.target.value)}>
          <option value="tous">Tous les canaux</option>
          {stats.canals.map(canal => (
            <option key={canal} value={canal}>{canal}</option>
          ))}
        </select>
      </div>

      {/* Graphiques */}
      <div className="overview-charts-grid">
        {/* Évolution Budget */}
        <div className="overview-chart">
          <h3>📈 Évolution Budget & ROI</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Line type="monotone" dataKey="budget" stroke="#6366f1" name="Budget Prévu" strokeWidth={2} />
              <Line type="monotone" dataKey="real" stroke="#10b981" name="Budget Réel" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget par Canal */}
        <div className="overview-chart">
          <h3>🎯 Budget par Canal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={canalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="budget" fill="#6366f1" name="Budget Prévu" />
              <Bar dataKey="real" fill="#10b981" name="Budget Réel" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reach par Canal */}
        <div className="overview-chart">
          <h3>👥 Reach par Canal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={canalData}
                dataKey="reach"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {canalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cible vs Réel KPI */}
        {cibleVsReel && (
          <div className="overview-chart">
            <h3>🎯 KPI Cible vs Réel - {cibleVsReel.mois}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'CPA', Cible: Number(cibleVsReel.cible.CPA || 0), Réel: Number(cibleVsReel.reel.CPA || 0) },
                { name: 'Transactions', Cible: Number(cibleVsReel.cible.transactions || 0), Réel: Number(cibleVsReel.reel.transactions || 0) },
                { name: 'Panier Moyen', Cible: Number(cibleVsReel.cible.panierMoyen || 0), Réel: Number(cibleVsReel.reel.panierMoyen || 0) }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Cible" fill="#6366f1" />
                <Bar dataKey="Réel" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tableau Détails */}
      <div className="overview-section">
        <h2>📋 Détails Campagnes</h2>
        <div className="overview-table-container">
          <table className="overview-table">
            <thead>
              <tr>
                <th>Campagne</th>
                <th>Canal</th>
                <th>Budget</th>
                <th>Réel</th>
                <th>Reach</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {(filterCanal === 'tous' ? campagnes : campagnes.filter(c => c.canal === filterCanal))
                .slice(-10)
                .reverse()
                .map((camp, i) => (
                  <tr key={i}>
                    <td>{camp.nom}</td>
                    <td>{camp.canal || 'N/A'}</td>
                    <td>{formatNumber(camp.budget || 0)}</td>
                    <td>{formatNumber(camp.budget_reel || 0)}</td>
                    <td>{formatNumber(camp.reach || 0)}</td>
                    <td>{(camp.roi || 0).toFixed(1)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
