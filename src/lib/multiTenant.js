// src/lib/multiTenant.js
// Gestion multi-tenant - Isolation des données par client

/**
 * Architecture Multi-Tenant
 * Chaque client (structure) a:
 * - Son propre ID unique (tenant_id)
 * - Ses propres données isolées
 * - Accès seulement à ses données
 */

// 1. SYSTÈME D'AUTHENTIFICATION & TENANT ID
// ==========================================

export const getTenantId = () => {
  // Récupérer l'ID tenant depuis localStorage (après login)
  return localStorage.getItem('tenant_id')
}

export const setTenantId = (tenantId) => {
  localStorage.setItem('tenant_id', tenantId)
}

export const getCurrentUser = () => {
  // Récupérer l'utilisateur connecté depuis localStorage
  const user = localStorage.getItem('current_user')
  return user ? JSON.parse(user) : null
}

export const setCurrentUser = (user) => {
  localStorage.setItem('current_user', JSON.stringify(user))
}

// 2. REQUÊTES FILTRÉES PAR TENANT
// ================================

export const buildTenantQuery = (baseQuery) => {
  const tenantId = getTenantId()
  if (!tenantId) {
    throw new Error('No tenant ID found. User must be logged in.')
  }
  // Ajouter un filtre tenant_id à chaque requête
  return baseQuery.eq('tenant_id', tenantId)
}

// 3. STRUCTURE DES TABLES SUPABASE (Schema)
// ==========================================
/*
Chaque table doit avoir une colonne 'tenant_id':

Table: campaigns
  - id (PK)
  - tenant_id (FK) ← CLÉE POUR L'ISOLATION
  - nom
  - canal
  - budget
  - reach
  - roi
  - created_at
  - INDEX sur tenant_id pour performance

Table: ambassadeurs
  - id (PK)
  - tenant_id (FK) ← CLÉE POUR L'ISOLATION
  - nom
  - email
  - created_at
  - INDEX sur tenant_id

Table: strategies
  - id (PK)
  - tenant_id (FK) ← CLÉE POUR L'ISOLATION
  - titre
  - status
  - created_at
  - INDEX sur tenant_id

Table: users (nouvelle)
  - id (PK)
  - email
  - password_hash
  - tenant_id (FK)
  - role (admin, user, viewer)
  - created_at

Table: tenants (nouvelle)
  - id (PK)
  - name
  - company_name
  - plan (starter, pro, enterprise)
  - created_at
  - subdomain (subdomain.app.com)
*/

// 4. ROW LEVEL SECURITY (RLS) - SUPABASE
// ========================================

/*
IMPORTANT: Activer RLS dans Supabase!

-- Pour la table campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their tenant's campaigns"
  ON campaigns
  FOR SELECT
  USING (tenant_id = auth.jwt()->>'tenant_id');

CREATE POLICY "Users can insert campaigns for their tenant"
  ON campaigns
  FOR INSERT
  WITH CHECK (tenant_id = auth.jwt()->>'tenant_id');

-- Même politique pour ambassadeurs, strategies, etc.
*/

// 5. EXEMPLE D'UTILISATION DANS LES PAGES
// =========================================

export const getCampaignsForTenant = async (db) => {
  const tenantId = getTenantId()
  if (!tenantId) throw new Error('Not authenticated')
  
  // Requête sécurisée: seulement les données du tenant
  return await db.getCampaigns()
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
}

export const addCampaignForTenant = async (db, campaignData) => {
  const tenantId = getTenantId()
  if (!tenantId) throw new Error('Not authenticated')
  
  // Ajouter automatiquement le tenant_id
  return await db.addCampaign({
    ...campaignData,
    tenant_id: tenantId
  })
}

// 6. DÉPLOIEMENT MULTI-TENANT
// ============================

/*
Option 1: UN SUPABASE POUR TOUS (Recommandé pour commencer)
- Une seule base Supabase
- RLS isolé les données
- Coût partagé
- Simple à maintenir

Option 2: UN SUPABASE PAR CLIENT (Pour clients importants)
- Chaque client sa base Supabase
- Isolation complète
- Données non mélangées
- Plus cher mais plus sûr

Option 3: DÉPLOIEMENTS SÉPARÉS (SaaS multi-instance)
- Chaque client sa propre instance
- Complètement isolé
- Domaine personnalisé
- Cher mais très sécurisé
*/

// 7. MODÈLE DE PRICING
// ====================

export const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    price: 29, // EUR/mois
    maxUsers: 3,
    maxCampaigns: 50,
    storageGB: 1,
    features: ['Dashboard', 'KPI basiques']
  },
  pro: {
    name: 'Pro',
    price: 99,
    maxUsers: 10,
    maxCampaigns: 500,
    storageGB: 10,
    features: ['Toutes les features', 'Recommandations', 'Predictions', 'Benchmarking']
  },
  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    maxUsers: 'unlimited',
    maxCampaigns: 'unlimited',
    storageGB: 'unlimited',
    features: ['Toutes les features', 'Support dédié', 'SLA garanti', 'SSO']
  }
}

// 8. GESTION DES ACCÈS (RBAC - Role Based Access Control)
// ========================================================

export const ROLES = {
  admin: ['read', 'write', 'delete', 'invite_users'],
  user: ['read', 'write', 'delete'],
  viewer: ['read']
}

export const hasPermission = (userRole, action) => {
  return ROLES[userRole]?.includes(action) || false
}

// 9. AUDIT LOGGING
// ================

export const logAction = async (db, tenantId, userId, action, resource, details) => {
  return await db.addAuditLog({
    tenant_id: tenantId,
    user_id: userId,
    action, // 'create', 'update', 'delete', 'export'
    resource, // 'campaign', 'ambassador', 'strategy'
    resource_id: details.resourceId,
    details,
    timestamp: new Date()
  })
}

// 10. EXEMPLE COMPLET D'INTÉGRATION
// ==================================

/*
// Dans App.jsx

import { getTenantId, getCurrentUser, buildTenantQuery } from './lib/multiTenant'

export default function App() {
  const [tenantId, setTenantId] = useState(getTenantId())
  const [user, setUser] = useState(getCurrentUser())

  // Vérifier l'authentification
  useEffect(() => {
    if (!tenantId || !user) {
      // Rediriger vers la page de login
      window.location.href = '/login'
    }
  }, [tenantId, user])

  // Récupérer les données du tenant
  const loadData = async () => {
    const campaigns = await db.getCampaigns()
      .eq('tenant_id', tenantId) // ← FILTRAGE CRUCIAL
      .order('created_at', { ascending: false })
    
    setCampagnes(campaigns)
  }

  return (
    <div>
      <Navbar user={user} tenantId={tenantId} />
      {/* Pages avec données filtrées par tenant */}
    </div>
  )
}
*/

export default {
  getTenantId,
  setTenantId,
  getCurrentUser,
  setCurrentUser,
  buildTenantQuery,
  getCampaignsForTenant,
  addCampaignForTenant,
  hasPermission,
  logAction,
  PRICING_PLANS,
  ROLES
}
