import { useState } from 'react'
import './SuiviAmbassadeurs.css'
import { useNotification } from '../contexts/NotificationContext'

export default function SuiviAmbassadeurs({ ambassadeurs, onAdd, onUpdate, onDelete }) {
  const { success, error: showError } = useNotification()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    nom: '',
    ambassadeur: '',
    canal: 'Étudiant',
    filleuls_recrutes: 0,
    utilisateurs_actifs: 0,
    recompense_total: 0,
    commentaires: ''
  })

  const handleOpen = (id = null) => {
    if (id !== null) {
      const amb = ambassadeurs.find(a => a.id === id);
      if (amb) {
        setFormData(amb)
        setEditId(id)
      }
    } else {
      setFormData({
        name: '',
        nom: '',
        ambassadeur: '',
        canal: 'Étudiant',
        filleuls_recrutes: 0,
        utilisateurs_actifs: 0,
        recompense_total: 0,
        commentaires: ''
      })
      setEditId(null)
    }
    setShowModal(true)
  }

  const handleSave = () => {
    if (editId !== null) {
      const index = ambassadeurs.findIndex(a => a.id === editId)
      if (index !== -1) {
        onUpdate(index, formData)
        success('Ambassadeur mis à jour avec succès')
      }
    } else {
      onAdd(formData)
      success('Ambassadeur ajouté avec succès')
    }
    setShowModal(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name !== 'commentaires' && name !== 'ambassadeur' && name !== 'canal' && name !== 'name' && name !== 'nom' ? parseInt(value) || 0 : value,
      // Synchroniser name/nom/ambassadeur (utiliser le même champ)
      ...(name === 'ambassadeur' && { name: value, nom: value }),
      ...(name === 'name' && { ambassadeur: value, nom: value }),
      ...(name === 'nom' && { ambassadeur: value, name: value })
    })
  }

  const calcTauxConversion = (filleuls, actifs) => {
    return filleuls > 0 ? (((actifs / filleuls) * 100).toFixed(2)) : 0
  }

  const calcCoutAcquisition = (récompense, actifs) => {
    return actifs > 0 ? (récompense / actifs).toFixed(0) : 0
  }

  const totalFilleuls = ambassadeurs.reduce((sum, a) => sum + (a.filleuls_recrutes || 0), 0)
  const totalActifs = ambassadeurs.reduce((sum, a) => sum + (a.utilisateurs_actifs || 0), 0)
  const totalRécompense = ambassadeurs.reduce((sum, a) => sum + (a.recompense_total || 0), 0)

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
                <td>{amb.filleuls_recrutes || 0}</td>
                <td>{amb.utilisateurs_actifs || 0}</td>
                <td>{calcTauxConversion(amb.filleuls_recrutes, amb.utilisateurs_actifs)}%</td>
                <td>{(amb.recompense_total || 0).toLocaleString()}</td>
                <td>{calcCoutAcquisition(amb.recompense_total, amb.utilisateurs_actifs)}</td>
                <td>
                  <button className="btn-secondary" onClick={() => handleOpen(amb.id)}>✏️</button>
                  <button className="btn-danger" onClick={() => {
                    const index = ambassadeurs.findIndex(a => a.id === amb.id);
                    if (index !== -1) {
                      onDelete(index);
                      success('Ambassadeur supprimé avec succès');
                    }
                  }}>🗑️</button>
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
              {editId !== null ? 'Éditer Ambassadeur' : 'Ajouter Ambassadeur'}
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
                  name="filleuls_recrutes" 
                  value={formData.filleuls_recrutes} 
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Utilisateurs Actifs</label>
                <input 
                  type="number" 
                  name="utilisateurs_actifs" 
                  value={formData.utilisateurs_actifs} 
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Récompense Totale (F)</label>
              <input 
                type="number" 
                name="recompense_total" 
                value={formData.recompense_total} 
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
