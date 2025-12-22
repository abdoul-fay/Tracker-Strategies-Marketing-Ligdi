# 🔧 DÉPANNAGE - Erreurs et Solutions

## 🔴 Erreurs Courantes et Solutions

### 1. ❌ \"Authentification requise. Veuillez vous reconnecter.\"

#### Cause
Le `tenant_id` n'a pas pu être récupéré depuis Supabase après le login.

#### Solutions

**Solution 1: Attendre plus longtemps**
```javascript
// Augmenter le délai si le trigger Supabase est lent
// Dans src/pages/Login.jsx
await new Promise(resolve => setTimeout(resolve, 3000))  // 3 secondes au lieu de 2
```

**Solution 2: Vérifier Supabase Trigger**
```sql
-- Aller dans Supabase Dashboard → SQL Editor
-- Vérifier que le trigger existe
SELECT trigger_name, trigger_schema, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Si vide, créer le trigger manuellement
-- Copier-coller de supabase-schema-multitenant.sql
```

**Solution 3: Vérifier la table users**
```sql
-- Vérifier qu'il y a des enregistrements dans users
SELECT * FROM public.users ORDER BY created_at DESC LIMIT 5;

-- Si vide, le trigger n'a pas fonctionné
-- Insérer manuellement:
INSERT INTO public.users (auth_id, tenant_id, email, role)
SELECT 
  u.id as auth_id,
  t.id as tenant_id,
  u.email,
  'admin' as role
FROM auth.users u
LEFT JOIN public.tenants t ON t.owner_id = u.id
WHERE u.email = 'your-email@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users where auth_id = u.id
  );
```

---

### 2. ❌ \"No tenant_id. User not authenticated.\"

#### Cause
Vous avez essayé d'ajouter/mettre à jour des données sans être loggé.

#### Solutions

**Solution 1: Se connecter d'abord**
```javascript
// Vérifier localStorage avant d'utiliser db.addCampaign()
const tenantId = localStorage.getItem('tenant_id')
if (!tenantId) {
  console.error('Vous devez être loggé')
  // Rediriger vers login
  window.location.href = '/login'
}
```

**Solution 2: Vérifier la session**
```javascript
// Dans la console (F12)
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session)  // Doit avoir un user
```

**Solution 3: Effacer les données locales corrompues**
```javascript
// Dans la console (F12)
localStorage.clear()  // Effacer tout
sessionStorage.clear()  // Effacer session
location.reload()  // Recharger
```

---

### 3. ❌ \"Aucun tenant trouvé pour cet utilisateur\"

#### Cause
La table `users` n'a pas d'enregistrement pour cet `auth_id`.

#### Solutions

**Solution 1: Exécuter le SQL de réparation**
```sql
-- Supabase Dashboard → SQL Editor
-- Créer les enregistrements manquants

-- 1. Créer un tenant si manquant
INSERT INTO public.tenants (owner_id, company_name, subscription_tier)
SELECT 
  u.id,
  split_part(u.email, '@', 1) || '_' || substring(u.id::text, 1, 8),
  'starter'
FROM auth.users u
WHERE u.email = 'your-email@example.com'
  AND NOT EXISTS (SELECT 1 FROM public.tenants WHERE owner_id = u.id)
RETURNING id;

-- 2. Créer l'enregistrement user
INSERT INTO public.users (auth_id, tenant_id, email, role)
SELECT 
  u.id,
  t.id,
  u.email,
  'admin'
FROM auth.users u
JOIN public.tenants t ON t.owner_id = u.id
WHERE u.email = 'your-email@example.com'
  AND NOT EXISTS (SELECT 1 FROM public.users WHERE auth_id = u.id);
```

**Solution 2: Relancer le trigger manuellement**
```sql
-- Si le trigger ne s'est pas exécuté, simuler son action
SELECT handle_new_user()
FROM auth.users
WHERE email = 'your-email@example.com'
LIMIT 1;
```

---

### 4. ❌ Utilateur 1 voit les données de l'Utilisateur 2

#### Cause
Le RLS (Row Level Security) ne fonctionne pas correctement.

#### Solutions

**Solution 1: Vérifier que RLS est activé**
```sql
-- Supabase Dashboard → SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('campaigns', 'ambassadeurs', 'kpi_financiers', 'strategies');

-- rowsecurity doit être true pour toutes

-- Si false, activer:
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassadeurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_financiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
```

**Solution 2: Vérifier les policies RLS**
```sql
-- Vérifier qu'il y a une policy pour chaque table
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'campaigns';

-- Si vide, créer la policy:
CREATE POLICY "Campaigns - Isolate by tenant"
  ON public.campaigns
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.users 
      WHERE auth_id = auth.uid() 
      LIMIT 1
    )
  );
```

**Solution 3: Vérifier que auth.uid() fonctionne**
```sql
-- Tester si auth.uid() retourne l'ID utilisateur
SELECT auth.uid() as current_user_id;

-- Si NULL, vous n'êtes pas loggé à Supabase
-- Vérifier que l'authentification fonctionne

-- Ou tester directement en SELECT:
SELECT id, tenant_id, email 
FROM public.campaigns
WHERE tenant_id = (
  SELECT tenant_id FROM public.users
  WHERE auth_id = auth.uid()
  LIMIT 1
);

-- Si ça retourne 0 lignes, soit RLS bloque, soit pas de données
```

**Solution 4: Désactiver RLS temporairement pour tester (ATTENTION!)**
```sql
-- IMPORTANT: Seulement pour tester! Pas en production!

-- Désactiver RLS
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;

-- Tester si vous voyez les données des autres utilisateurs
SELECT id, tenant_id, name FROM public.campaigns;

-- Si oui, c'est RLS qui bloquait (bon!)
-- Si non, c'est que les données sont vraiment isolées

-- Réactiver immédiatement:
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
```

---

### 5. ❌ \"Request failed with status 404\"

#### Cause
Une table n'existe pas dans Supabase.

#### Solutions

**Solution 1: Vérifier que les tables existent**
```sql
-- Supabase Dashboard → SQL Editor
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Doit avoir: campaigns, ambassadeurs, kpi_financiers, strategies, tenants, users
```

**Solution 2: Créer les tables manquantes**
```
1. Aller à Supabase Dashboard
2. SQL Editor
3. Copier-coller le fichier: supabase-schema-multitenant.sql
4. Exécuter (Run button)
5. Attendre que tout se complète
```

**Solution 3: Vérifier le nom exact de la table**
```javascript
// Erreur commune: Nom de table mal écrit
// ❌ Faux
const { data } = await supabase.from('campagnes').select()

// ✅ Correct
const { data } = await supabase.from('campaigns').select()
```

---

### 6. ❌ Logs vides dans la console

#### Cause
Le logging n'a pas été appliqué, ou la console n'est pas ouverte.

#### Solutions

**Solution 1: Ouvrir la console**
```
Appuyez sur F12
Allez à l'onglet "Console"
Recharger la page (Ctrl+R)
Regarder les messages
```

**Solution 2: Vérifier que le logging est dans le code**
```javascript
// Vérifier src/lib/supabase.js a du logging
// Doit voir des lignes comme:
console.log('💾 Ajout campagne pour tenant:')
console.log('✅ Campagne ajoutée avec ID:')

// Si pas visible, le fichier n'a pas été mis à jour
```

**Solution 3: Nettoyer le cache du navigateur**
```
Ctrl+Shift+Delete (ou Cmd+Shift+Delete sur Mac)
Sélectionner "Tout effacer"
Recharger la page (Ctrl+R)
```

---

### 7. ❌ \"Syntax error in SQL\"

#### Cause
Le SQL n'a pas la syntaxe correcte.

#### Solutions

**Solution 1: Vérifier la syntaxe**
```
Ouvrir supabase-schema-multitenant.sql
Chercher les erreurs (manque `;` à la fin, guillemets mal placés, etc.)
```

**Solution 2: Exécuter ligne par ligne**
```sql
-- Au lieu de tout copier-coller, exécuter petit à petit
-- Supabase indiquera exactement quelle ligne échoue

-- Test chaque section:
CREATE TABLE IF NOT EXISTS public.tenants (...)  -- Line 1-20
-- If OK, continue next section
```

**Solution 3: Supprimer le fichier SQL et le recréer**
```
Aller dans les fichiers SQL du projet
Supprimer supabase-schema-multitenant.sql
Copier-coller le contenu du fichier depuis ce repo
```

---

### 8. ❌ \"Row count exceeded 10 rows\"

#### Cause
Une requête a retourné trop de lignes (problème Supabase).

#### Solutions

**Solution 1: Ajouter une limite**
```javascript
// ❌ Retourne toutes les lignes
const { data } = await supabase.from('campaigns').select()

// ✅ Limiter à 100 lignes
const { data } = await supabase
  .from('campaigns')
  .select()
  .limit(100)
```

**Solution 2: Vérifier le filtre tenant_id**
```javascript
// Vérifier que chaque requête filtre par tenant_id
const { data } = await supabase
  .from('campaigns')
  .select()
  .eq('tenant_id', tenantId)  // ✅ Filtre OBLIGATOIRE
  .limit(100)
```

---

## 🔍 DÉBOGUER PAS À PAS

### Méthode 1: Logging Détaillé

```javascript
// Ajouter des console.log partout
console.log('1. Tentative de login...')

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({...})
console.log('2. Auth result:', authData, authError)

const tenantId = await initializeTenantIdFromSession(supabase)
console.log('3. TenantId:', tenantId)

const campaigns = await db.getCampaigns()
console.log('4. Campaigns:', campaigns)
```

### Méthode 2: Tester dans la Console (F12)

```javascript
// Copier-coller dans la console du navigateur

// Test 1: Session
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session?.user?.email)

// Test 2: Tenant
const { data: userData } = await supabase
  .from('users')
  .select('tenant_id')
  .eq('auth_id', data.session?.user?.id)
  .single()
console.log('Tenant:', userData?.tenant_id)

// Test 3: Données
const { data: campaigns } = await supabase
  .from('campaigns')
  .select()
  .eq('tenant_id', userData?.tenant_id)
console.log('Campaigns:', campaigns)
```

### Méthode 3: Vérifier Supabase Directement

```sql
-- Supabase Dashboard → SQL Editor

-- Qui suis-je?
SELECT auth.uid() as my_id;

-- Quel est mon tenant?
SELECT tenant_id FROM public.users WHERE auth_id = auth.uid();

-- Quelles données j'ai accès?
SELECT * FROM public.campaigns;

-- Quelles données les autres ont?
SELECT * FROM public.campaigns WHERE tenant_id != (
  SELECT tenant_id FROM public.users WHERE auth_id = auth.uid()
);
```

---

## 📞 CONTACTER LE SUPPORT

Si vous avez toujours un problème:

1. **Ouvrir Supabase Dashboard**
2. **Copier cette information:**
   ```
   - Votre email: [?]
   - Tenant ID: localStorage.getItem('tenant_id')
   - Message d'erreur exact (depuis console F12)
   - Étapes pour reproduire
   ```

3. **Contacter le développeur avec ces infos**

---

**Bonne chance! 🍀**
