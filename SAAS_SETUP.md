# 🏗️ Architecture SaaS Multi-Tenant - ImmoKey

## Vue d'ensemble

Le module Hospitality a été transformé en architecture SaaS multi-tenant, permettant :
- **Isolation des données** par organisation
- **Gestion des abonnements** (free, starter, professional, enterprise)
- **Système de rôles** (super_admin, admin, staff, user)
- **Super administrateur** avec vue globale sur tous les modules
- **Contrôle d'accès** (bloquer/débloquer organisations et utilisateurs)

---

## 📋 Installation

### 1. Exécuter le script de migration

**IMPORTANT** : Si vous avez déjà des établissements existants, utilisez le script de migration :

```bash
# Dans Supabase Dashboard > SQL Editor
# Copier-coller le contenu de database/migration_to_saas.sql
```

Ce script va :
- ✅ Créer les nouvelles tables SaaS (organizations, members, roles, etc.)
- ✅ Ajouter la colonne `organization_id` à `hospitality_establishments`
- ✅ Créer automatiquement une organisation pour chaque utilisateur existant
- ✅ Migrer tous les établissements existants vers ces organisations
- ✅ Configurer les policies RLS correctement

**Pour une installation vierge** (sans données existantes), utilisez :
```bash
# database/saas_hospitality_schema.sql
```

### 2. Créer votre premier super administrateur

Après avoir créé un compte utilisateur dans l'application, exécutez cette requête SQL :

```sql
-- Remplacer 'VOTRE_USER_ID' par l'ID de votre utilisateur (disponible dans auth.users)
-- Remplacer 'SUPER_ADMIN_ROLE_ID' par l'ID du rôle super_admin (disponible dans system_roles)

INSERT INTO user_system_roles (user_id, role_id, module, is_active)
VALUES (
  'VOTRE_USER_ID',
  (SELECT id FROM system_roles WHERE name = 'super_admin'),
  'all',
  true
);
```

**Méthode simplifiée** (utilise l'email de l'utilisateur) :

```sql
-- Remplacer 'votre@email.com' par votre email
INSERT INTO user_system_roles (user_id, role_id, module, is_active)
SELECT 
  u.id,
  (SELECT id FROM system_roles WHERE name = 'super_admin'),
  'all',
  true
FROM auth.users u
WHERE u.email = 'votre@email.com';
```

---

## 🏢 Créer une Organisation

### Via l'interface (à venir)

Les utilisateurs pourront créer des organisations depuis l'interface.

### Via SQL (pour tests)

```sql
-- Créer une organisation
INSERT INTO organizations (
  name,
  slug,
  description,
  owner_id,
  subscription_plan,
  subscription_status
)
VALUES (
  'Mon Hôtel',
  'mon-hotel',
  'Description de mon hôtel',
  'USER_ID_ICI',
  'professional',
  'active'
);
```

---

## 👥 Système de Rôles

### Rôles disponibles

1. **super_admin** : Accès complet à tous les modules et organisations
2. **admin** : Administrateur d'une organisation
3. **staff** : Personnel d'une organisation
4. **user** : Utilisateur standard

### Attribuer un rôle à un utilisateur

```sql
-- Créer un admin d'organisation
INSERT INTO user_system_roles (
  user_id,
  role_id,
  module,
  organization_id,
  is_active
)
SELECT 
  u.id,
  (SELECT id FROM system_roles WHERE name = 'admin'),
  'hospitality',
  'ORGANIZATION_ID_ICI',
  true
FROM auth.users u
WHERE u.email = 'admin@example.com';
```

---

## 🔐 Accès aux Interfaces

### Super Administrateur

- **URL** : `/admin`
- **Fonctionnalités** :
  - Vue d'ensemble globale (stats, utilisateurs, organisations)
  - Gestion des organisations (bloquer/débloquer)
  - Journal d'audit (toutes les actions)
  - Attribution de rôles
  - Contrôle d'accès

### Organisation (Hospitality)

- **URL** : `/hospitality` ou `/hotellerie`
- **Isolation** : Les données sont automatiquement filtrées par `organization_id`
- **Permissions** : Gérées via `organization_members` et `user_system_roles`

---

## 🔒 Sécurité (RLS)

### Isolation des données

Toutes les tables utilisent **Row Level Security (RLS)** pour isoler les données :

- **Organizations** : Visibles par les membres uniquement
- **Hospitality Establishments** : Filtrés par `organization_id`
- **Audit Logs** : Accessibles uniquement aux super_admins
- **Access Control** : Géré par les super_admins

### Vérification des permissions

Les services vérifient automatiquement :
- Appartenance à l'organisation
- Rôle dans l'organisation
- Statut super_admin pour les actions globales

---

## 📊 Structure des Données

### Flux de données

```
Organizations (Tenants)
  └── Organization Members (Membres)
      └── Hospitality Establishments (Établissements)
          └── Rooms (Chambres)
              └── Bookings (Réservations)
```

### Isolation garantie

- Chaque établissement appartient à une organisation
- Les requêtes filtrent automatiquement par `organization_id`
- Les super_admins peuvent voir toutes les organisations

---

## 🚀 Prochaines Étapes

### À implémenter

1. **Interface de création d'organisation** pour les utilisateurs
2. **Invitation par email** pour les membres d'organisation
3. **Dashboard par organisation** avec statistiques isolées
4. **Gestion des abonnements** (upgrade/downgrade)
5. **Limites selon le plan** (nombre d'établissements, chambres, etc.)
6. **Facturation** (intégration Stripe/PayPal)

### Services à créer

- `src/services/saas/subscriptionService.ts` - Gestion des abonnements
- `src/services/saas/invitationService.ts` - Invitations par email
- `src/hooks/useOrganization.ts` - Hook pour l'organisation actuelle
- `src/hooks/usePermissions.ts` - Hook pour vérifier les permissions

---

## 📝 Notes Importantes

1. **Migration des données existantes** : Si vous avez des établissements existants, ils doivent être associés à une organisation
2. **Backup** : Toujours faire un backup avant d'exécuter les migrations
3. **Tests** : Tester l'isolation des données avec plusieurs organisations
4. **Performance** : Les index sont en place, mais surveiller les requêtes avec beaucoup d'organisations

---

## 🆘 Dépannage

### Problème : "Accès refusé. Super administrateur requis."

**Solution** : Vérifier que votre utilisateur a bien le rôle `super_admin` :

```sql
SELECT 
  u.email,
  sr.name as role_name,
  usr.is_active
FROM auth.users u
JOIN user_system_roles usr ON usr.user_id = u.id
JOIN system_roles sr ON sr.id = usr.role_id
WHERE u.email = 'votre@email.com';
```

### Problème : Les établissements ne s'affichent pas

**Solution** : Vérifier que l'utilisateur est membre de l'organisation :

```sql
SELECT * FROM organization_members
WHERE user_id = 'USER_ID' AND organization_id = 'ORG_ID' AND is_active = true;
```

---

## 📚 Documentation API

Les services sont disponibles dans :
- `src/services/saas/organizationService.ts`
- `src/services/saas/organizationMemberService.ts`
- `src/services/saas/superAdminService.ts`

Les types TypeScript sont dans :
- `src/types/saas.ts`

