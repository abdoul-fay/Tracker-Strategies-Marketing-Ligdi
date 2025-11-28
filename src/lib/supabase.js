import { createClient } from '@supabase/supabase-js'

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
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async addCampaign(campaign) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()
    if (error) throw error
    return data[0]
  },

  async updateCampaign(id, campaign) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(campaign)
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
    const { data, error } = await supabase
      .from('kpi_financiers')
      .update(kpi)
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
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async addStrategy(strategy) {
    const { data, error } = await supabase
      .from('strategies')
      .insert([strategy])
      .select()
    if (error) throw error
    return data[0]
  },

  async updateStrategy(id, strategy) {
    const { data, error } = await supabase
      .from('strategies')
      .update(strategy)
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
    const { data, error } = await supabase
      .from('ambassadeurs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async addAmbassador(ambassador) {
    const { data, error } = await supabase
      .from('ambassadeurs')
      .insert([ambassador])
      .select()
    if (error) throw error
    return data[0]
  },

  async updateAmbassador(id, ambassador) {
    const { data, error } = await supabase
      .from('ambassadeurs')
      .update(ambassador)
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
