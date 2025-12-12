import { useState, useEffect, useMemo } from 'react'
import './AmbassadeursCampagnes.css'

const formatNumber = (num) => {
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'G';
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

export default function AmbassadeursCampagnes({ campagnes = [] }) {
  const [ambassadors, setAmbassadors] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedAmbassador, setSelectedAmbassador] = useState(null)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  // Load ambassadors from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ambassadeurs')
      if (saved) {
        setAmbassadors(JSON.parse(saved))
      }
      const savedAssignments = localStorage.getItem('ambassadorAssignments')
      if (savedAssignments) {
        setAssignments(JSON.parse(savedAssignments))
      }
    } catch (err) {
      console.error('Error loading ambassadors:', err)
    }
  }, [])

  // Save assignments to localStorage
  const saveAssignments = (newAssignments) => {
    setAssignments(newAssignments)
    localStorage.setItem('ambassadorAssignments', JSON.stringify(newAssignments))
  }

  // Add assignment
  const handleAssign = () => {
    if (!selectedAmbassador || !selectedCampaign) {
      alert('Veuillez sélectionner un ambassadeur et une campagne')
      return
    }

    const assignment = {
      id: Date.now(),
      ambassadorId: selectedAmbassador.id,
      ambassadorName: selectedAmbassador.nom,
      campaignId: selectedCampaign.id,
      campaignName: selectedCampaign.nom,
      dateAssigned: new Date().toISOString().split('T')[0],
      status: 'Actif'
    }

    saveAssignments([...assignments, assignment])
    setSelectedAmbassador(null)
    setSelectedCampaign(null)
  }

  // Remove assignment
  const handleUnassign = (assignmentId) => {
    saveAssignments(assignments.filter(a => a.id !== assignmentId))
  }

  // Get ambassadors for a campaign
  const campaignAmbassadors = useMemo(() => {
    return assignments
      .filter(a => a.campaignId === selectedCampaign?.id)
      .map(a => ambassadors.find(amb => amb.id === a.ambassadorId))
      .filter(Boolean)
  }, [assignments, selectedCampaign, ambassadors])

  // Calculate ambassador impact
  const ambassadorStats = useMemo(() => {
    const stats = {}
    ambassadors.forEach(amb => {
      const ambAssignments = assignments.filter(a => a.ambassadorId === amb.id)
      const campaigns = ambAssignments.map(a => campagnes.find(c => c.id === a.campaignId)).filter(Boolean)
      
      const totalReach = campaigns.reduce((sum, c) => sum + (c.reach || 0), 0)
      const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
      const avgROI = campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.roi || 0), 0) / campaigns.length : 0

      stats[amb.id] = {
        campaigns: campaigns.length,
        totalReach,
        totalBudget,
        avgROI: avgROI.toFixed(1),
        ambassador: amb
      }
    })
    return stats
  }, [ambassadors, assignments, campagnes])

  return (
    <div className="ambassadors-campaigns">
      <div className="ac-header">
        <h1>👥 Ambassadeurs & Campagnes</h1>
        <p>Liez vos ambassadeurs à vos campagnes et mesurez leur impact</p>
      </div>

      {/* Assignment Panel */}
      <div className="ac-section assignment-panel">
        <h2>➕ Assigner un Ambassadeur à une Campagne</h2>
        <div className="ac-assignment-form">
          <div className="form-group">
            <label>Ambassadeur:</label>
            <select 
              value={selectedAmbassador?.id || ''} 
              onChange={(e) => {
                const amb = ambassadors.find(a => a.id === parseInt(e.target.value))
                setSelectedAmbassador(amb)
              }}
            >
              <option value="">Sélectionner un ambassadeur</option>
              {ambassadors.map(amb => (
                <option key={amb.id} value={amb.id}>{amb.nom}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Campagne:</label>
            <select 
              value={selectedCampaign?.id || ''} 
              onChange={(e) => {
                const camp = campagnes.find(c => c.id === parseInt(e.target.value))
                setSelectedCampaign(camp)
              }}
            >
              <option value="">Sélectionner une campagne</option>
              {campagnes.map(camp => (
                <option key={camp.id} value={camp.id}>{camp.nom}</option>
              ))}
            </select>
          </div>

          <button className="ac-btn-assign" onClick={handleAssign}>
            ✅ Assigner
          </button>
        </div>
      </div>

      {/* Ambassador Stats */}
      <div className="ac-section stats-section">
        <h2>📊 Impact par Ambassadeur</h2>
        <div className="ac-stats-grid">
          {ambassadors.map(amb => {
            const stat = ambassadorStats[amb.id] || { campaigns: 0, totalReach: 0, totalBudget: 0, avgROI: 0 }
            return (
              <div key={amb.id} className="ac-stat-card">
                <div className="ac-stat-header">
                  <h3>{amb.nom}</h3>
                  <span className="ac-badge">{stat.campaigns} campagnes</span>
                </div>
                <div className="ac-stat-row">
                  <span>Reach:</span>
                  <strong>{formatNumber(stat.totalReach)}</strong>
                </div>
                <div className="ac-stat-row">
                  <span>Budget:</span>
                  <strong>{formatNumber(stat.totalBudget)} FCFA</strong>
                </div>
                <div className="ac-stat-row">
                  <span>ROI Moyen:</span>
                  <strong>{stat.avgROI}%</strong>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Assignments List */}
      <div className="ac-section assignments-section">
        <h2>📋 Toutes les Assignations</h2>
        {assignments.length === 0 ? (
          <p className="ac-empty">Aucune assignation - Commencez par en ajouter une !</p>
        ) : (
          <div className="ac-assignments-table">
            <table>
              <thead>
                <tr>
                  <th>Ambassadeur</th>
                  <th>Campagne</th>
                  <th>Date Assignation</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assign => {
                  const campaign = campagnes.find(c => c.id === assign.campaignId)
                  return (
                    <tr key={assign.id}>
                      <td>{assign.ambassadorName}</td>
                      <td>{assign.campaignName}</td>
                      <td>{new Date(assign.dateAssigned).toLocaleDateString('fr-FR')}</td>
                      <td><span className={`status-badge ${assign.status.toLowerCase()}`}>{assign.status}</span></td>
                      <td>
                        <button 
                          className="ac-btn-remove"
                          onClick={() => handleUnassign(assign.id)}
                        >
                          ✕ Retirer
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Details */}
      {selectedCampaign && (
        <div className="ac-section campaign-detail">
          <h2>🎯 Détail Campagne: {selectedCampaign.nom}</h2>
          <div className="ac-detail-grid">
            <div className="ac-detail-card">
              <h4>Budget</h4>
              <p>{formatNumber(selectedCampaign.budget || 0)} FCFA</p>
            </div>
            <div className="ac-detail-card">
              <h4>Reach</h4>
              <p>{formatNumber(selectedCampaign.reach || 0)}</p>
            </div>
            <div className="ac-detail-card">
              <h4>ROI</h4>
              <p>{(selectedCampaign.roi || 0).toFixed(1)}%</p>
            </div>
            <div className="ac-detail-card">
              <h4>Canal</h4>
              <p>{selectedCampaign.canal || 'N/A'}</p>
            </div>
          </div>
          <div className="ac-ambassadors-list">
            <h3>👥 Ambassadeurs Assignés</h3>
            {campaignAmbassadors.length === 0 ? (
              <p>Aucun ambassadeur assigné à cette campagne</p>
            ) : (
              <ul>
                {campaignAmbassadors.map(amb => (
                  <li key={amb.id}>
                    <strong>{amb.nom}</strong> - {amb.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
