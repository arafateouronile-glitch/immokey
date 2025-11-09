# 📋 Statut TODO - ImmoKey

**Dernière mise à jour** : Novembre 2024

## ✅ Complété récemment

### Favoris (Terminé ✅)
- ✅ Service `favoritesService.ts` avec toutes les fonctions
- ✅ Composant `FavoriteButton.tsx` réutilisable
- ✅ Page `FavoritesPage.tsx` complète
- ✅ Route `/favoris` intégrée
- ✅ Lien "Favoris" dans le header (visible si connecté)
- ✅ Bouton favoris sur chaque `ListingCard`

---

## 🎯 Prochaines tâches prioritaires

### 1. Intégration Supabase - Requêtes Listings (URGENT)
**Priorité** : Haute | **Temps estimé** : 2-3h

- ⏳ Créer `listingService.ts` avec CRUD complet
  - ⏳ `getListings(filters)` - Récupérer avec filtres
  - ⏳ `getListing(id)` - Détails d'une annonce
  - ⏳ `createListing(data)` - Créer une annonce
  - ⏳ `updateListing(id, data)` - Modifier
  - ⏳ `deleteListing(id)` - Supprimer
  - ⏳ `getUserListings(userId)` - Annonces utilisateur

- ⏳ Connecter `SearchPage.tsx` à Supabase
- ⏳ Connecter `HomePage.tsx` pour afficher annonces récentes
- ⏳ Connecter `ListingDetailPage.tsx` pour afficher détails
- ⏳ Connecter `CreateListingPage.tsx` pour créer annonces
- ⏳ Connecter `MyListingsPage.tsx` pour afficher annonces utilisateur

**Fichiers à créer/modifier** :
```
src/services/listingService.ts (à créer)
src/pages/SearchPage.tsx (modifier)
src/pages/HomePage.tsx (modifier)
src/pages/ListingDetailPage.tsx (modifier)
src/pages/CreateListingPage.tsx (modifier)
src/pages/MyListingsPage.tsx (modifier)
```

---

### 2. Upload d'images (Haute priorité)
**Priorité** : Haute | **Temps estimé** : 2h

- ⏳ Configurer Supabase Storage
  - ⏳ Créer bucket `listing-images`
  - ⏳ Configurer politiques RLS Storage
  - ⏳ Activer accès public en lecture

- ⏳ Créer `imageService.ts`
  - ⏳ `uploadListingImage(file, listingId)`
  - ⏳ `uploadListingImages(files[], listingId)`
  - ⏳ `deleteListingImage(imageId)`

- ⏳ Créer composant `ImageUploader.tsx`
  - ⏳ Drag & drop
  - ⏳ Prévisualisation
  - ⏳ Validation (type, taille, min 3 images)
  - ⏳ Barre de progression

- ⏳ Intégrer dans `CreateListingPage.tsx`

**Fichiers à créer** :
```
src/services/imageService.ts
src/components/forms/ImageUploader.tsx
```

---

### 3. Géolocalisation (Moyenne priorité)
**Priorité** : Moyenne | **Temps estimé** : 2h

- ⏳ Vérifier installation Leaflet (`npm install leaflet react-leaflet @types/leaflet`)

- ⏳ Créer `PropertyMap.tsx` - Affichage carte avec position
- ⏳ Créer `MapSelector.tsx` - Sélection position sur carte

- ⏳ Intégrer dans `CreateListingPage.tsx` (sélection)
- ⏳ Intégrer dans `ListingDetailPage.tsx` (affichage)

**Fichiers à créer** :
```
src/components/maps/PropertyMap.tsx
src/components/maps/MapSelector.tsx
```

---

### 4. Recherche avancée (Moyenne priorité)
**Priorité** : Moyenne | **Temps estimé** : 1-2h

- ⏳ Implémenter filtres dans `listingService.ts`
  - ⏳ Type (location/vente)
  - ⏳ Type de bien (appartement, maison, etc.)
  - ⏳ Ville, quartier
  - ⏳ Prix min/max
  - ⏳ Nombre de pièces min
  - ⏳ Surface min

- ⏳ Implémenter tri
  - ⏳ Par date (récent/ancien)
  - ⏳ Par prix (croissant/décroissant)
  - ⏳ Par surface

- ⏳ Ajouter pagination
- ⏳ Afficher compteur de résultats

**Fichiers à modifier** :
```
src/services/listingService.ts
src/pages/SearchPage.tsx
```

---

## 📊 Progression

```
Fonctionnalités MVP :
├─ ✅ Favoris                    : 100% ✅
├─ ⏳ Intégration Supabase       : 20% (useAuth fait)
├─ ⏳ Upload images              : 0%
├─ ⏳ Géolocalisation            : 0%
└─ ⏳ Recherche avancée          : 0%

Progression globale : ~35% 🎯
```

---

## 🎯 Objectif MVP

**Date cible** : Fin novembre 2024

**Checklist MVP** :
- ✅ Structure projet
- ✅ Base de données
- ✅ Pages principales
- ✅ Favoris ✅
- ⏳ Intégration Supabase (listingService + connexions)
- ⏳ Upload images
- ⏳ Géolocalisation
- ⏳ Recherche fonctionnelle
- ⏳ Tests utilisateurs

---

## 📝 Notes

**Prochaine session recommandée** : Créer `listingService.ts` et connecter toutes les pages aux données Supabase. C'est la base pour que l'application fonctionne réellement.






