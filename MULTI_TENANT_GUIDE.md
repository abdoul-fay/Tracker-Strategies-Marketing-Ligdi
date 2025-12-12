# 🔒 ARCHITECTURE MULTI-TENANT - Isolation des Données

## LE PROBLÈME

Actuellement: Tous les clients partagent **une seule base Supabase**  
❌ Client A voit les données de Client B  
❌ Pas de sécurité des données  
❌ Non conforme RGPD/HIPAA  

## LA SOLUTION

Chaque client a:
- ✅ Son propre **tenant_id** unique
- ✅ Ses propres données **complètement isolées**
- ✅ Accès SEULEMENT à ses données
- ✅ Authentification sécurisée
- ✅ Audit logging de toutes les actions

---

## 🏗️ ARCHITECTURE

### Option 1: Single Supabase + Multi-Tenant (RECOMMANDÉ)

```
┌─────────────────────────────────┐
│     Cloudflare Pages (APP)      │
│  (Shared instance pour tous)    │
└────────────────┬────────────────┘
                 │
         ┌───────▼────────┐
         │   Login Page   │
         │ (tenant_id)    │
         └───────┬────────┘
                 │
         ┌───────▼──────────────┐
         │  Supabase (Shared)   │
         │                      │
         │ ├─ Campaigns         │
         │ │  └─ tenant_id ◀─┐  │
         │ │                  │  │
         │ ├─ Ambassadeurs    │  │
         │ │  └─ tenant_id ◀─┼──┤─ RLS Policy
         │ │                  │  │
         │ ├─ Strategies      │  │
         │ │  └─ tenant_id ◀─┘  │
         │ │                     │
         │ └─ Tenants/Users    │
         └──────────────────────┘
```

**Avantages:**
- ✅ Une seule instance à maintenir
- ✅ Coûts partagés
- ✅ Simple à déployer
- ✅ RLS (Row Level Security) isole les données
- ✅ Scalable à 1000+ clients

**Coût:** ~$10-50/mois Supabase pour tous les clients

---

### Option 2: Supabase Séparé par Client

```
Client A          Client B          Client C
   │                 │                 │
   ▼                 ▼                 ▼
Supabase A      Supabase B       Supabase C
(Isolé)         (Isolé)          (Isolé)
```

**Avantages:**
- ✅ Isolation complète
- ✅ Données en silos séparés
- ✅ Meilleure performance
- ✅ Conforme réglementations strictes

**Coût:** ~$100/mois par Supabase × nombre de clients

---

### Option 3: Déploiement Séparé par Client

```
Client A        Client B         Client C
   │               │                 │
   ▼               ▼                 ▼
Deployment A   Deployment B    Deployment C
(App + BD)     (App + BD)      (App + BD)
domain.a.com   domain.b.com    domain.c.com
```

**Avantages:**
- ✅ Isolation maximale
- ✅ Domaine personnalisé
- ✅ Données non partagées
- ✅ Très sécurisé

**Coût:** ~$50-100/mois × nombre de clients

---

## 🔐 IMPLÉMENTATION: OPTION 1 (Recommandée)

### Étape 1: Modifier le Schéma Supabase

```sql
-- Ajouter colonne tenant_id à CHAQUE table
ALTER TABLE campaigns ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE ambassadeurs ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE strategies ADD COLUMN tenant_id UUID NOT NULL;

-- Créer les index pour performance
CREATE INDEX idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX idx_ambassadeurs_tenant_id ON ambassadeurs(tenant_id);
CREATE INDEX idx_strategies_tenant_id ON strategies(tenant_id);

-- Créer tables utilisateurs
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  plan TEXT DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT,
  resource TEXT,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

### Étape 2: Activer RLS (Row Level Security)

```sql
-- Activer RLS sur campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_tenant_isolation"
  ON campaigns
  FOR SELECT
  USING (tenant_id = (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "campaigns_insert_own_tenant"
  ON campaigns
  FOR INSERT
  WITH CHECK (tenant_id = (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "campaigns_update_own_tenant"
  ON campaigns
  FOR UPDATE
  USING (tenant_id = (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "campaigns_delete_own_tenant"
  ON campaigns
  FOR DELETE
  USING (tenant_id = (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- Répéter pour ambassadeurs, strategies, etc.
```

### Étape 3: Intégrer dans l'App

```javascript
// src/App.jsx
import { getTenantId, setTenantId } from './lib/multiTenant'

export default function App() {
  const [authenticated, setAuthenticated] = useState(!!getTenantId())

  useEffect(() => {
    // Récupérer uniquement les données du tenant
    const loadData = async () => {
      const tenantId = getTenantId()
      if (!tenantId) return

      const campaigns = await db.getCampaigns()
        .eq('tenant_id', tenantId)  // ← CRUCIAL
      
      setCampagnes(campaigns)
    }
    
    loadData()
  }, [])

  if (!authenticated) {
    return <LoginPage onLogin={setTenantId} />
  }

  return <Dashboard />
}
```

---

## 🔑 PAGE DE LOGIN REQUISE

```javascript
// src/pages/Login.jsx
import { useState } from 'react'
import { setTenantId, setCurrentUser } from '../lib/multiTenant'
import { db } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      // Authentifier l'utilisateur
      const { data, error: authError } = await db.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Récupérer l'utilisateur et son tenant
      const { data: user, error: userError } = await db
        .from('users')
        .select('*, tenants(*)')
        .eq('id', data.user.id)
        .single()

      if (userError) throw userError

      // Stocker le tenant_id et les infos utilisateur
      setTenantId(user.tenant_id)
      setCurrentUser(user)

      // Rediriger vers l'app
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h1>Connexion - Marketing Tracker</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Connexion</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
```

---

## 💰 PRICING & QUOTAS

```javascript
// src/lib/multiTenant.js
export const PRICING_PLANS = {
  starter: {
    price: 29,
    maxUsers: 3,
    maxCampaigns: 50,
    maxStorage: '1GB'
  },
  pro: {
    price: 99,
    maxUsers: 10,
    maxCampaigns: 500,
    maxStorage: '10GB'
  },
  enterprise: {
    price: 'custom',
    maxUsers: 'unlimited',
    maxCampaigns: 'unlimited',
    maxStorage: 'unlimited'
  }
}
```

---

## 📊 AUDIT & COMPLIANCE

Chaque action loggée:
```
User: john@company.com
Tenant: Company A
Action: created_campaign
Campaign: "Q1 2025 Campaign"
Timestamp: 2025-12-12 14:35:00
```

---

## ✅ CHECKLIST DE SÉCURITÉ

- [ ] RLS activé sur Supabase
- [ ] tenant_id sur CHAQUE table
- [ ] Authentification JWT
- [ ] Password hashing (bcrypt)
- [ ] HTTPS seulement
- [ ] Audit logging
- [ ] Backups réguliers
- [ ] Chiffrement des données sensibles

---

## 🚀 RÉSULTAT FINAL

**Avant:**
```
❌ Client A → Voit tout
❌ Client B → Voit tout
❌ Données mélangées
❌ Pas de sécurité
```

**Après:**
```
✅ Client A → Voit SEULEMENT ses données
✅ Client B → Voit SEULEMENT ses données
✅ Données complètement isolées
✅ Conforme RGPD/HIPAA
✅ Prêt pour vente en SaaS
```

---

**Conclusion:** Avec cette architecture, tu peux partager le lien avec 1000 entreprises et chacune verra SEULEMENT ses propres données! 🔒
