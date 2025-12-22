import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { useNotification } from '../contexts/NotificationContext'
import './KPISettings.css'

export default function KPISettings() {
  const { success, error: showError } = useNotification()
  const [settings, setSettings] = useState({
    roiTarget: 200,
    reachTarget: 10000,
    budgetMaxPerCampaign: 100000,
    budgetMaxGlobal: 500000,
    engagementTarget: 5,
    costPerResultMax: 50
  })

  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  // Charger les paramètres depuis Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const dbSettings = await db.getKPISettings()
        if (dbSettings) {
          setSettings({
            roiTarget: dbSettings.roi_target || 200,
            reachTarget: dbSettings.reach_target || 10000,
            budgetMaxPerCampaign: dbSettings.budget_max_per_campaign || 100000,
            budgetMaxGlobal: dbSettings.budget_max_global || 500000,
            engagementTarget: dbSettings.engagement_target || 5,
            costPerResultMax: dbSettings.cost_per_result_max || 50
          })
          console.log('✅ Paramètres KPI chargés depuis Supabase')
        } else {
          console.log('ℹ️ Aucun paramètre KPI trouvé, utilisation des defaults')
        }
      } catch (err) {
        console.error('❌ Erreur chargement paramètres:', err)
        showError('Erreur: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: Number(value) || 0
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      console.log('💾 Sauvegarde paramètres KPI:', settings)
      await db.setKPISettings(settings)
      
      // Déclencher un événement personnalisé pour que Home recharge les alertes
      window.dispatchEvent(new Event('kpiSettingsChanged'))
      
      success('Paramètres KPI enregistrés avec succès')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('❌ Erreur sauvegarde:', err)
      showError('Erreur: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="kpi-settings">
      <div className="settings-header">
        <h1>⚙️ Paramètres KPI & Alertes</h1>
        <p>Définissez vos objectifs pour adapter les alertes intelligentes</p>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <h2>🎯 Objectifs de Performance</h2>
          
          <div className="setting-group">
            <label>ROI Cible (%)</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={settings.roiTarget}
                onChange={(e) => handleChange('roiTarget', e.target.value)}
                placeholder="ex: 200"
              />
              <span className="hint">Rendement sur investissement visé</span>
            </div>
          </div>

          <div className="setting-group">
            <label>Reach Cible (nombre de personnes)</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={settings.reachTarget}
                onChange={(e) => handleChange('reachTarget', e.target.value)}
                placeholder="ex: 10000"
              />
              <span className="hint">Portée/audience visée par campagne</span>
            </div>
          </div>

          <div className="setting-group">
            <label>Engagement Cible (%)</label>
            <div className="input-wrapper">
              <input
                type="number"
                step="0.1"
                value={settings.engagementTarget}
                onChange={(e) => handleChange('engagementTarget', e.target.value)}
                placeholder="ex: 5"
              />
              <span className="hint">Taux d'engagement visé</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>💰 Limites Budgétaires</h2>
          
          <div className="setting-group">
            <label>Budget Max par Campagne (FCFA)</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={settings.budgetMaxPerCampaign}
                onChange={(e) => handleChange('budgetMaxPerCampaign', e.target.value)}
                placeholder="ex: 100000"
              />
              <span className="hint">Seuil d'alerte si dépassé</span>
            </div>
          </div>

          <div className="setting-group">
            <label>Budget Max Global (FCFA)</label>
            <div className="input-wrapper">
              <input
                type="number"
                value={settings.budgetMaxGlobal}
                onChange={(e) => handleChange('budgetMaxGlobal', e.target.value)}
                placeholder="ex: 500000"
              />
              <span className="hint">Limite totale pour toutes les campagnes</span>
            </div>
          </div>

          <div className="setting-group">
            <label>Coût Max par Résultat (FCFA)</label>
            <div className="input-wrapper">
              <input
                type="number"
                step="0.1"
                value={settings.costPerResultMax}
                onChange={(e) => handleChange('costPerResultMax', e.target.value)}
                placeholder="ex: 50"
              />
              <span className="hint">Efficacité minimale requise</span>
            </div>
          </div>
        </div>

        <div className="settings-info">
          <div className="info-card">
            <h3>📊 Comment ça fonctionne ?</h3>
            <ul>
              <li><strong>Alertes adaptatives</strong> : Les seuils s'ajustent selon vos performances</li>
              <li><strong>ROI Cible</strong> : Si une campagne atteint 80% de cet objectif → ✅ Succès</li>
              <li><strong>Reach Cible</strong> : Influence la portée minimale acceptable</li>
              <li><strong>Coût par résultat</strong> : Mesure l'efficacité (budget / reach)</li>
              <li><strong>Budget Global</strong> : Limite la dépense totale</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>💡 Conseils</h3>
            <ul>
              <li>Commencez par vos performances actuelles</li>
              <li>Ajustez progressivement les objectifs</li>
              <li>Le système analyse l'historique et s'adapte</li>
              <li>Les alertes "rouges" ne signifient pas d'erreur, juste des écarts</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        {saved && <div className="success-message">✅ Paramètres sauvegardés !</div>}
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="save-button"
        >
          {loading ? '⏳ Sauvegarde...' : '💾 Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  )
}
