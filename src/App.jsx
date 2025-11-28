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

  // Rafraîchir TOUTES les données toutes les 2 secondes (polling)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [campagnesData, ambassadeursData, strategiesData] = await Promise.all([
          db.getCampaigns(),
          db.getAmbassadors(),
          db.getStrategies()
        ])
        setCampagnes(campagnesData)
        setAmbassadeurs(ambassadeursData)
        setStrategies(strategiesData)
      } catch (err) {
        console.error('Error refreshing data:', err)
      }
    }, 2000)
    
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
                onAdd={async (amb) => {
                  try {
                    const newAmb = await db.addAmbassador(amb)
                    setAmbassadeurs([newAmb, ...ambassadeurs])
                  } catch (err) {
                    console.error('Erreur ajout ambassadeur:', err)
                    // Fallback: ajouter localement
                    setAmbassadeurs([amb, ...ambassadeurs])
                  }
                }}
                onUpdate={async (index, amb) => {
                  try {
                    const id = ambassadeurs[index]?.id
                    if (id) {
                      await db.updateAmbassador(id, amb)
                    }
                    const newAmb = [...ambassadeurs]
                    newAmb[index] = amb
                    setAmbassadeurs(newAmb)
                  } catch (err) {
                    console.error('Erreur mise à jour ambassadeur:', err)
                  }
                }}
                onDelete={async (index) => {
                  try {
                    const id = ambassadeurs[index]?.id
                    if (id) {
                      await db.deleteAmbassador(id)
                    }
                    setAmbassadeurs(ambassadeurs.filter((_, i) => i !== index))
                  } catch (err) {
                    console.error('Erreur suppression ambassadeur:', err)
                  }
                }}
              />
            )}
            {currentPage === 'strategies' && (
              <Strategies
                strategies={strategies}
                onAdd={async (str) => {
                  try {
                    const newStr = await db.addStrategy(str)
                    setStrategies([newStr, ...strategies])
                  } catch (err) {
                    console.error('Erreur ajout stratégie:', err)
                    // Fallback: ajouter localement
                    setStrategies([str, ...strategies])
                  }
                }}
                onUpdate={async (index, str) => {
                  try {
                    const id = strategies[index]?.id
                    if (id) {
                      await db.updateStrategy(id, str)
                    }
                    const newStr = [...strategies]
                    newStr[index] = str
                    setStrategies(newStr)
                  } catch (err) {
                    console.error('Erreur mise à jour stratégie:', err)
                  }
                }}
                onDelete={async (index) => {
                  try {
                    const id = strategies[index]?.id
                    if (id) {
                      await db.deleteStrategy(id)
                    }
                    setStrategies(strategies.filter((_, i) => i !== index))
                  } catch (err) {
                    console.error('Erreur suppression stratégie:', err)
                  }
                }}
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
