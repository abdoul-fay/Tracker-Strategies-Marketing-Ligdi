# 🚀 Quick Start Guide - Ligdi Marketing Tracker

## ⚡ 30 Secondes pour Démarrer

```bash
# 1. Installation
npm install

# 2. Lancement
npm run dev

# 3. Open
http://localhost:5174/
```

**Voilà ! L'app est prête.** 🎉

---

## 📱 Première Utilisation (5 minutes)

### Étape 1: Découvrir l'Accueil
1. Ouvrez l'app
2. Vous êtes sur la page **Accueil**
3. Voyez les statistiques globales

### Étape 2: Ajouter une Campagne
1. Cliquez sur **"Plan Marketing"** dans la navbar
2. Cliquez **"Ajouter une Campagne"**
3. Remplissez :
   - **Nom** : "Campagne Halloween"
   - **Date** : "2025-11-01"
   - **Canal** : "Réseaux Sociaux"
   - **Budget Prévu** : "50000"
   - **Budget Réel** : "45000"
   - **ROI** : "80000"
4. Cliquez **"Enregistrer"**

### Étape 3: Saisir les KPI Financiers
1. Cliquez sur **"KPI Financiers"** dans la navbar
2. Sélectionnez le **mois** (ex: 2025-11)
3. Remplissez les sections **CIBLE** et **RÉEL** :
   - **Utilisateurs ciblés** : 1000
   - **Transactions** : 500
   - **Volume total** : 500000
   - **Dépenses** : 50000
4. **✨ Les champs CPA, Panier Moyen et Bénéfices se remplissent automatiquement !**
5. Cliquez **"Enregistrer"**

### Étape 4: Voir le Dashboard
1. Cliquez sur **"Dashboard"** dans la navbar
2. Voyez vos **graphiques interactifs**
3. Consultez vos **KPI Financiers** au top
4. Analysez les **tableaux récapitulatifs**

### Étape 5: Analyser les Performances
1. Cliquez sur **"Comparatif Performance"** dans la navbar
2. Sélectionnez le mois
3. Voyez :
   - Graphique **Cible vs Réel**
   - Cartes d'**écarts colorés**
   - **Insights et recommandations**

---

## 🎯 Workflows Courants

### Workflow 1: Manager Occupé (5 min/jour)
```
Matin
├─ Accueil (2 min) → Voir synthèse et tendances
├─ Dashboard (2 min) → Vérifier graphiques clés
└─ Comparatif (1 min) → Identifier écarts majeurs

Action → Communiquer à l'équipe si besoin
```

### Workflow 2: Analyste Marketing (30 min)
```
Semaine
├─ Plan Marketing → Gérer les campagnes
├─ KPI Financiers → Saisir les données (auto-calculées!)
├─ Dashboard → Analyser en détail
├─ Comparatif → Identifier tendances
└─ Stratégies → Planifier ajustements

Action → Proposer optimisations
```

### Workflow 3: Équipe Stratégie (1h/semaine)
```
Vendredi
├─ Accueil → Vue globale du mois
├─ Dashboard → Performance campaigns
├─ Comparatif → Écarts à corriger
├─ Stratégies → Planifier semaine suivante
└─ Budget Global → Allouer ressources

Action → Plan d'action pour semaine N+1
```

---

## 💡 Tips & Astuces

### ✨ Les Calculs Automatiques
**Ne saisissez JAMAIS CPA, Panier Moyen ou Bénéfices manuellement !**

C'est automatique :
- **CPA** = Dépenses ÷ Utilisateurs
- **Panier Moyen** = Volume ÷ Transactions
- **Bénéfices** = Volume - Dépenses

### 📊 Les Graphiques
- 🖱️ **Hover** = Voir valeurs exactes
- 🔄 **Cliquer légende** = Filtrer données
- 📱 **Redimensionner** = S'adapte automatiquement

### 💾 Vos Données
- ✅ Tout est sauvegardé **automatiquement**
- ✅ Dans **localStorage** (local à votre navigateur)
- ✅ **Jamais envoyé** au serveur (100% privé)
- ✅ **Persiste** même après fermeture

### 🎨 Design
- Les **cartes se lèvent** au hover
- Les **boutons changent** au survol
- Les **transitions sont fluides**
- Tout est **100% responsive**

---

## ❓ FAQ Rapide

### Q: Où sont mes données?
**R:** Dans le **localStorage** de votre navigateur. Jamais envoyées au serveur.

### Q: Je peux exporter les données?
**R:** Oui! Allez dans `config.js` et utilisez `exportData()`.

### Q: Comment supprimer tout?
**R:** Dans une campagne ou KPI, cliquez le bouton "Supprimer".

### Q: Les calculs CPA sont faux?
**R:** Vérifiez que vous saisissez bien les 4 champs de base (Utilisateurs, Transactions, Volume, Dépenses).

### Q: Peut-on avoir plusieurs utilisateurs?
**R:** Actuellement non (v1.0.0). Prévu pour v2.0 avec backend.

### Q: Y a-t-il un dark mode?
**R:** Pas en v1.0.0, mais le thème est clair et moderne 🎨

---

## 🔧 Troubleshooting

### L'app ne démarre pas
```bash
# Vérifiez que Node.js est installé
node -v

# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install

# Relancez
npm run dev
```

### Les données disparaissent
**localStorage** fonctionne par domaine/navigateur.
- Changez de navigateur = nouvelles données
- Videz le cache = données supprimées
- **Solution** : Export avant de nettoyer

### Un graphique n'affiche pas
- Vérifiez que vous avez des **données** (campagnes ou KPI)
- Vérifiez les **valeurs** (pas de zéro)
- Rechargez la page

### Les calculs ne se font pas
- Vérifiez les **4 champs obligatoires** :
  - Utilisateurs
  - Transactions
  - Volume
  - Dépenses
- Saisissez des **nombres** (pas de texte)

---

## 🎓 Ressources

### Documentation Complète
- 📖 `README.md` - Guide complet
- ✨ `HIGHLIGHTS.md` - Points clés
- 📝 `CHANGELOG.md` - Historique
- 🗺️ `USER_JOURNEY.md` - Parcours utilisateur
- ✅ `CHECKLIST_FINALE.md` - Features validées

### Code Source
- `src/pages/` - Tous les modules
- `src/components/` - Navbar
- `src/config.js` - Configuration

---

## 🚀 Pour Aller Plus Loin

### Modifier les Canaux
Éditez `src/config.js`:
```javascript
CANAUX: [
  'Réseaux Sociaux',
  'Email',
  'Mon Canal Custom', // ← Ajouter ici
  // ...
]
```

### Changer les Couleurs
Éditez `src/index.css`:
```css
:root {
  --primary: #6366f1;  /* Changez cette couleur */
  /* ... */
}
```

### Ajouter une Page
1. Créez `src/pages/MonPage.jsx`
2. Créez `src/pages/MonPage.css`
3. Importez dans `App.jsx`
4. Ajoutez dans le switch
5. Ajoutez un bouton dans `Navbar.jsx`

---

## 📞 Besoin d'Aide?

Consultez les fichiers MD dans le projet :
- Questions générales → `README.md`
- Points clés → `HIGHLIGHTS.md`
- Parcours utilisateur → `USER_JOURNEY.md`
- Features → `CHECKLIST_FINALE.md`

---

## ✅ Vous êtes Prêt!

```
✅ Installation OK
✅ Lancement OK
✅ Première utilisation OK
✅ Données sauvegardées OK
✅ Graphiques visibles OK

🎉 C'EST BON ! Profitez ! 
```

---

**Happy Tracking! 📊** 🚀

*Ligdi Marketing Tracker - v1.0.0*  
*Made with ❤️ for Marketing Teams*
