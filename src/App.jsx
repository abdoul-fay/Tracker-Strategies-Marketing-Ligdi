import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ToastContainer from './components/Toast'
import { NotificationProvider } from './contexts/NotificationContext'
import Home from './pages/Home'
import PlanMarketing from './pages/PlanMarketing'
import Dashboard from './pages/Dashboard'
import BudgetGlobal from './pages/BudgetGlobal'
import SuiviAmbassadeurs from './pages/SuiviAmbassadeurs'
import Strategies from './pages/Strategies'
import KPIFinanciers from './pages/KPIFinanciers'
import ComparatifPerformance from './pages/ComparatifPerformance'
import BudgetIntelligence from './pages/BudgetIntelligence'
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import KPISettings from './pages/KPISettings'
import Overview from './pages/Overview'
import Recommendations from './pages/Recommendations'
import AmbassadeursCampagnes from './pages/AmbassadeursCampagnes'
import Benchmarking from './pages/Benchmarking'
import Predictions from './pages/Predictions'
import AnalyseUtilisateurs from './pages/AnalyseUtilisateurs'
import Login from './pages/Login'
import { db, supabase } from './lib/supabase'
import { getTenantId, getCurrentUser } from './lib/multiTenant'
import { useDarkMode } from './hooks/useDarkMode'
import './App.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [campagnes, setCampagnes] = useState([])
  const [ambassadeurs, setAmbassadeurs] = useState([])
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const { isDark, toggleDarkMode } = useDarkMode()

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && getTenantId()) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error('Auth check error:', err)
        setIsAuthenticated(false)
      } finally {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [])

  // Load data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = async () => {
      try {
        setLoading(true)
        console.log('🔄 Chargement des données de Supabase...')
        // TODO: Filter by tenant_id when fully integrated
        const [campagnesData, ambassadeursData, strategiesData] = await Promise.all([
          db.getCampaigns(),
          db.getAmbassadors(),
          db.getStrategies()
        ])
        console.log('✅ Campagnes chargées:', campagnesData.length)
        setCampagnes(campagnesData)
        setAmbassadeurs(ambassadeursData)
        setStrategies(strategiesData)
      } catch (err) {
        console.error('❌ Error loading data from Supabase:', err)
        // Fallback to localStorage if Supabase fails
        const saved = localStorage.getItem('companyData')
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
  }, [isAuthenticated])

  // Refresh data polling
  useEffect(() => {
    if (!isAuthenticated) return

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
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('tenant_id')
      localStorage.removeItem('current_user')
      setIsAuthenticated(false)
      setCurrentPage('home')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // If not authenticated, show login page
  if (!authChecked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>⏳ Chargement...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <NotificationProvider>
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      </NotificationProvider>
    )
  }

  return (
    <NotificationProvider>
      <div className="app">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          isDark={isDark}
          toggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
        />
        <ToastContainer />
        <div className="app-content">
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
                    console.log('🔄 Ajout ambassadeur:', amb)
                    const newAmb = await db.addAmbassador(amb)
                    console.log('✅ Ambassadeur ajouté:', newAmb)
                    // Recharger immédiatement depuis Supabase pour avoir les données fraîches avec l'ID
                    const updatedAmbs = await db.getAmbassadors()
                    console.log('📊 Ambassadeurs mis à jour:', updatedAmbs.length)
                    setAmbassadeurs(updatedAmbs)
                  } catch (err) {
                    console.error('❌ Erreur ajout ambassadeur:', err)
                    alert('Erreur: ' + err.message)
                  }
                }}
                onUpdate={async (index, amb) => {
                  try {
                    console.log('🔄 Mise à jour ambassadeur:', amb)
                    const id = ambassadeurs[index]?.id
                    if (id) {
                      await db.updateAmbassador(id, amb)
                      // Recharger depuis Supabase
                      const updatedAmbs = await db.getAmbassadors()
                      setAmbassadeurs(updatedAmbs)
                    }
                  } catch (err) {
                    console.error('❌ Erreur mise à jour ambassadeur:', err)
                    alert('Erreur: ' + err.message)
                  }
                }}
                onDelete={async (index) => {
                  try {
                    console.log('🔄 Suppression ambassadeur:', index)
                    const id = ambassadeurs[index]?.id
                    if (id) {
                      await db.deleteAmbassador(id)
                      // Recharger depuis Supabase
                      const updatedAmbs = await db.getAmbassadors()
                      setAmbassadeurs(updatedAmbs)
                    }
                  } catch (err) {
                    console.error('❌ Erreur suppression ambassadeur:', err)
                    alert('Erreur: ' + err.message)
                  }
                }}
              />
            )}
            {currentPage === 'strategies' && (
              <Strategies
                strategies={strategies}
                onAdd={async (str) => {
                  try {
                    console.log('🔄 Ajout stratégie:', str)
                    const newStr = await db.addStrategy(str)
                    console.log('✅ Stratégie ajoutée:', newStr)
                    // Recharger immédiatement depuis Supabase
                    const updatedStrats = await db.getStrategies()
                    console.log('📊 Stratégies mises à jour:', updatedStrats.length)
                    setStrategies(updatedStrats)
                  } catch (err) {
                    console.error('❌ Erreur ajout stratégie:', err)
                    alert('Erreur: ' + err.message)
                  }
                }}
                onUpdate={async (index, str) => {
                  try {
                    console.log('🔄 Mise à jour stratégie:', str)
                    const id = strategies[index]?.id
                    if (id) {
                      await db.updateStrategy(id, str)
                      // Recharger depuis Supabase
                      const updatedStrats = await db.getStrategies()
                      setStrategies(updatedStrats)
                    }
                  } catch (err) {
                    console.error('❌ Erreur mise à jour stratégie:', err)
                    alert('Erreur: ' + err.message)
                  }
                }}
                onDelete={async (index) => {
                  try {
                    console.log('🔄 Suppression stratégie:', index)
                    const id = strategies[index]?.id
                    if (id) {
                      await db.deleteStrategy(id)
                      // Recharger depuis Supabase
                      const updatedStrats = await db.getStrategies()
                      setStrategies(updatedStrats)
                    }
                  } catch (err) {
                    console.error('❌ Erreur suppression stratégie:', err)
                    alert('Erreur: ' + err.message)
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
            {currentPage === 'advanced' && (
              <AdvancedAnalytics campagnes={campagnes} />
            )}
            {currentPage === 'kpisettings' && (
              <KPISettings />
            )}
            {currentPage === 'overview' && (
              <Overview campagnes={campagnes} />
            )}
            {currentPage === 'recommendations' && (
              <Recommendations campagnes={campagnes} />
            )}
            {currentPage === 'ambassadorscampagnes' && (
              <AmbassadeursCampagnes campagnes={campagnes} ambassadeurs={ambassadeurs} />
            )}
            {currentPage === 'benchmarking' && (
              <Benchmarking campagnes={campagnes} />
            )}
            {currentPage === 'predictions' && (
              <Predictions campagnes={campagnes} />
            )}
            {currentPage === 'analyse' && (
              <AnalyseUtilisateurs campagnes={campagnes} />
            )}
          </>
        )}
      </div>
    </div>
    </NotificationProvider>
  )
}
