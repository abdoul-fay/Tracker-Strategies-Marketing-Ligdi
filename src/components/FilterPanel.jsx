import { useState } from 'react'
import './FilterPanel.css'

export function AdvancedFilters({ campagnes = [], onFilter = () => {} }) {
  const [filters, setFilters] = useState({
    canal: 'all',
    minBudget: 0,
    maxBudget: 999999999,
    minROI: -100,
    maxROI: 100,
    status: 'all', // 'all', 'high_budget', 'low_roi', 'anomaly'
    sortBy: 'recent' // 'recent', 'budget', 'roi'
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  // Obtenir les canaux uniques
  const uniqueCanals = ['all', ...new Set(campagnes.map(c => c.canal).filter(Boolean))]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const applyFilters = (currentFilters) => {
    let filtered = [...campagnes]

    // Filter par canal
    if (currentFilters.canal !== 'all') {
      filtered = filtered.filter(c => c.canal === currentFilters.canal)
    }

    // Filter par budget
    filtered = filtered.filter(c => {
      const budget = c.budget || 0
      return budget >= currentFilters.minBudget && budget <= currentFilters.maxBudget
    })

    // Filter par ROI
    filtered = filtered.filter(c => {
      const roi = c.roi || 0
      return roi >= currentFilters.minROI && roi <= currentFilters.maxROI
    })

    // Filter par statut
    if (currentFilters.status === 'high_budget') {
      filtered = filtered.filter(c => (c.budget || 0) > 50000)
    } else if (currentFilters.status === 'low_roi') {
      filtered = filtered.filter(c => (c.roi || 0) < 2)
    } else if (currentFilters.status === 'anomaly') {
      const roiValues = filtered.map(c => c.roi || 0)
      const mean = roiValues.reduce((a, b) => a + b, 0) / roiValues.length
      const stdDev = Math.sqrt(roiValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / roiValues.length)
      filtered = filtered.filter(c => {
        const zScore = Math.abs(((c.roi || 0) - mean) / stdDev)
        return zScore > 2
      })
    }

    // Trier
    if (currentFilters.sortBy === 'budget') {
      filtered.sort((a, b) => (b.budget || 0) - (a.budget || 0))
    } else if (currentFilters.sortBy === 'roi') {
      filtered.sort((a, b) => (b.roi || 0) - (a.roi || 0))
    } else if (currentFilters.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    }

    onFilter(filtered)
  }

  const resetFilters = () => {
    const defaultFilters = {
      canal: 'all',
      minBudget: 0,
      maxBudget: 999999999,
      minROI: -100,
      maxROI: 100,
      status: 'all',
      sortBy: 'recent'
    }
    setFilters(defaultFilters)
    applyFilters(defaultFilters)
  }

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>🔍 Filtres</h3>
        <button 
          className="toggle-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} Avancé
        </button>
      </div>

      {/* Filtres basiques */}
      <div className="filter-basics">
        <div className="filter-group">
          <label>Canal</label>
          <select 
            value={filters.canal}
            onChange={e => handleFilterChange('canal', e.target.value)}
            className="filter-select"
          >
            {uniqueCanals.map(canal => (
              <option key={canal} value={canal}>
                {canal === 'all' ? 'Tous les canaux' : canal}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tri</label>
          <select 
            value={filters.sortBy}
            onChange={e => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="recent">Plus récent</option>
            <option value="budget">Budget (haut)</option>
            <option value="roi">ROI (haut)</option>
          </select>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="filter-advanced">
          <div className="filter-group">
            <label>Budget: {filters.minBudget.toLocaleString()} - {filters.maxBudget.toLocaleString()} F</label>
            <input 
              type="range"
              min="0"
              max="100000"
              value={filters.maxBudget}
              onChange={e => handleFilterChange('maxBudget', parseInt(e.target.value))}
              className="filter-range"
            />
          </div>

          <div className="filter-group">
            <label>ROI: {filters.minROI.toFixed(1)}% - {filters.maxROI.toFixed(1)}%</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number"
                min="-100"
                max="100"
                value={filters.minROI}
                onChange={e => handleFilterChange('minROI', parseFloat(e.target.value))}
                className="filter-input"
                placeholder="Min"
              />
              <input 
                type="number"
                min="-100"
                max="100"
                value={filters.maxROI}
                onChange={e => handleFilterChange('maxROI', parseFloat(e.target.value))}
                className="filter-input"
                placeholder="Max"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Statut</label>
            <select 
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous</option>
              <option value="high_budget">Budget élevé (> 50k)</option>
              <option value="low_roi">ROI faible (< 2%)</option>
              <option value="anomaly">Anomalies détectées</option>
            </select>
          </div>

          <button 
            onClick={resetFilters}
            className="reset-btn"
          >
            ↺ Réinitialiser
          </button>
        </div>
      )}
    </div>
  )
}

export default AdvancedFilters
