import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './DashboardKPI.css'

function getKPIData() {
  const saved = localStorage.getItem('kpiFinanciers')
  if (!saved) return []
  return JSON.parse(saved)
}

export default function DashboardKPI() {
  const kpiList = useMemo(() => getKPIData(), [])
  if (kpiList.length === 0) {
    return <div className="dashboard-kpi-empty">Aucun KPI financier enregistré.</div>
  }
  const latest = kpiList[0]
  const mois = latest.mois

  // Préparer les données pour le comparatif Cible vs Réel
  const comparatifData = [
    {
      name: 'Coût Utilisateur',
      Cible: Number(latest.cible.coutUtilisateur),
      Réel: Number(latest.reel.coutUtilisateur)
    },
    {
      name: 'CPA',
      Cible: Number(latest.cible.CPA),
      Réel: Number(latest.reel.CPA)
    },
    {
      name: 'Transactions',
      Cible: Number(latest.cible.transactions),
      Réel: Number(latest.reel.transactions)
    },
    {
      name: 'Panier Moyen',
      Cible: Number(latest.cible.panierMoyen),
      Réel: Number(latest.reel.panierMoyen)
    },
    {
      name: 'Volume',
      Cible: Number(latest.cible.volume),
      Réel: Number(latest.reel.volume)
    },
    {
      name: 'Bénéfice Brut',
      Cible: Number(latest.cible.beneficeBrut || 0),
      Réel: Number(latest.reel.beneficeBrut || 0)
    }
  ]

  // ajouter entrée pour bénéfice réel dans le comparatif
  comparatifData.push({
    name: 'Bénéfice Réel',
    Cible: Number(latest.cible.benefices || 0),
    Réel: Number(latest.reel.benefices || 0)
  })

  // Calcul écart Dépenses vs Bénéfices
  const ecartCible = Number(latest.cible.benefices) - Number(latest.cible.depenses)
  const ecartReel = Number(latest.reel.benefices) - Number(latest.reel.depenses)

  return (
    <div className="dashboard-kpi">
      <h2>KPI Financiers - {mois}</h2>
      <div className="dashboard-kpi-cards">
        <div className="dashboard-kpi-card">
          <h4>Écart Dépenses vs Bénéfices (Cible)</h4>
          <p className="kpi-value">{ecartCible.toLocaleString()} F</p>
        </div>
        <div className="dashboard-kpi-card">
          <h4>Écart Dépenses vs Bénéfices (Réel)</h4>
          <p className="kpi-value">{ecartReel.toLocaleString()} F</p>
        </div>
        <div className="dashboard-kpi-card">
          <h4>Bénéfice Brut (Cible)</h4>
          <p className="kpi-value">{Number(latest.cible.beneficeBrut || 0).toLocaleString()} F</p>
        </div>
        <div className="dashboard-kpi-card">
          <h4>Bénéfice Brut (Réel)</h4>
          <p className="kpi-value">{Number(latest.reel.beneficeBrut || 0).toLocaleString()} F</p>
        </div>
        <div className="dashboard-kpi-card">
          <h4>Bénéfice Réel (Cible)</h4>
          <p className="kpi-value">{Number(latest.cible.benefices || 0).toLocaleString()} F</p>
        </div>
        <div className="dashboard-kpi-card">
          <h4>Bénéfice Réel (Réel)</h4>
          <p className="kpi-value">{Number(latest.reel.benefices || 0).toLocaleString()} F</p>
        </div>
      </div>
      <div className="dashboard-kpi-chart">
        <h3>Comparatif Cible vs Réel</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={comparatifData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Cible" fill="#6366f1" radius={[8,8,0,0]} />
            <Bar dataKey="Réel" fill="#3b82f6" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
