import { createClient } from '@supabase/supabase-js'
import { getTenantId } from './multiTenant'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations
export const db = {
  // Campaigns
  async getCampaigns() {
    const tenantId = getTenantId()
    if (!tenantId) {
      console.warn('⚠️ No tenant_id found. User may not be authenticated.')
      return []
    }
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async addCampaign(campaign) {
    const tenantId = getTenantId()
    if (!tenantId) throw new Error('No tenant_id. User not authenticated.')
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{ ...campaign, tenant_id: tenantId }])
      .select()
    if (error) throw error
    return data[0]
  },

  async updateCampaign(id, campaign) {
    const { id: _, ...dataWithoutId } = campaign
    const { data, error } = await supabase
      .from('campaigns')
      .update(dataWithoutId)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async deleteCampaign(id) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) throw error
  },

  // KPI Financiers
  async getKPIs() {
    const { data, error } = await supabase
      .from('kpi_financiers')
      .select('*')
      .order('mois', { ascending: false })
    if (error) throw error
    return data || []
  },

  async addKPI(kpi) {
    const { data, error } = await supabase
      .from('kpi_financiers')
      .insert([kpi])
      .select()
    if (error) throw error
    return data[0]
  },

  async updateKPI(id, kpi) {
    const { id: _, ...dataWithoutId } = kpi
    const { data, error } = await supabase
      .from('kpi_financiers')
      .update(dataWithoutId)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async deleteKPI(id) {
    const { error } = await supabase.from('kpi_financiers').delete().eq('id', id)
    if (error) throw error
  },

  // Strategies
  async getStrategies() {
    const tenantId = getTenantId()
    if (!tenantId) {
      console.warn('⚠️ No tenant_id found. User may not be authenticated.')
      return []
    }
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async addStrategy(strategy) {
    const tenantId = getTenantId()
    if (!tenantId) throw new Error('No tenant_id. User not authenticated.')
    const { data, error } = await supabase
      .from('strategies')
      .insert([{ ...strategy, tenant_id: tenantId }])
      .select()
    if (error) throw error
    return data[0]
  },

  async updateStrategy(id, strategy) {
    const { id: _, ...dataWithoutId } = strategy
    const { data, error } = await supabase
      .from('strategies')
      .update(dataWithoutId)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async deleteStrategy(id) {
    const { error } = await supabase.from('strategies').delete().eq('id', id)
    if (error) throw error
  },

  // Ambassadeurs (français)
  async getAmbassadors() {
    const tenantId = getTenantId()
    if (!tenantId) {
      console.warn('⚠️ No tenant_id found. User may not be authenticated.')
      return []
    }
    const { data, error } = await supabase
      .from('ambassadeurs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async addAmbassador(ambassador) {
    const tenantId = getTenantId()
    if (!tenantId) throw new Error('No tenant_id. User not authenticated.')
    const { data, error } = await supabase
      .from('ambassadeurs')
      .insert([{ ...ambassador, tenant_id: tenantId }])
      .select()
    if (error) throw error
    return data[0]
  },

  async updateAmbassador(id, ambassador) {
    const { id: _, ...dataWithoutId } = ambassador
    const { data, error } = await supabase
      .from('ambassadeurs')
      .update(dataWithoutId)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async deleteAmbassador(id) {
    const { error } = await supabase.from('ambassadeurs').delete().eq('id', id)
    if (error) throw error
  },

  // Budget Recommendations
  async getRecommendations() {
    const { data, error } = await supabase
      .from('budget_recommendations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async addRecommendation(recommendation) {
    const { data, error } = await supabase
      .from('budget_recommendations')
      .insert([recommendation])
      .select()
    if (error) throw error
    return data[0]
  },
}
