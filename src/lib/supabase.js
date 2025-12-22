import { createClient } from '@supabase/supabase-js'
import { getTenantId } from './multiTenant'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to verify tenant_id before operations
const verifyTenant = (operation) => {
  const tenantId = getTenantId()
  if (!tenantId) {
    console.error(`❌ ${operation}: Aucun tenant_id trouvé. L'utilisateur n'est pas authentifié.`)
    throw new Error('Authentification requise. Veuillez vous reconnecter.')
  }
  return tenantId
}

// Helper function to validate and convert numeric fields
const sanitizeCampaign = (campaign) => {
  const sanitized = { ...campaign }
  
  // Convert budget and budget_reel to proper decimal numbers
  if (sanitized.budget !== null && sanitized.budget !== undefined && sanitized.budget !== '') {
    const budgetNum = parseFloat(sanitized.budget)
    sanitized.budget = isNaN(budgetNum) ? 0 : Math.min(budgetNum, 9999999999.99)
  } else {
    sanitized.budget = 0
  }
  
  if (sanitized.budget_reel !== null && sanitized.budget_reel !== undefined && sanitized.budget_reel !== '') {
    const budgetReelNum = parseFloat(sanitized.budget_reel)
    sanitized.budget_reel = isNaN(budgetReelNum) ? 0 : Math.min(budgetReelNum, 9999999999.99)
  } else {
    sanitized.budget_reel = 0
  }
  
  // Convert ROI
  if (sanitized.roi !== null && sanitized.roi !== undefined && sanitized.roi !== '') {
    const roiNum = parseFloat(sanitized.roi)
    sanitized.roi = isNaN(roiNum) ? 0 : Math.min(roiNum, 9999999999.99)
  } else {
    sanitized.roi = 0
  }
  
  console.log('✅ Données campagne validées:', sanitized)
  return sanitized
}

// Helper functions for database operations
export const db = {
  // Campaigns
  async getCampaigns() {
    try {
      const tenantId = getTenantId()
      if (!tenantId) {
        console.warn('⚠️ getCampaigns: Aucun tenant_id trouvé. Utilisateur peut ne pas être authentifié.')
        return []
      }
      console.log('📊 Chargement des campagnes pour tenant:', tenantId)
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('❌ Erreur getCampaigns:', error)
        throw error
      }
      console.log(`✅ ${data?.length || 0} campagne(s) chargée(s)`)
      return data || []
    } catch (err) {
      console.error('❌ Erreur dans getCampaigns:', err)
      throw err
    }
  },

  async addCampaign(campaign) {
    try {
      const tenantId = verifyTenant('addCampaign')
      const sanitized = sanitizeCampaign(campaign)
      console.log('💾 Ajout campagne pour tenant:', tenantId, sanitized.name)
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{ ...sanitized, tenant_id: tenantId }])
        .select()
      if (error) {
        console.error('❌ Erreur addCampaign:', error)
        throw error
      }
      console.log('✅ Campagne ajoutée avec ID:', data[0]?.id)
      return data[0]
    } catch (err) {
      console.error('❌ Erreur dans addCampaign:', err)
      throw err
    }
  },

  async updateCampaign(id, campaign) {
    try {
      const tenantId = verifyTenant('updateCampaign')
      const sanitized = sanitizeCampaign(campaign)
      console.log('✏️ Mise à jour campagne:', id, 'pour tenant:', tenantId)
      const { id: _, ...dataWithoutId } = sanitized
      const { data, error } = await supabase
        .from('campaigns')
        .update(dataWithoutId)
        .eq('id', id)
        .eq('tenant_id', tenantId)  // Ajouter filtre tenant pour sécurité
        .select()
      if (error) {
        console.error('❌ Erreur updateCampaign:', error)
        throw error
      }
      console.log('✅ Campagne mise à jour')
      return data[0]
    } catch (err) {
      console.error('❌ Erreur dans updateCampaign:', err)
      throw err
    }
  },

  async deleteCampaign(id) {
    try {
      const tenantId = verifyTenant('deleteCampaign')
      console.log('🗑️ Suppression campagne:', id, 'pour tenant:', tenantId)
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId)  // Ajouter filtre tenant pour sécurité
      if (error) {
        console.error('❌ Erreur deleteCampaign:', error)
        throw error
      }
      console.log('✅ Campagne supprimée')
    } catch (err) {
      console.error('❌ Erreur dans deleteCampaign:', err)
      throw err
    }
  },

  // KPI Financiers
  async getKPIs() {
    try {
      const tenantId = getTenantId()
      if (!tenantId) {
        console.warn('⚠️ getKPIs: Aucun tenant_id trouvé.')
        return []
      }
      console.log('📈 Chargement des KPIs pour tenant:', tenantId)
      const { data, error } = await supabase
        .from('kpi_financiers')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('mois', { ascending: false })
      if (error) {
        console.error('❌ Erreur getKPIs:', error)
        throw error
      }
      console.log(`✅ ${data?.length || 0} KPI(s) chargé(s)`)
      return data || []
    } catch (err) {
      console.error('❌ Erreur dans getKPIs:', err)
      throw err
    }
  },

  async addKPI(kpi) {
    try {
      const tenantId = verifyTenant('addKPI')
      console.log('💾 Ajout KPI pour tenant:', tenantId)
      const { data, error } = await supabase
        .from('kpi_financiers')
        .insert([{ ...kpi, tenant_id: tenantId }])
        .select()
      if (error) {
        console.error('❌ Erreur addKPI:', error)
        throw error
      }
      console.log('✅ KPI ajouté avec ID:', data[0]?.id)
      return data[0]
    } catch (err) {
      console.error('❌ Erreur dans addKPI:', err)
      throw err
    }
  },

  async updateKPI(id, kpi) {
    try {
      const tenantId = verifyTenant('updateKPI')
      console.log('✏️ Mise à jour KPI:', id, 'pour tenant:', tenantId)
      const { id: _, ...dataWithoutId } = kpi
      const { data, error } = await supabase
        .from('kpi_financiers')
        .update(dataWithoutId)
        .eq('id', id)
        .eq('tenant_id', tenantId)  // Ajouter filtre tenant
        .select()
      if (error) {
        console.error('❌ Erreur updateKPI:', error)
        throw error
      }
      console.log('✅ KPI mise à jour')
      return data[0]
    } catch (err) {
      console.error('❌ Erreur dans updateKPI:', err)
      throw err
    }
  },

  async deleteKPI(id) {
    try {
      const tenantId = verifyTenant('deleteKPI')
      console.log('🗑️ Suppression KPI:', id, 'pour tenant:', tenantId)
      const { error } = await supabase
        .from('kpi_financiers')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId)  // Ajouter filtre tenant
      if (error) {
        console.error('❌ Erreur deleteKPI:', error)
        throw error
      }
      console.log('✅ KPI supprimé')
    } catch (err) {
      console.error('❌ Erreur dans deleteKPI:', err)
      throw err
    }
  },

  // Strategies
  async getStrategies() {
    try {
      const tenantId = getTenantId()
      if (!tenantId) {
        console.warn('⚠️ getStrategies: Aucun tenant_id trouvé.')
        return []
      }
      console.log('🎯 Chargement des stratégies pour tenant:', tenantId)
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('❌ Erreur getStrategies:', error)
        throw error
      }
      console.log(`✅ ${data?.length || 0} stratégie(s) chargée(s)`)
      return data || []
    } catch (err) {
      console.error('❌ Erreur dans getStrategies:', err)
      throw err
    }
  },

  async addStrategy(strategy) {
    try {
      const tenantId = verifyTenant('addStrategy')
      console.log('💾 Ajout stratégie pour tenant:', tenantId, strategy.titre)
      const { data, error } = await supabase
        .from('strategies')
        .insert([{ ...strategy, tenant_id: tenantId }])
        .select()
      if (error) {
        console.error('❌ Erreur addStrategy:', error)
        throw error
      }
      console.log('✅ Stratégie ajoutée avec ID:', data[0]?.id)
      return data[0]
    } catch (err) {
      console.error('❌ Erreur dans addStrategy:', err)
      throw err
    }
  },

  async updateStrategy(id, strategy) {
    try {
      const tenantId = verifyTenant('updateStrategy')
      console.log('✏️ Mise à jour stratégie:', id, 'pour tenant:', tenantId)
      const { id: _, ...dataWithoutId } = strategy
      const { data, error } = await supabase
        .from('strategies')
        .update(dataWithoutId)
        .eq('id', id)
        .eq('tenant_id', tenantId)  // Ajouter filtre tenant
        .select()
      if (error) {
        console.error('❌ Erreur updateStrategy:', error)
        throw error
      }
      console.log('✅ Stratégie mise à jour')
      return data[0]
    } catch (err) {
      console.error('❌ Erreur dans updateStrategy:', err)
      throw err
    }
  },

  async deleteStrategy(id) {
    try {
      const tenantId = verifyTenant('deleteStrategy')
      console.log('🗑️ Suppression stratégie:', id, 'pour tenant:', tenantId)
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId)  // Ajouter filtre tenant
      if (error) {
        console.error('❌ Erreur deleteStrategy:', error)
        throw error
      }
      console.log('✅ Stratégie supprimée')
    } catch (err) {
      console.error('❌ Erreur dans deleteStrategy:', err)
      throw err
    }
  },

  // Ambassadeurs (français)
  async getAmbassadors() {
    try {
      const tenantId = getTenantId()
      if (!tenantId) {
        console.warn('⚠️ getAmbassadors: Aucun tenant_id trouvé.')
        return []
      }
      console.log('👥 Chargement des ambassadeurs pour tenant:', tenantId)
      const { data, error } = await supabase
        .from('ambassadeurs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('❌ Erreur getAmbassadors:', error)
        throw error
      }
      console.log(`✅ ${data?.length || 0} ambassadeur(s) chargé(s)`)
      return data || []
    } catch (err) {
      console.error('❌ Erreur dans getAmbassadors:', err)
      throw err
    }
  },

  async addAmbassador(ambassador) {
    try {
      const tenantId = verifyTenant('addAmbassador')
      console.log('💾 Ajout ambassadeur pour tenant:', tenantId, ambassador.nom)
      const { data, error } = await supabase
        .from('ambassadeurs')
        .insert([{ ...ambassador, tenant_id: tenantId }])
        .select()
      if (error) {
        console.error('❌ Erreur addAmbassador:', error)
        throw error
      }
      console.log('✅ Ambassadeur ajouté avec ID:', data[0]?.id)
      return data[0]
    } catch (err) {
      console.error('❌ Erreur dans addAmbassador:', err)
      throw err
    }
  },

  async updateAmbassador(id, ambassador) {
    try {
      const tenantId = verifyTenant('updateAmbassador')
      console.log('✏️ Mise à jour ambassadeur:', id, 'pour tenant:', tenantId)
      const { id: _, ...dataWithoutId } = ambassador
      const { data, error } = await supabase
        .from('ambassadeurs')
        .update(dataWithoutId)
        .eq('id', id)
        .eq('tenant_id', tenantId)  // Ajouter filtre tenant
        .select()
      if (error) {
        console.error('❌ Erreur updateAmbassador:', error)
        throw error
      }
      console.log('✅ Ambassadeur mise à jour')
      return data[0]
    } catch (err) {
      console.error('❌ Erreur dans updateAmbassador:', err)
      throw err
    }
  },

  async deleteAmbassador(id) {
    try {
      const tenantId = verifyTenant('deleteAmbassador')
      console.log('🗑️ Suppression ambassadeur:', id, 'pour tenant:', tenantId)
      const { error } = await supabase
        .from('ambassadeurs')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId)  // Ajouter filtre tenant
      if (error) {
        console.error('❌ Erreur deleteAmbassador:', error)
        throw error
      }
      console.log('✅ Ambassadeur supprimé')
    } catch (err) {
      console.error('❌ Erreur dans deleteAmbassador:', err)
      throw err
    }
  },

  // Budget Recommendations
  async getRecommendations() {
    try {
      const tenantId = getTenantId()
      if (!tenantId) {
        console.warn('⚠️ getRecommendations: Aucun tenant_id trouvé.')
        return []
      }
      console.log('💡 Chargement des recommandations pour tenant:', tenantId)
      const { data, error } = await supabase
        .from('budget_recommendations')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('❌ Erreur getRecommendations:', error)
        throw error
      }
      console.log(`✅ ${data?.length || 0} recommandation(s) chargée(s)`)
      return data || []
    } catch (err) {
      console.error('❌ Erreur dans getRecommendations:', err)
      throw err
    }
  },

  async addRecommendation(recommendation) {
    try {
      const tenantId = verifyTenant('addRecommendation')
      console.log('💾 Ajout recommandation pour tenant:', tenantId)
      const { data, error } = await supabase
        .from('budget_recommendations')
        .insert([{ ...recommendation, tenant_id: tenantId }])
        .select()
      if (error) {
        console.error('❌ Erreur addRecommendation:', error)
        throw error
      }
      console.log('✅ Recommandation ajoutée avec ID:', data[0]?.id)
      return data[0]
    } catch (err) {
      console.error('❌ Erreur dans addRecommendation:', err)
      throw err
    }
  },

  // KPI Settings
  async getKPISettings() {
    try {
      const tenantId = getTenantId()
      if (!tenantId) {
        console.warn('⚠️ getKPISettings: Aucun tenant_id trouvé.')
        return null
      }
      console.log('⚙️ Chargement des paramètres KPI pour tenant:', tenantId)
      const { data, error } = await supabase
        .from('kpi_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single()
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Erreur getKPISettings:', error)
        throw error
      }
      console.log('✅ Paramètres KPI chargés:', data)
      return data || null
    } catch (err) {
      console.error('❌ Erreur dans getKPISettings:', err)
      throw err
    }
  },

  async setKPISettings(settings) {
    try {
      const tenantId = verifyTenant('setKPISettings')
      console.log('💾 Sauvegarde paramètres KPI pour tenant:', tenantId)
      
      // Vérifier si les paramètres existent déjà
      const existing = await this.getKPISettings()
      
      let result
      if (existing) {
        // Mise à jour
        const { data, error } = await supabase
          .from('kpi_settings')
          .update({
            roi_target: settings.roiTarget,
            reach_target: settings.reachTarget,
            budget_max_per_campaign: settings.budgetMaxPerCampaign,
            budget_max_global: settings.budgetMaxGlobal,
            engagement_target: settings.engagementTarget,
            cost_per_result_max: settings.costPerResultMax,
            updated_at: new Date().toISOString()
          })
          .eq('tenant_id', tenantId)
          .select()
        
        if (error) {
          console.error('❌ Erreur setKPISettings (update):', error)
          throw error
        }
        result = data[0]
      } else {
        // Création
        const { data, error } = await supabase
          .from('kpi_settings')
          .insert([{
            tenant_id: tenantId,
            roi_target: settings.roiTarget,
            reach_target: settings.reachTarget,
            budget_max_per_campaign: settings.budgetMaxPerCampaign,
            budget_max_global: settings.budgetMaxGlobal,
            engagement_target: settings.engagementTarget,
            cost_per_result_max: settings.costPerResultMax
          }])
          .select()
        
        if (error) {
          console.error('❌ Erreur setKPISettings (insert):', error)
          throw error
        }
        result = data[0]
      }
      
      console.log('✅ Paramètres KPI sauvegardés')
      return result
    } catch (err) {
      console.error('❌ Erreur dans setKPISettings:', err)
      throw err
    }
  },
}
