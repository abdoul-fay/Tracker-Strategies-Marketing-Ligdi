import { useState, useEffect } from 'react'
import './PlanMarketing.css'
import { db } from '../lib/supabase'

const CANAUX = ['Terrain', 'Radio', 'Digital', 'Influence', 'Parrainage', 'Autre']
const ETATS = ['À venir', 'En cours', 'Terminé']

export default function PlanMarketing() {
  const [campagnes, setCampagnes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    action: '',
    canal: 'Terrain',
    budget: 0,
    budget_reel: 0,
    kpi_cible: '',
    kpi_reel: '',
    roi: 0,
    etat: 'À venir',
    responsable: '',
    date_start: '',
    date_end: ''
  })

  // Load campaigns from Supabase
  useEffect(() => {
    const loadCampagnes = async () => {
      try {
        setLoading(true)
        const data = await db.getCampaigns()
        setCampagnes(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Error loading campaigns:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCampagnes()
  }, [])

  const handleOpen = (id = null) => {
    if (id) {
      const campaign = campagnes.find(c => c.id === id)
      if (campaign) {
        setFormData(campaign)
        setEditingId(id)
      }
    } else {
      setFormData({
        name: '',
        action: '',
        canal: 'Terrain',
        budget: 0,
        budget_reel: 0,
        kpi_cible: '',
        kpi_reel: '',
        roi: 0,
        etat: 'À venir',
        responsable: '',
        date_start: '',
        date_end: ''
      })
      setEditingId(null)
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await db.updateCampaign(editingId, formData)
        setCampagnes(campagnes.map(c => c.id === editingId ? { ...c, ...formData } : c))
      } else {
        const newCampaign = await db.addCampaign(formData)
        setCampagnes([newCampaign, ...campagnes])
      }
      setShowModal(false)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error saving campaign:', err)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      try {
        await db.deleteCampaign(id)
        setCampagnes(campagnes.filter(c => c.id !== id))
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Error deleting campaign:', err)
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: (name === 'budget' || name === 'roi') ? parseFloat(value) || 0 : value
    })
  }

  const totalBudget = campagnes.reduce((sum, c) => sum + (c.budget || 0), 0)
  const totalBudgetReel = campagnes.reduce((sum, c) => sum + (c.budget_reel || 0), 0)
  const totalROI = campagnes.reduce((sum, c) => sum + (c.roi || 0), 0)

  const calcTaux = (cible, reel) => {
    if (!cible || cible === 0 || cible === '0') return 0
    const cibleNum = typeof cible === 'string' ? parseInt(cible) : cible
    const reelNum = typeof reel === 'string' ? parseInt(reel) : reel
    if (isNaN(cibleNum) || isNaN(reelNum)) return 0
    return ((reelNum / cibleNum) * 100).toFixed(1)
  }

  const calcCoutParUser = (budget, kpiReel) => {
    if (!budget || budget === 0 || !kpiReel || kpiReel === '0') return 0
    const budgetNum = typeof budget === 'string' ? parseFloat(budget) : budget
    const reelNum = typeof kpiReel === 'string' ? parseInt(kpiReel) : kpiReel
    if (isNaN(budgetNum) || isNaN(reelNum)) return 0
    return (budgetNum / reelNum).toFixed(2)
  }

  const calcEcartBudget = (prevu, reel) => {
    if (!prevu || prevu === 0 || prevu === '0') return 0
    const prevuNum = typeof prevu === 'string' ? parseFloat(prevu) : prevu
    const reelNum = typeof reel === 'string' ? parseFloat(reel) : reel
    if (isNaN(prevuNum) || isNaN(reelNum)) return 0
    return ((reelNum - prevuNum) / prevuNum * 100).toFixed(1)
  }

  return (
    <div className="plan-marketing">
      {error && <div className="error-message">⚠️ {error}</div>}
      {loading && <div className="loading">Chargement des campagnes...</div>}

      <div className="header-section">
        <h1>📋 Plan Marketing</h1>
        <button className="btn-primary" onClick={() => handleOpen()}>
          + Ajouter Campagne
        </button>
      </div>

      <div className="totals-row">
        <div className="total-item">
          <span>Budget Prévu Total:</span>
          <strong>{totalBudget.toLocaleString()} FCFA</strong>
        </div>
        <div className="total-item">
          <span>Budget Réel Total:</span>
          <strong>{totalBudgetReel.toLocaleString()} FCFA</strong>
        </div>
        <div className="total-item">
          <span>ROI Total:</span>
          <strong>{totalROI.toLocaleString()} FCFA</strong>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Action</th>
              <th>Canal</th>
              <th>Date Début</th>
              <th>Budget Prévu</th>
              <th>Budget Réel</th>
              <th>Écart %</th>
              <th>KPI Cible</th>
              <th>KPI Réel</th>
              <th>% Atteint</th>
              <th>Coût/User</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && campagnes.length === 0 && (
              <tr>
                <td colSpan="13" style={{ textAlign: 'center', color: '#999' }}>
                  Aucune campagne. Ajoutez-en une pour commencer.
                </td>
              </tr>
            )}
            {campagnes.map((campagne) => (
              <tr key={campagne.id}>
                <td>{campagne.name}</td>
                <td>{campagne.action}</td>
                <td><span className="badge">{campagne.canal}</span></td>
                <td>{campagne.date_start}</td>
                <td>{campagne.budget?.toLocaleString() || 0}</td>
                <td>{campagne.budget_reel?.toLocaleString() || 0}</td>
                <td style={{ color: calcEcartBudget(campagne.budget, campagne.budget_reel) > 0 ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                  {calcEcartBudget(campagne.budget, campagne.budget_reel)}%
                </td>
                <td>{campagne.kpi_cible || '-'}</td>
                <td>{campagne.kpi_reel || '-'}</td>
                <td style={{ color: calcTaux(campagne.kpi_cible, campagne.kpi_reel) >= 100 ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                  {calcTaux(campagne.kpi_cible, campagne.kpi_reel)}%
                </td>
                <td>{campagne.budget_reel && campagne.kpi_reel ? calcCoutParUser(campagne.budget_reel, campagne.kpi_reel) + ' FCFA' : '-'}</td>
                <td><span className={`status ${campagne.etat?.toLowerCase() || ''}`}>{campagne.etat || 'À venir'}</span></td>
                <td>
                  <button className="btn-secondary" onClick={() => handleOpen(campagne.id)}>✏️</button>
                  <button className="btn-danger" onClick={() => handleDelete(campagne.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              {editingId ? 'Éditer Campagne' : 'Nouvelle Campagne'}
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Sortie Terrain Bobo" />
            </div>

            <div className="form-group">
              <label>Action</label>
              <input type="text" name="action" value={formData.action} onChange={handleChange} placeholder="Ex: Distribution, Activation" />
            </div>

            <div className="form-group">
              <label>Canal</label>
              <select name="canal" value={formData.canal} onChange={handleChange}>
                {CANAUX.map(canal => <option key={canal}>{canal}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date Début</label>
                <input type="date" name="date_start" value={formData.date_start} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Date Fin</label>
                <input type="date" name="date_end" value={formData.date_end} onChange={handleChange} />
              </div>
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#ddd' }} />
            <h4 style={{ marginBottom: '15px' }}>📋 Objectifs (Avant)</h4>

            <div className="form-row">
              <div className="form-group">
                <label>Budget Prévu (FCFA)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>KPI Cible</label>
                <input type="text" name="kpi_cible" value={formData.kpi_cible} onChange={handleChange} placeholder="Ex: 1500-2000 users" />
              </div>
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#ddd' }} />
            <h4 style={{ marginBottom: '15px' }}>✅ Résultats Réels (Après)</h4>

            <div className="form-row">
              <div className="form-group">
                <label>Budget Réel (FCFA)</label>
                <input type="number" name="budget_reel" value={formData.budget_reel} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>KPI Réel</label>
                <input type="text" name="kpi_reel" value={formData.kpi_reel} onChange={handleChange} placeholder="Ex: 1750 users" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ROI Estimé (FCFA)</label>
                <input type="number" name="roi" value={formData.roi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>État</label>
                <select name="etat" value={formData.etat} onChange={handleChange}>
                  {ETATS.map(etat => <option key={etat}>{etat}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Responsable</label>
              <input type="text" name="responsable" value={formData.responsable} onChange={handleChange} placeholder="Nom du responsable" />
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
