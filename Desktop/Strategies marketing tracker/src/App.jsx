import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PlanMarketing from './pages/PlanMarketing'
import Dashboard from './pages/Dashboard'
import BudgetGlobal from './pages/BudgetGlobal'
import SuiviAmbassadeurs from './pages/SuiviAmbassadeurs'
import Strategies from './pages/Strategies'
import KPIFinanciers from './pages/KPIFinanciers'
import ComparatifPerformance from './pages/ComparatifPerformance'
import BudgetIntelligence from './pages/BudgetIntelligence'
import { db } from './lib/supabase'
import './App.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [campagnes, setCampagnes] = useState([])
  const [ambassadeurs, setAmbassadeurs] = useState([])
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les données de Supabase au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('🔄 Chargement des données de Supabase...')
        const [campagnesData, ambassadeursData, strategiesData] = await Promise.all([
          db.getCampaigns(),
          db.getAmbassadors(),
          db.getStrategies()
        ])
        console.log('✅ Campagnes chargées:', campagnesData.length, campagnesData)
        setCampagnes(campagnesData)
        setAmbassadeurs(ambassadeursData)
        setStrategies(strategiesData)
      } catch (err) {
        console.error('❌ Error loading data from Supabase:', err)
        // Fallback to localStorage if Supabase fails
        const saved = localStorage.getItem('ligdiData')
        if (saved) {
          const data = JSON.parse(saved)
          setCampagnes(data.campagnes || [])
          setAmbassadeurs(data.ambassadeurs || [])
          setStrategies(data.strategies || [])
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Rafraîchir les campagnes toutes les 3 secondes (polling)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const campagnesData = await db.getCampaigns()
        setCampagnes(campagnesData)
      } catch (err) {
        console.error('Error refreshing campaigns:', err)
      }
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Chargement des données...
          </div>
        ) : (
          <>
            {currentPage === 'home' && <Home campagnes={campagnes} />}
            {currentPage === 'plan' && <PlanMarketing />}
            {currentPage === 'dashboard' && <Dashboard campagnes={campagnes} />}
            {currentPage === 'budget' && <BudgetGlobal campagnes={campagnes} />}
            {currentPage === 'ambassadeurs' && (
              <SuiviAmbassadeurs
                ambassadeurs={ambassadeurs}
                onAdd={(amb) => setAmbassadeurs([...ambassadeurs, amb])}
                onUpdate={(index, amb) => {
                  const newAmb = [...ambassadeurs]
                  newAmb[index] = amb
                  setAmbassadeurs(newAmb)
                }}
                onDelete={(index) => setAmbassadeurs(ambassadeurs.filter((_, i) => i !== index))}
              />
            )}
            {currentPage === 'strategies' && (
              <Strategies
                strategies={strategies}
                onAdd={(str) => setStrategies([...strategies, str])}
                onUpdate={(index, str) => {
                  const newStr = [...strategies]
                  newStr[index] = str
                  setStrategies(newStr)
                }}
                onDelete={(index) => setStrategies(strategies.filter((_, i) => i !== index))}
              />
            )}
            {currentPage === 'kpi' && (
              <KPIFinanciers />
            )}
            {currentPage === 'comparatif' && (
              <ComparatifPerformance />
            )}
            {currentPage === 'intelligence' && (
              <BudgetIntelligence campagnes={campagnes} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
