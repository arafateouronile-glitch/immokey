# 🧪 Guide de Test - ImmoKey

## 🚀 Démarrage

Le serveur de développement devrait être accessible sur : **http://localhost:5173**

Si ce n'est pas le cas, lancez :
```bash
npm run dev
```

---

## ✅ Checklist de Test

### 1. Page d'accueil (HomePage)

- [ ] La page se charge sans erreur
- [ ] Le titre "Trouvez votre logement idéal au Togo" s'affiche
- [ ] La barre de recherche est visible
- [ ] Les boutons "Location" et "Vente" fonctionnent
- [ ] La section "Annonces récentes" affiche des cartes d'annonces
- [ ] Cliquer sur "Voir tout" redirige vers `/recherche`
- [ ] Le design est responsive (tester sur mobile)

**Commandes** :
- Ouvrir : http://localhost:5173
- Vérifier la console (F12) : pas d'erreurs rouges

---

### 2. Navigation

- [ ] Le logo "ImmoKey" redirige vers la home
- [ ] "Rechercher" → `/recherche`
- [ ] "Publier" → `/publier`
- [ ] "Favoris" visible si connecté
- [ ] "Profil" ou "Se connecter" selon l'état

**Test** :
- Cliquer sur chaque lien du menu
- Vérifier que les URLs changent correctement

---

### 3. Recherche (SearchPage)

- [ ] La page `/recherche` se charge
- [ ] Les filtres sont affichés :
  - [ ] Type de transaction (location/vente)
  - [ ] Type de bien
  - [ ] Ville/quartier
  - [ ] Prix min/max
- [ ] Les résultats se mettent à jour lors des filtres
- [ ] Le compteur de résultats s'affiche
- [ ] Cliquer sur une carte redirige vers `/annonce/:id`

**Test** :
- Appliquer différents filtres
- Vérifier que les résultats correspondent
- Tester avec des valeurs vides

---

### 4. Inscription (RegisterPage)

- [ ] Le formulaire s'affiche
- [ ] Les champs sont présents :
  - [ ] Nom complet
  - [ ] Email
  - [ ] Téléphone
  - [ ] Mot de passe
  - [ ] Confirmation mot de passe
- [ ] La validation fonctionne (messages d'erreur)
- [ ] L'inscription crée un compte Supabase
- [ ] Redirection après inscription réussie

**Test** :
1. Aller sur `/inscription`
2. Remplir avec des données valides
3. Vérifier la création dans Supabase Dashboard > Authentication

---

### 5. Connexion (LoginPage)

- [ ] Le formulaire s'affiche
- [ ] Connexion avec email/mot de passe fonctionne
- [ ] Messages d'erreur en cas d'échec
- [ ] Redirection après connexion
- [ ] Le menu change (affichage "Profil" au lieu de "Se connecter")

**Test** :
1. Aller sur `/connexion`
2. Se connecter avec un compte existant
3. Vérifier la session dans la console (F12 > Application > Local Storage)

---

### 6. Publication d'annonce (CreateListingPage)

#### 6.1 Formulaire de base
- [ ] Accès nécessite connexion (redirection si non connecté)
- [ ] Tous les champs sont présents :
  - [ ] Type de transaction
  - [ ] Type de bien
  - [ ] Titre
  - [ ] Description
  - [ ] Ville, Quartier, Adresse
  - [ ] Prix, Pièces, Salles de bain, Surface

#### 6.2 Upload d'images
- [ ] La zone de drag & drop est visible
- [ ] Glisser-déposer des images fonctionne
- [ ] Cliquer pour sélectionner fonctionne
- [ ] Prévisualisation des images s'affiche
- [ ] Suppression d'images (bouton X) fonctionne
- [ ] Validation : minimum 3 images requis
- [ ] Message d'erreur si < 3 images

#### 6.3 Géolocalisation
- [ ] La carte s'affiche
- [ ] La géolocalisation est demandée (si autorisée)
- [ ] La carte se centre sur Lomé par défaut (si géoloc refusée)
- [ ] Cliquer sur la carte met à jour les coordonnées
- [ ] Les coordonnées s'affichent en temps réel

#### 6.4 Publication
- [ ] Le bouton "Publier" est désactivé si < 3 images
- [ ] L'indicateur de progression s'affiche
- [ ] La publication fonctionne
- [ ] Redirection vers `/annonce/:id` après publication
- [ ] L'annonce apparaît dans `/mes-annonces`

**Test complet** :
1. Se connecter
2. Aller sur `/publier`
3. Remplir tous les champs
4. Uploader 3+ images
5. Sélectionner un emplacement sur la carte
6. Publier
7. Vérifier que l'annonce est créée dans Supabase

---

### 7. Détails d'annonce (ListingDetailPage)

- [ ] Toutes les infos s'affichent :
  - [ ] Images (galerie)
  - [ ] Titre
  - [ ] Adresse complète
  - [ ] Prix avec formatage
  - [ ] Caractéristiques (pièces, salles de bain, surface)
  - [ ] Description
  - [ ] Équipements (si disponibles)
- [ ] **Carte affichée si coordonnées disponibles**
  - [ ] Marqueur au bon endroit
  - [ ] Popup avec titre et adresse
  - [ ] Zoom et pan fonctionnent
- [ ] Bouton favoris (cœur) fonctionne
- [ ] Boutons "Appeler" et "Envoyer un message" présents

**Test** :
- Ouvrir une annonce avec coordonnées
- Vérifier que la carte s'affiche
- Tester le zoom/pan
- Cliquer sur le bouton favoris

---

### 8. Mes annonces (MyListingsPage)

- [ ] Accès nécessite connexion
- [ ] Liste de toutes les annonces de l'utilisateur
- [ ] Bouton "Nouvelle annonce" fonctionne
- [ ] Boutons "Modifier" et "Supprimer" sur chaque annonce
- [ ] La suppression demande confirmation
- [ ] Liste se met à jour après suppression

**Test** :
1. Aller sur `/mes-annonces`
2. Vérifier que vos annonces s'affichent
3. Supprimer une annonce test
4. Vérifier la mise à jour

---

### 9. Favoris (FavoritesPage)

#### 9.1 Bouton favoris
- [ ] Le bouton cœur s'affiche sur chaque carte d'annonce
- [ ] Cliquer ajoute/retire des favoris
- [ ] L'icône change (vide → plein)
- [ ] Message si non connecté

#### 9.2 Page favoris
- [ ] Accès nécessite connexion
- [ ] Liste de toutes les annonces favorites
- [ ] Compteur d'annonces s'affiche
- [ ] Message si aucun favori
- [ ] Bouton "Découvrir des annonces" fonctionne

**Test** :
1. Se connecter
2. Aller sur une annonce
3. Cliquer sur le cœur
4. Aller sur `/favoris`
5. Vérifier que l'annonce apparaît

---

### 10. Responsive Design

- [ ] Menu hamburger fonctionne sur mobile
- [ ] Les cartes s'adaptent à la largeur
- [ ] La carte Leaflet est responsive
- [ ] Les formulaires sont utilisables sur mobile
- [ ] L'upload d'images fonctionne sur mobile

**Test** :
- Ouvrir DevTools (F12)
- Tester différentes tailles d'écran (iPhone, iPad, Desktop)
- Vérifier que tout reste fonctionnel

---

## 🐛 Tests de cas limites

### Erreurs réseau
- [ ] Message d'erreur si Supabase non configuré
- [ ] Message d'erreur si connexion échoue
- [ ] Message d'erreur si upload d'image échoue

### Validation
- [ ] Messages d'erreur pour champs requis
- [ ] Validation email format
- [ ] Validation mot de passe (min 6 caractères)
- [ ] Validation images (type, taille, nombre)

### État non connecté
- [ ] Redirection vers connexion pour pages protégées
- [ ] Messages clairs si action nécessite connexion
- [ ] Préservation de la page de destination après connexion

---

## ✅ Checklist finale

- [ ] Aucune erreur dans la console
- [ ] Toutes les pages se chargent
- [ ] Navigation fluide
- [ ] Design cohérent
- [ ] Fonctionnalités principales opérationnelles
- [ ] Responsive fonctionnel
- [ ] Pas d'erreurs TypeScript (vérifier avec `npm run build`)

---

## 📊 Résultats attendus

### Fonctionnalités MVP

| Fonctionnalité | État | Notes |
|---------------|------|-------|
| Authentification | ✅ | Inscription + Connexion |
| Recherche | ✅ | Filtres fonctionnels |
| Publication | ✅ | Avec images + géoloc |
| Détails annonce | ✅ | Avec carte |
| Favoris | ✅ | Bouton + Page |
| Mes annonces | ✅ | CRUD complet |
| Upload images | ✅ | Drag & drop |
| Géolocalisation | ✅ | Carte interactive |

---

## 🐛 Problèmes connus / À surveiller

1. **Carte ne s'affiche pas** : Vérifier que les styles Leaflet sont chargés
2. **Images ne s'uploadent pas** : Vérifier la configuration Supabase Storage
3. **Géolocalisation bloquée** : Normal si refusée, fallback sur Lomé
4. **Erreur "fail to fetch"** : Vérifier les variables d'environnement

---

## 🎯 Prochaines étapes après tests

Si tout fonctionne :
1. ✅ Implémenter recherche avancée (tri, pagination)
2. ✅ Compléter le profil utilisateur
3. ✅ Ajouter la messagerie
4. ✅ Déployer en production

---

**Bon test ! 🚀**






