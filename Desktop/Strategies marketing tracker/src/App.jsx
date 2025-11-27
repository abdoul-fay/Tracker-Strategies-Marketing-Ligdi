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
import './App.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [data, setData] = useState({
    campagnes: [],
    ambassadeurs: [],
    strategies: []
  })

  // Charger données du localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ligdiData')
    if (saved) {
      setData(JSON.parse(saved))
    }
  }, [])

  // Sauvegarder données dans localStorage
  useEffect(() => {
    localStorage.setItem('ligdiData', JSON.stringify(data))
  }, [data])

  const updateCampagne = (index, campagne) => {
    const newCampagnes = [...data.campagnes]
    newCampagnes[index] = campagne
    setData({ ...data, campagnes: newCampagnes })
  }

  const addCampagne = (campagne) => {
    setData({ ...data, campagnes: [...data.campagnes, campagne] })
  }

  const deleteCampagne = (index) => {
    setData({ ...data, campagnes: data.campagnes.filter((_, i) => i !== index) })
  }

  const updateAmbassadeur = (index, ambassadeur) => {
    const newAmbassadeurs = [...data.ambassadeurs]
    newAmbassadeurs[index] = ambassadeur
    setData({ ...data, ambassadeurs: newAmbassadeurs })
  }

  const addAmbassadeur = (ambassadeur) => {
    setData({ ...data, ambassadeurs: [...data.ambassadeurs, ambassadeur] })
  }

  const deleteAmbassadeur = (index) => {
    setData({ ...data, ambassadeurs: data.ambassadeurs.filter((_, i) => i !== index) })
  }

  const updateStrategie = (index, strategie) => {
    const newStrategies = [...data.strategies]
    newStrategies[index] = strategie
    setData({ ...data, strategies: newStrategies })
  }

  const addStrategie = (strategie) => {
    setData({ ...data, strategies: [...data.strategies, strategie] })
  }

  const deleteStrategie = (index) => {
    setData({ ...data, strategies: data.strategies.filter((_, i) => i !== index) })
  }

  return (
    <div className="app">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="container">
        {currentPage === 'home' && <Home campagnes={data.campagnes} />}
        {currentPage === 'plan' && (
          <PlanMarketing 
            campagnes={data.campagnes}
            onAdd={addCampagne}
            onUpdate={updateCampagne}
            onDelete={deleteCampagne}
          />
        )}
        {currentPage === 'dashboard' && <Dashboard campagnes={data.campagnes} />}
        {currentPage === 'budget' && <BudgetGlobal campagnes={data.campagnes} />}
        {currentPage === 'ambassadeurs' && (
          <SuiviAmbassadeurs
            ambassadeurs={data.ambassadeurs}
            onAdd={addAmbassadeur}
            onUpdate={updateAmbassadeur}
            onDelete={deleteAmbassadeur}
          />
        )}
        {currentPage === 'strategies' && (
          <Strategies
            strategies={data.strategies}
            onAdd={addStrategie}
            onUpdate={updateStrategie}
            onDelete={deleteStrategie}
          />
        )}
        {currentPage === 'kpi' && (
          <KPIFinanciers />
        )}
        {currentPage === 'comparatif' && (
          <ComparatifPerformance />
        )}
      </div>
    </div>
  )
}
