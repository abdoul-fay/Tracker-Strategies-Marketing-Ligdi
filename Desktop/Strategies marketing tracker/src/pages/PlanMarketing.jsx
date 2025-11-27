import { useState } from 'react'
import './PlanMarketing.css'

const CANAUX = ['Terrain', 'Radio', 'Digital', 'Influence', 'Parrainage', 'Autre']
const ETATS = ['À venir', 'En cours', 'Terminé']

export default function PlanMarketing({ campagnes, onAdd, onUpdate, onDelete }) {
  const [showModal, setShowModal] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    action: '',
    canal: 'Terrain',
    budgetPrevx: 0,
    budgetReal: 0,
    kpiCible: '',
    kpiReal: '',
    roi: 0,
    etat: 'À venir',
    responsable: '',
    commentaires: ''
  })

  const handleOpen = (index = null) => {
    if (index !== null) {
      setFormData(campagnes[index])
      setEditIndex(index)
    } else {
      setFormData({
        date: '',
        action: '',
        canal: 'Terrain',
        budgetPrevx: 0,
        budgetReal: 0,
        kpiCible: '',
        kpiReal: '',
        roi: 0,
        etat: 'À venir',
        responsable: '',
        commentaires: ''
      })
      setEditIndex(null)
    }
    setShowModal(true)
  }

  const handleSave = () => {
    if (editIndex !== null) {
      onUpdate(editIndex, formData)
    } else {
      onAdd(formData)
    }
    setShowModal(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name.includes('budget') || name === 'roi' ? parseFloat(value) || 0 : value
    })
  }

  const calcEcartBudget = (prevx, real) => {
    if (prevx === 0) return 0
    return ((real / prevx - 1) * 100).toFixed(2)
  }

  const totalBudgetPrevx = campagnes.reduce((sum, c) => sum + (c.budgetPrevx || 0), 0)
  const totalBudgetReal = campagnes.reduce((sum, c) => sum + (c.budgetReal || 0), 0)

  return (
    <div className="plan-marketing">
      <div className="header-section">
        <h1>📋 Plan Marketing</h1>
        <button className="btn-primary" onClick={() => handleOpen()}>
          + Ajouter Campagne
        </button>
      </div>

      <div className="totals-row">
        <div className="total-item">
          <span>Budget Prévu Total:</span>
          <strong>{totalBudgetPrevx.toLocaleString()} FCFA</strong>
        </div>
        <div className="total-item">
          <span>Budget Réel Total:</span>
          <strong>{totalBudgetReal.toLocaleString()} FCFA</strong>
        </div>
        <div className="total-item">
          <span>Écart:</span>
          <strong style={{ color: calcEcartBudget(totalBudgetPrevx, totalBudgetReal) > 0 ? '#dc3545' : '#28a745' }}>
            {calcEcartBudget(totalBudgetPrevx, totalBudgetReal)}%
          </strong>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Canal</th>
              <th>Budget Prévu</th>
              <th>Budget Réel</th>
              <th>KPI Cible</th>
              <th>KPI Réel</th>
              <th>ROI</th>
              <th>État</th>
              <th>Responsable</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campagnes.map((campagne, idx) => (
              <tr key={idx}>
                <td>{campagne.date}</td>
                <td>{campagne.action}</td>
                <td><span className="badge">{campagne.canal}</span></td>
                <td>{campagne.budgetPrevx.toLocaleString()}</td>
                <td>{campagne.budgetReal.toLocaleString()}</td>
                <td>{campagne.kpiCible}</td>
                <td>{campagne.kpiReal}</td>
                <td>{campagne.roi}</td>
                <td><span className={`status ${campagne.etat.toLowerCase()}`}>{campagne.etat}</span></td>
                <td>{campagne.responsable}</td>
                <td>
                  <button className="btn-secondary" onClick={() => handleOpen(idx)}>✏️</button>
                  <button className="btn-danger" onClick={() => onDelete(idx)}>🗑️</button>
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
              {editIndex !== null ? 'Éditer Campagne' : 'Nouvelle Campagne'}
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Action</label>
              <input type="text" name="action" value={formData.action} onChange={handleChange} placeholder="Ex: Sortie terrain Bobo-Dioulasso" />
            </div>

            <div className="form-group">
              <label>Canal</label>
              <select name="canal" value={formData.canal} onChange={handleChange}>
                {CANAUX.map(canal => <option key={canal}>{canal}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Budget Prévu (FCFA)</label>
                <input type="number" name="budgetPrevx" value={formData.budgetPrevx} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Budget Réel (FCFA)</label>
                <input type="number" name="budgetReal" value={formData.budgetReal} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>KPI Cible</label>
                <input type="text" name="kpiCible" value={formData.kpiCible} onChange={handleChange} placeholder="Ex: 1500-2000 installations" />
              </div>
              <div className="form-group">
                <label>KPI Réel</label>
                <input type="text" name="kpiReal" value={formData.kpiReal} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>ROI Estimé (FCFA)</label>
              <input type="number" name="roi" value={formData.roi} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>État</label>
                <select name="etat" value={formData.etat} onChange={handleChange}>
                  {ETATS.map(etat => <option key={etat}>{etat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Responsable</label>
                <input type="text" name="responsable" value={formData.responsable} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Commentaires</label>
              <textarea name="commentaires" value={formData.commentaires} onChange={handleChange} rows="3"></textarea>
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
