import { useState } from 'react'
import './SuiviAmbassadeurs.css'

export default function SuiviAmbassadeurs({ ambassadeurs, onAdd, onUpdate, onDelete }) {
  const [showModal, setShowModal] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [formData, setFormData] = useState({
    ambassadeur: '',
    canal: 'Étudiant',
    filleulsRecrutés: 0,
    utilisateursActifs: 0,
    récompenseTotal: 0,
    commentaires: ''
  })

  const handleOpen = (index = null) => {
    if (index !== null) {
      setFormData(ambassadeurs[index])
      setEditIndex(index)
    } else {
      setFormData({
        ambassadeur: '',
        canal: 'Étudiant',
        filleulsRecrutés: 0,
        utilisateursActifs: 0,
        récompenseTotal: 0,
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
      [name]: name !== 'commentaires' && name !== 'ambassadeur' && name !== 'canal' ? parseInt(value) || 0 : value
    })
  }

  const calcTauxConversion = (filleuls, actifs) => {
    return filleuls > 0 ? (((actifs / filleuls) * 100).toFixed(2)) : 0
  }

  const calcCoutAcquisition = (récompense, actifs) => {
    return actifs > 0 ? (récompense / actifs).toFixed(0) : 0
  }

  const totalFilleuls = ambassadeurs.reduce((sum, a) => sum + (a.filleulsRecrutés || 0), 0)
  const totalActifs = ambassadeurs.reduce((sum, a) => sum + (a.utilisateursActifs || 0), 0)
  const totalRécompense = ambassadeurs.reduce((sum, a) => sum + (a.récompenseTotal || 0), 0)

  return (
    <div className="suivi-ambassadeurs">
      <div className="header-section">
        <h1>👥 Suivi Ambassadeurs</h1>
        <button className="btn-primary" onClick={() => handleOpen()}>
          + Ajouter Ambassadeur
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Filleuls Recrutés</h3>
          <p className="value">{totalFilleuls.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Utilisateurs Actifs</h3>
          <p className="value">{totalActifs.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Taux Conversion Global</h3>
          <p className="value">{calcTauxConversion(totalFilleuls, totalActifs)}%</p>
        </div>
        <div className="stat-card">
          <h3>Récompense Totale</h3>
          <p className="value">{totalRécompense.toLocaleString()} F</p>
        </div>
        <div className="stat-card">
          <h3>Coût Acquisition Moyen</h3>
          <p className="value">{calcCoutAcquisition(totalRécompense, totalActifs)} F</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Ambassadeur</th>
              <th>Canal</th>
              <th>Filleuls</th>
              <th>Utilisateurs Actifs</th>
              <th>Taux Conversion</th>
              <th>Récompense (F)</th>
              <th>Coût/Acq (F)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ambassadeurs.map((amb, idx) => (
              <tr key={idx}>
                <td><strong>{amb.ambassadeur}</strong></td>
                <td><span className="badge">{amb.canal}</span></td>
                <td>{amb.filleulsRecrutés || 0}</td>
                <td>{amb.utilisateursActifs || 0}</td>
                <td>{calcTauxConversion(amb.filleulsRecrutés, amb.utilisateursActifs)}%</td>
                <td>{(amb.récompenseTotal || 0).toLocaleString()}</td>
                <td>{calcCoutAcquisition(amb.récompenseTotal, amb.utilisateursActifs)}</td>
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
              {editIndex !== null ? 'Éditer Ambassadeur' : 'Ajouter Ambassadeur'}
            </div>

            <div className="form-group">
              <label>Nom Ambassadeur</label>
              <input 
                type="text" 
                name="ambassadeur" 
                value={formData.ambassadeur} 
                onChange={handleChange}
                placeholder="Ex: Jean Dupont" 
              />
            </div>

            <div className="form-group">
              <label>Type de Canal</label>
              <select name="canal" value={formData.canal} onChange={handleChange}>
                <option>Étudiant</option>
                <option>Micro-influenceur</option>
                <option>Leader communautaire</option>
                <option>Partenaire</option>
                <option>Autre</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Filleuls Recrutés</label>
                <input 
                  type="number" 
                  name="filleulsRecrutés" 
                  value={formData.filleulsRecrutés} 
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Utilisateurs Actifs</label>
                <input 
                  type="number" 
                  name="utilisateursActifs" 
                  value={formData.utilisateursActifs} 
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Récompense Totale (F)</label>
              <input 
                type="number" 
                name="récompenseTotal" 
                value={formData.récompenseTotal} 
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Commentaires</label>
              <textarea 
                name="commentaires" 
                value={formData.commentaires} 
                onChange={handleChange}
                rows="3"
              ></textarea>
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
