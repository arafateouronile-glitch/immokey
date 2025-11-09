# 🏨 Guide de la Gestion Hôtelière - ImmoKey

**Date** : Décembre 2024  
**Module** : Gestion des hôtels, auberges, apart-hotels et locations courtes durées

---

## 📍 Emplacement du Module

### Pages (Interface Utilisateur)

**Dossier** : `src/pages/hospitality/`

| Fichier | Route | Description |
|---------|-------|-------------|
| `HospitalityDashboardPage.tsx` | `/hospitality` | Tableau de bord principal |
| `EstablishmentsPage.tsx` | `/hospitality/establishments` | Liste des établissements |
| `CreateEstablishmentPage.tsx` | `/hospitality/establishments/new` | Créer un établissement |
| `EstablishmentDetailPage.tsx` | `/hospitality/establishments/:id` | Détails d'un établissement |
| `RoomsPage.tsx` | `/hospitality/establishments/:id/rooms` | Liste des chambres |
| `CreateRoomPage.tsx` | `/hospitality/establishments/:id/rooms/new` | Créer une chambre |
| `RoomDetailPage.tsx` | `/hospitality/rooms/:id` | Détails d'une chambre |
| `BookingsPage.tsx` | `/hospitality/bookings` | Liste des réservations |
| `CreateBookingPage.tsx` | `/hospitality/bookings/new` | Créer une réservation |
| `BookingDetailPage.tsx` | `/hospitality/bookings/:id` | Détails d'une réservation |

### Services (Logique Métier)

**Dossier** : `src/services/hospitality/`

| Fichier | Fonctions Principales |
|---------|----------------------|
| `establishmentService.ts` | CRUD établissements |
| `roomService.ts` | CRUD chambres |
| `bookingService.ts` | CRUD réservations, disponibilités |

### Types TypeScript

**Fichier** : `src/types/hospitality.ts`

Contient toutes les interfaces TypeScript pour :
- `HospitalityEstablishment`
- `HospitalityRoom`
- `HospitalityBooking`
- etc.

### Base de Données

**Fichier** : `database/hospitality_management_schema.sql`

**Tables** :
- `hospitality_establishments` - Établissements (hôtels, auberges, etc.)
- `hospitality_rooms` - Chambres des établissements
- `hospitality_bookings` - Réservations
- `hospitality_room_availability` - Disponibilités des chambres
- `hospitality_pricing_rules` - Règles de tarification

---

## 🚀 Comment Accéder au Module

### Via l'Interface

1. **Depuis la navigation** : Ajouter un lien dans le Header/Footer vers `/hospitality`
2. **Depuis le dashboard** : Si vous avez un dashboard utilisateur
3. **Directement** : Naviguer vers `/hospitality`

### Vérifier les Routes

Les routes sont définies dans `src/App.tsx`. Vérifiez que ces routes existent :

```typescript
<Route path="/hospitality" element={<HospitalityDashboardPage />} />
<Route path="/hospitality/establishments" element={<EstablishmentsPage />} />
// etc.
```

---

## 📋 Fonctionnalités Disponibles

### 1. Gestion des Établissements

**Fichiers clés** :
- `src/pages/hospitality/EstablishmentsPage.tsx`
- `src/pages/hospitality/CreateEstablishmentPage.tsx`
- `src/services/hospitality/establishmentService.ts`

**Fonctionnalités** :
- ✅ Créer un établissement (hôtel, auberge, apart-hôtel)
- ✅ Modifier un établissement
- ✅ Voir la liste des établissements
- ✅ Voir les détails d'un établissement

### 2. Gestion des Chambres

**Fichiers clés** :
- `src/pages/hospitality/RoomsPage.tsx`
- `src/pages/hospitality/CreateRoomPage.tsx`
- `src/services/hospitality/roomService.ts`

**Fonctionnalités** :
- ✅ Créer une chambre
- ✅ Modifier une chambre
- ✅ Gérer les types de chambres
- ✅ Gérer les équipements

### 3. Gestion des Réservations

**Fichiers clés** :
- `src/pages/hospitality/BookingsPage.tsx`
- `src/pages/hospitality/CreateBookingPage.tsx`
- `src/services/hospitality/bookingService.ts`

**Fonctionnalités** :
- ✅ Créer une réservation
- ✅ Voir la liste des réservations
- ✅ Gérer les disponibilités
- ✅ Vérifier les conflits de dates

---

## 🗄️ Installation de la Base de Données

Si les tables n'existent pas encore, exécutez :

```sql
-- Dans Supabase SQL Editor
-- Copier le contenu de database/hospitality_management_schema.sql
```

**Fichier** : `database/hospitality_management_schema.sql`

---

## 🔍 Vérification de l'État

### Vérifier si les Routes sont Configurées

```bash
# Chercher les routes dans App.tsx
grep -i "hospitality" src/App.tsx
```

### Vérifier si les Services Fonctionnent

```bash
# Lister les services
ls -la src/services/hospitality/
```

### Vérifier si les Pages Existent

```bash
# Lister les pages
ls -la src/pages/hospitality/
```

---

## 🛠️ Prochaines Étapes

### Si le Module n'est pas Accessible

1. **Vérifier les routes dans App.tsx** :
   - Ajouter les routes si manquantes
   - Importer les composants lazy-loaded

2. **Vérifier la base de données** :
   - Exécuter `hospitality_management_schema.sql`
   - Vérifier les politiques RLS

3. **Vérifier l'authentification** :
   - Le module nécessite une authentification
   - Vérifier les guards de routes

4. **Ajouter un lien dans la navigation** :
   - Modifier `src/components/common/Header.tsx`
   - Ajouter un lien vers `/hospitality`

---

## 📚 Structure Complète

```
src/
├── pages/
│   └── hospitality/
│       ├── HospitalityDashboardPage.tsx
│       ├── EstablishmentsPage.tsx
│       ├── CreateEstablishmentPage.tsx
│       ├── EstablishmentDetailPage.tsx
│       ├── RoomsPage.tsx
│       ├── CreateRoomPage.tsx
│       ├── RoomDetailPage.tsx
│       ├── BookingsPage.tsx
│       ├── CreateBookingPage.tsx
│       └── BookingDetailPage.tsx
├── services/
│   └── hospitality/
│       ├── establishmentService.ts
│       ├── roomService.ts
│       └── bookingService.ts
└── types/
    └── hospitality.ts

database/
└── hospitality_management_schema.sql
```

---

## 🔗 Liens Utiles

- **Schéma de base de données** : `database/hospitality_management_schema.sql`
- **Types TypeScript** : `src/types/hospitality.ts`
- **Point d'entrée routes** : `src/App.tsx`

---

## ✅ Checklist de Vérification

- [ ] Pages hospitality existent dans `src/pages/hospitality/`
- [ ] Services hospitality existent dans `src/services/hospitality/`
- [ ] Routes configurées dans `src/App.tsx`
- [ ] Base de données installée (`hospitality_management_schema.sql`)
- [ ] Types TypeScript définis dans `src/types/hospitality.ts`
- [ ] Lien dans la navigation (si nécessaire)

---

**Date de création** : Décembre 2024  
**Dernière mise à jour** : Décembre 2024






