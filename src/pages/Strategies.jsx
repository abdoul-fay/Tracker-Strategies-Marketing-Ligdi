import { useState } from 'react'
import './Strategies.css'
import { useNotification } from '../contexts/NotificationContext'

const SEMAINES = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5']
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const STATUS_OPTIONS = [
  { value: 'planifie', label: '📋 Planifié', color: '#94a3b8' },
  { value: 'en-cours', label: '🔄 En cours', color: '#3b82f6' },
  { value: 'realise', label: '✅ Réalisé', color: '#10b981' }
]

export default function Strategies({ strategies, onAdd, onUpdate, onDelete }) {
  const { success, error: showError } = useNotification()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  
  const [formData, setFormData] = useState({
    mois: 0,
    annee: 2025,
    semaine: 1,
    titre: '',
    description: '',
    objectifs: '',
    budget_total: 0,
    canaux: '',
    status: 'planifie',
    versions: []
  })

  const handleOpen = (id = null, month = 0, week = 1) => {
    if (id !== null) {
      const strategy = strategies.find(s => s.id === id);
      if (strategy) {
        setFormData(strategy)
        setEditId(id)
      }
    } else {
      setFormData({
        mois: month,
        annee: new Date().getFullYear(),
        semaine: week,
        titre: '',
        description: '',
        objectifs: '',
        budget_total: 0,
        canaux: '',
        status: 'planifie',
        versions: []
      })
      setEditId(null)
    }
    setShowModal(true)
  }

  const handleSave = () => {
    const version = {
      date: new Date().toLocaleString('fr-FR'),
      titre: formData.titre,
      description: formData.description,
      objectifs: formData.objectifs,
      budget_total: formData.budget_total,
      canaux: formData.canaux
    }

    const updatedData = {
      ...formData,
      versions: editId !== null ? formData.versions : [version]
    }

    if (editId !== null) {
      updatedData.versions = [...formData.versions, version]
      const index = strategies.findIndex(s => s.id === editId)
      if (index !== -1) {
        onUpdate(index, updatedData)
        success('Stratégie mise à jour avec succès')
      }
    } else {
      onAdd(updatedData)
      success('Stratégie ajoutée avec succès')
    }
    setShowModal(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: (name === 'budget_total' || name === 'semaine' || name === 'mois') ? parseInt(value) || 0 : value
    })
  }

  // Grouper les stratégies par mois/année/semaine
  const stratByPeriod = {}
  strategies.forEach((s, idx) => {
    const key = `${s.annee}-${String(s.mois + 1).padStart(2, '0')}`
    if (!stratByPeriod[key]) {
      stratByPeriod[key] = {}
    }
    if (!stratByPeriod[key][s.semaine]) {
      stratByPeriod[key][s.semaine] = []
    }
    stratByPeriod[key][s.semaine].push({ ...s, idx })
  })

  return (
    <div className="strategies">
      <div className="header-section">
        <h1>📅 Stratégies Hebdomadaires</h1>
        <button className="btn-primary" onClick={() => handleOpen()}>
          + Nouvelle Stratégie
        </button>
      </div>

      <div className="info-box">
        <p>💡 Chaque semaine du mois peut avoir sa propre stratégie. Les modifications sont enregistrées automatiquement avec leur historique.</p>
      </div>

      <div className="months-container">
        {Object.entries(stratByPeriod).sort().reverse().map(([period, weeks]) => {
          const [year, month] = period.split('-')
          return (
            <div key={period} className="month-card">
              <h2 className="month-title">
                📆 {MOIS[parseInt(month) - 1]} {year}
              </h2>
              <div className="weeks-grid">
                {[1, 2, 3, 4, 5].map(weekNum => (
                  <div key={weekNum} className="week-card">
                    <h3 className="week-title">
                      {SEMAINES[weekNum - 1]}
                    </h3>
                    <div className="week-content">
                      {weeks[weekNum] && weeks[weekNum].length > 0 ? (
                        weeks[weekNum].map((strat, sIdx) => (
                          <div key={sIdx} className="strategy-item" style={{
                            borderLeftColor: STATUS_OPTIONS.find(s => s.value === (strat.status || 'planifie'))?.color || '#94a3b8'
                          }}>
                            <div className="strategy-header">
                              <h4>{strat.titre}</h4>
                              <span className="status-badge" style={{
                                backgroundColor: STATUS_OPTIONS.find(s => s.value === (strat.status || 'planifie'))?.color || '#94a3b8'
                              }}>
                                {STATUS_OPTIONS.find(s => s.value === (strat.status || 'planifie'))?.label}
                              </span>
                            </div>
                            <p className="description">{strat.description}</p>
                            <div className="strategy-details">
                              <span className="detail-badge">🎯 {strat.objectifs}</span>
                              <span className="detail-badge">💰 {strat.budget_total.toLocaleString()} F</span>
                            </div>
                            <div className="channels">
                              <span className="channel-badge">📢 {strat.canaux}</span>
                            </div>
                            
                            {strat.versions && strat.versions.length > 1 && (
                              <details className="version-history">
                                <summary>📋 {strat.versions.length} versions</summary>
                                <div className="timeline">
                                  {strat.versions.map((v, vIdx) => (
                                    <div key={vIdx} className="timeline-item">
                                      <div className="timeline-marker"></div>
                                      <div className="timeline-content">
                                        <p className="timeline-date">📌 {v.date}</p>
                                        <p className="timeline-text"><strong>{v.titre}</strong></p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}

                            <div className="strategy-actions">
                              <button className="btn-edit" onClick={() => {
                                setEditId(strat.id)
                                handleOpen(strat.id)
                              }}>
                                ✏️
                              </button>
                              <button className="btn-delete" onClick={() => {
                                const index = strategies.findIndex(s => s.id === strat.id);
                                if (index !== -1) {
                                  onDelete(index);
                                  success('Stratégie supprimée avec succès');
                                }
                              }}>
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-week">
                          <p>Aucune stratégie</p>
                          <button className="btn-add-week" onClick={() => handleOpen(null, parseInt(month) - 1, weekNum)}>
                            + Ajouter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {strategies.length === 0 && (
        <div className="empty-state">
          <p>📝 Aucune stratégie enregistrée. Créez votre première stratégie.</p>
        </div>
      )}

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              {editId !== null ? '✏️ Modifier' : '✨ Nouvelle Stratégie'}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mois</label>
                <select name="mois" value={formData.mois} onChange={handleChange}>
                  {MOIS.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Année</label>
                <input type="number" name="annee" value={formData.annee} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Semaine</label>
                <select name="semaine" value={formData.semaine} onChange={handleChange}>
                  {SEMAINES.map((s, idx) => <option key={idx} value={idx + 1}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Titre</label>
              <input 
                type="text" 
                name="titre" 
                value={formData.titre} 
                onChange={handleChange}
                placeholder="Ex: Campagne Terrain"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                rows="2"
                placeholder="Détails..."
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Objectifs</label>
                <input 
                  type="text" 
                  name="objectifs" 
                  value={formData.objectifs} 
                  onChange={handleChange}
                  placeholder="Ex: 500 installations"
                />
              </div>
              <div className="form-group">
                <label>Budget</label>
                <input 
                  type="number" 
                  name="budget_total" 
                  value={formData.budget_total} 
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Canaux</label>
              <input 
                type="text" 
                name="canaux" 
                value={formData.canaux} 
                onChange={handleChange}
                placeholder="Ex: Terrain, Digital"
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-success" onClick={handleSave}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
