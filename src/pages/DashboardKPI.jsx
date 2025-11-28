import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { supabase } from '../lib/supabase'
import './DashboardKPI.css'

export default function DashboardKPI() {
  const [kpiList, setKpiList] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les KPI depuis Supabase
  useEffect(() => {
    const loadKPIs = async (showLoader = false) => {
      try {
        if (showLoader) setLoading(true)
        const { data, error } = await supabase
          .from('kpi_financiers')
          .select('*')
          .order('mois', { ascending: false })
        
        if (error) {
          console.error('Erreur chargement KPI:', error)
          // Fallback sur localStorage
          const saved = localStorage.getItem('kpiFinanciers')
          setKpiList(saved ? JSON.parse(saved) : [])
        } else {
          setKpiList(data || [])
          localStorage.setItem('kpiFinanciers', JSON.stringify(data || []))
        }
      } catch (err) {
        console.error('Erreur:', err)
      } finally {
        if (showLoader) setLoading(false)
      }
    }
    
    // Chargement initial avec loader
    loadKPIs(true)

    // Polling toutes les 5 secondes sans loader
    const interval = setInterval(() => loadKPIs(false), 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading || kpiList.length === 0) {
    return <div className="dashboard-kpi-empty">Aucun KPI financier enregistré.</div>
  }

  const latest = kpiList[0]
  const mois = latest.mois

  // Parser les données JSON si nécessaire
  const parseCible = typeof latest.cible === 'string' ? JSON.parse(latest.cible) : (latest.cible || {})
  const parseReel = typeof latest.reel === 'string' ? JSON.parse(latest.reel) : (latest.reel || {})

  // Préparer les données pour le comparatif Cible vs Réel
  const comparatifData = [
    {
      name: 'Coût Utilisateur',
      Cible: Number(parseCible.coutUtilisateur || 0),
      Réel: Number(parseReel.coutUtilisateur || 0)
    },
    {
      name: 'CPA',
      Cible: Number(parseCible.CPA || 0),
      Réel: Number(parseReel.CPA || 0)
    },
    {
      name: 'Transactions',
      Cible: Number(parseCible.transactions || 0),
      Réel: Number(parseReel.transactions || 0)
    },
    {
      name: 'Panier Moyen',
      Cible: Number(parseCible.panierMoyen || 0),
      Réel: Number(parseReel.panierMoyen || 0)
    },
    {
      name: 'Volume',
      Cible: Number(parseCible.volume || 0),
      Réel: Number(parseReel.volume || 0)
    },
    {
      name: 'Bénéfice Brut',
      Cible: Number(parseCible.beneficeBrut || 0),
      Réel: Number(parseReel.beneficeBrut || 0)
    }
  ]

  // ajouter entrée pour bénéfice réel dans le comparatif
  comparatifData.push({
    name: 'Bénéfice Réel',
    Cible: Number(parseCible.benefices || 0),
    Réel: Number(parseReel.benefices || 0)
  })

  // Calcul écart Dépenses vs Bénéfices
  const ecartCible = Number(parseCible.benefices || 0) - Number(parseCible.depenses || 0)
  const ecartReel = Number(parseReel.benefices || 0) - Number(parseReel.depenses || 0)

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
          <p className="kpi-value">{Number(parseCible.beneficeBrut || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F</p>
        </div>
        <div className="dashboard-kpi-card">
          <h4>Bénéfice Brut (Réel)</h4>
          <p className="kpi-value">{Number(parseReel.beneficeBrut || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F</p>
        </div>
        <div className="dashboard-kpi-card">
          <h4>Bénéfice Réel (Cible)</h4>
          <p className="kpi-value">{Number(parseCible.benefices || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F</p>
        </div>
        <div className="dashboard-kpi-card">
          <h4>Bénéfice Réel (Réel)</h4>
          <p className="kpi-value">{Number(parseReel.benefices || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F</p>
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
