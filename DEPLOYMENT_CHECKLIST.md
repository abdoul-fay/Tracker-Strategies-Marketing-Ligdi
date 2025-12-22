# ✅ CHECKLIST DE DÉPLOIEMENT - Multi-Tenant Fix

## 🔴 AVANT DE DEPLOYER - VÉRIFICATIONS OBLIGATOIRES

### Base de Données Supabase

- [ ] Connectez-vous à [supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Allez dans l'onglet **SQL Editor**
- [ ] **Copier-coller et exécuter** ce script:

```sql
-- ============================================================================
-- VÉRIFICATION QUE LES TABLES EXISTENT
-- ============================================================================

-- 1. Vérifier la table tenants
SELECT COUNT(*) as tenants_count FROM public.tenants;

-- 2. Vérifier la table users
SELECT COUNT(*) as users_count FROM public.users;

-- 3. Vérifier la table campaigns avec tenant_id
SELECT COUNT(*) as campaigns_count,
       COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as with_tenant
FROM public.campaigns;

-- 4. Vérifier les indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('campaigns', 'ambassadeurs', 'kpi_financiers', 'strategies')
  AND indexname LIKE '%tenant%';

-- 5. Vérifier RLS activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('campaigns', 'ambassadeurs', 'kpi_financiers', 'strategies', 'users');
```

**✅ Attendu:**
- tenants_count ≥ 0
- users_count ≥ 0
- campaigns_count = with_tenant (tous les campaigns ont tenant_id)
- Indexes sur tenant_id existent
- rowsecurity = true (RLS activé)

---

## 🟢 DÉPLOIEMENT LOCAL - TEST

### 1. Redémarrer l'App Locale

```bash
# Terminal à la racine du projet
npm install  # Pour s'assurer que les dépendances sont à jour
npm run dev  # Démarrer le serveur Vite
```

### 2. Tester le Flux Complet

#### Test de Création de Compte

```
1. Ouvrir http://localhost:5173
2. Cliquer "Create Account"
3. Remplir:
   - Company Name: "Test Comp 1"
   - Email: "test1@company.com"
   - Password: "TestPass123!"
4. Attendre le message "✅ Compte créé avec succès"
5. Ouvrir F12 (Console) et vérifier les logs:
   - ⏳ Attente de la création du tenant...
   - 🔍 Recherche du tenant pour l'utilisateur: test1@company.com
   - ✅ Tenant trouvé: [UUID]
```

✅ **Si vous voyez ces logs, ça fonctionne!**

#### Test d'Ajout de Données

```
1. Une fois loggé, aller dans "Plan Marketing"
2. Cliquer "+ Ajouter une campagne"
3. Remplir les champs et cliquer "Enregistrer"
4. Console doit montrer:
   - 💾 Ajout campagne pour tenant: [UUID]
   - ✅ Campagne ajoutée avec ID: [UUID]
5. Vérifier que la campagne apparaît dans la liste
```

#### Test Multi-User (IMPORTANT!)

```
1. Ouvrir un onglet INCOGNITO avec la même application
2. Créer un compte différent:
   - Company Name: "Test Comp 2"
   - Email: "test2@company.com"
3. Ajouter 2 campagnes différentes
4. Onglet 1 (test1): Doit voir SEULES ses campagnes (ajoutées en premier)
5. Onglet Incognito (test2): Doit voir SEULES ses campagnes (ajoutées en deuxième)
6. Si un utilisateur voit les données de l'autre: ❌ RLS ne fonctionne pas
```

### 3. Vérifier les Logs Console

**✅ Logs Attendus (Bravo!)**
```
✅ tenant_id récupéré du localStorage: [UUID]
✅ Session trouvée, initialisation du tenant...
✅ Tenant initialisé, redirection...
💾 Ajout campagne pour tenant: [UUID]
✅ Campagne ajoutée avec ID: [UUID]
```

**❌ Logs d'Erreur (Problème!)**
```
❌ Aucun tenant_id trouvé. L'utilisateur n'est pas authentifié.
❌ Authentification requise. Veuillez vous reconnecter.
❌ Erreur dans addCampaign: ...
```

Si vous voyez des ❌, vérifiez:
1. Êtes-vous vraiment loggé? (Rechargez la page)
2. Le tenant a-t-il été créé dans Supabase? (Vérifier SQL)
3. Le RLS est-il activé? (Vérifier Supabase Dashboard)

---

## 🔵 DÉPLOIEMENT PRODUCTION - Cloudflare/Vercel

### Avant de Push à Production

- [ ] Tous les tests locaux passent ✅
- [ ] Pas de ❌ erreurs dans la console
- [ ] Multi-user test fonctionne
- [ ] Supabase RLS est activé

### Déployer (Si utilisant Vercel)

```bash
# 1. Commit et push les changements
git add -A
git commit -m "Fix: Multi-tenant data isolation - initialize tenant_id from Supabase auth"
git push origin main

# 2. Vercel va auto-déployer
# 3. Attendre que le déploiement se termine (max 5 min)
# 4. Tester à [your-domain].vercel.app

# 5. Si vous avez Cloudflare:
# - Mise en cache désactivée pour /api/*
# - Workers limités si nécessaire
```

### Vérifier le Déploiement

```
1. Aller sur https://your-domain.com/login
2. Créer un compte
3. F12 → Console pour vérifier les logs
4. Ajouter des données
5. Tester multi-user en incognito
```

---

## 🚨 ROLLBACK (Si problème découvert)

Si quelque chose casse en production:

```bash
# 1. Revert au commit précédent
git revert [commit-id]
git push origin main

# 2. Vercel va re-déployer l'ancienne version
# 3. Attendre la fin du déploiement

# 4. Déboguer le problème en local
# 5. Re-déployer une fois fixé
```

---

## 📊 VÉRIFICATION FINALE - Supabase Dashboard

### Aller dans Supabase Dashboard

1. **SQL Editor** → Exécuter:
```sql
-- Vérifier qu'un tenant a été créé
SELECT * FROM public.tenants ORDER BY created_at DESC LIMIT 1;

-- Vérifier qu'un user a été créé
SELECT * FROM public.users ORDER BY created_at DESC LIMIT 1;

-- Vérifier qu'une campagne a un tenant_id
SELECT * FROM public.campaigns WHERE tenant_id IS NOT NULL LIMIT 1;
```

2. **Authentication** → Vérifier que les nouveaux comptes apparaissent

3. **Database** → Vérifier les RLS Policies:
   - campaigns: "Campaigns - Isolate by tenant" ✅
   - ambassadeurs: "Ambassadeurs - Isolate by tenant" ✅
   - kpi_financiers: "KPI Financiers - Isolate by tenant" ✅
   - strategies: "Strategies - Isolate by tenant" ✅

---

## ✅ CHECKLIST FINALE

### Code
- [ ] `src/lib/multiTenant.js` - Fonction `initializeTenantIdFromSession()` ajoutée
- [ ] `src/pages/Login.jsx` - Utilise `initializeTenantIdFromSession()`
- [ ] `src/lib/supabase.js` - Logging et sécurité améliorés
- [ ] Pas d'erreurs JavaScript (npm run build devrait passer)

### Base de Données
- [ ] Tables créées: tenants, users, campaigns, ambassadeurs, kpi_financiers, strategies
- [ ] Colonnes tenant_id ajoutées à toutes les tables
- [ ] Indexes créés sur tenant_id
- [ ] RLS activé et policies créées
- [ ] Trigger `on_auth_user_created` activé

### Tests
- [ ] Création de compte fonctionne
- [ ] Ajout de données fonctionne
- [ ] Console montre les bons logs
- [ ] Multi-user test passe (isolation des données)
- [ ] Supabase RLS fonctionne

### Déploiement
- [ ] Commit les changements: `git commit -m "Fix: Multi-tenant data isolation"`
- [ ] Push: `git push origin main`
- [ ] Vercel/Cloudflare redéploie automatiquement
- [ ] Tester en production: Créer un compte et ajouter des données
- [ ] Vérifier Supabase Dashboard: Les données apparaissent avec tenant_id

---

## 🎉 SUCCÈS!

Si tous les points sont ✅, vous avez:
- ✅ Enregistrement correct des données par utilisateur
- ✅ Isolation complète entre tenants
- ✅ Sécurité multi-couche (Frontend + RLS + Auth)
- ✅ Logging pour déboguer les problèmes
- ✅ Application prête pour la production

---

## 🆘 PROBLÈMES COURANTS

### "Tenant trouvé: null"
→ Vérifier que le trigger Supabase a créé un enregistrement dans la table `users`
→ Attendre 5 secondes et réessayer (le trigger peut être lent)

### "Aucun tenant_id trouvé"
→ Vous n'êtes pas loggé correctement
→ Rechargez la page
→ Vérifiez que localStorage a `tenant_id` et `current_user`

### Multi-user test échoue (utilisateurs voient données mutuelles)
→ RLS ne fonctionne pas
→ Vérifier que `ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY` s'est exécuté
→ Vérifier les policies dans Supabase Dashboard

### "Error: Authentification requise"
→ Vous avez été déconnecté
→ Loggez-vous à nouveau

---

**Questions? Consultez MULTI_TENANT_FIX.md pour des instructions détaillées!**
