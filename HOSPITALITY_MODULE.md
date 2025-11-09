# 🏨 Module Gestion Hôtelière - ImmoKey

Ce document décrit le module de gestion des établissements d'hébergement (hôtels, auberges, apparthotels) qui a été intégré dans ImmoKey.

## 📋 Vue d'ensemble

Le module permet de gérer :
- **Hôtels** : Établissements hôteliers classiques
- **Auberges** : Petits établissements d'hébergement
- **Apparthotels** : Appartements meublés avec services hôteliers
- **Résidences** : Résidences de tourisme
- **Gîtes** : Hébergements touristiques ruraux
- **Autres** : Autres types d'établissements

## 🗄️ Structure de la base de données

### Tables créées

1. **hospitality_establishments** : Établissements hôteliers
   - Informations générales (nom, adresse, contact)
   - Type d'établissement
   - Équipements et services
   - Photos et métadonnées
   - Horaires de check-in/check-out

2. **hospitality_rooms** : Chambres/Unités
   - Numéro et type de chambre
   - Capacité (nombre de personnes, lits)
   - Caractéristiques et équipements
   - Tarif de base par nuit
   - Photos

3. **hospitality_bookings** : Réservations
   - Informations du client
   - Période de séjour (dates check-in/check-out)
   - Tarification détaillée
   - Statut de réservation et paiement
   - Référence unique générée automatiquement

4. **hospitality_room_availability** : Disponibilité
   - Gestion des périodes disponibles/bloquées
   - Maintenance, réservations, blocages

5. **hospitality_pricing_rules** : Règles de tarification
   - Tarifs variables (saison, week-end, événements)
   - Modifications de prix (fixe, pourcentage, multiplicateur)

### Fonctionnalités automatiques

- ✅ Calcul automatique du nombre de nuits
- ✅ Génération automatique de référence de réservation (ex: HTL-2025-001)
- ✅ Mise à jour automatique des dates (triggers)
- ✅ Row Level Security (RLS) pour la sécurité des données

## 📁 Fichiers créés

### Base de données
- `database/hospitality_management_schema.sql` : Schéma complet avec toutes les tables, index, triggers et politiques RLS

### Types TypeScript
- `src/types/hospitality.ts` : Toutes les interfaces et types pour le module

### Services
- `src/services/hospitality/establishmentService.ts` : Service de base pour gérer les établissements (CRUD)

## 🚀 Installation

### 1. Exécuter le schéma SQL

Dans Supabase SQL Editor, exécutez :
```sql
-- Copier-coller le contenu de database/hospitality_management_schema.sql
```

### 2. Vérifier l'installation

Vérifiez que les tables sont créées :
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'hospitality_%';
```

## 📊 Fonctionnalités disponibles

### Établissements
- ✅ Créer un établissement
- ✅ Modifier un établissement
- ✅ Archiver un établissement
- ✅ Lister les établissements
- ✅ Statistiques des établissements

### À venir (prochaine étape)
- 🔲 Gestion des chambres
- 🔲 Système de réservations
- 🔲 Calendrier de disponibilité
- 🔲 Règles de tarification
- 🔲 Dashboard de gestion
- 🔲 Rapports et statistiques

## 🔐 Sécurité

Toutes les tables utilisent **Row Level Security (RLS)** :
- Les utilisateurs ne peuvent voir que leurs propres établissements
- Les chambres, réservations et disponibilités sont liées aux établissements de l'utilisateur
- Les règles de tarification suivent la même logique

## 📝 Exemples d'utilisation

### Créer un établissement

```typescript
import { createEstablishment } from '@/services/hospitality/establishmentService'

const establishment = await createEstablishment({
  establishment_type: 'hotel',
  name: 'Hôtel du Lac',
  address: '123 Avenue de la République',
  city: 'Lomé',
  phone: '+228 90 12 34 56',
  email: 'contact@hoteldulac.tg',
  amenities: ['wifi', 'piscine', 'restaurant', 'parking'],
})
```

### Lister les établissements

```typescript
import { getEstablishments } from '@/services/hospitality/establishmentService'

const establishments = await getEstablishments()
```

## 🎯 Prochaines étapes

1. Créer les services pour :
   - Les chambres (`roomService.ts`)
   - Les réservations (`bookingService.ts`)
   - La disponibilité (`availabilityService.ts`)
   - Les règles de tarification (`pricingService.ts`)

2. Créer les pages :
   - Dashboard hôtelier
   - Liste des établissements
   - Création/édition d'établissement
   - Gestion des chambres
   - Calendrier de réservations
   - Liste des réservations

3. Créer les composants :
   - Formulaire de création d'établissement
   - Carte d'établissement
   - Calendrier de disponibilité
   - Formulaire de réservation
   - Liste des chambres

## 📚 Documentation technique

Pour plus de détails sur la structure des données, consultez :
- `database/hospitality_management_schema.sql` : Schéma complet
- `src/types/hospitality.ts` : Types TypeScript

## 🔄 Intégration avec le module de gestion locative

Le module de gestion hôtelière est complémentaire au module de gestion locative existant :
- **Gestion locative** : Locations longue durée (appartements, maisons)
- **Gestion hôtelière** : Hébergements courte durée (hôtels, auberges)

Les deux modules partagent la même structure de base et peuvent être utilisés simultanément.





