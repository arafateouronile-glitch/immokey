# 🧪 Guide de Tests Manuels des Politiques RLS

## 📋 Vue d'ensemble

Ce guide décrit comment tester manuellement que les politiques RLS fonctionnent correctement dans votre application.

## 🎯 Objectifs des Tests

1. ✅ Vérifier l'isolation des données (un utilisateur ne voit pas les données d'un autre)
2. ✅ Vérifier les permissions de création
3. ✅ Vérifier les permissions de modification
4. ✅ Vérifier les permissions de suppression
5. ✅ Vérifier les restrictions d'accès

## 🔧 Prérequis

- Au moins 2 comptes utilisateurs de test
- Des données de test dans la base de données
- Accès à l'application et/ou à Supabase SQL Editor

## 📝 Tests à Effectuer

### Test 1: Isolation des Données - Listings

**Objectif :** Vérifier qu'un utilisateur ne voit que ses propres annonces

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A
2. Dans l'application, allez à "Mes annonces" ou exécutez dans SQL Editor (en tant qu'utilisateur A) :
   ```sql
   SELECT COUNT(*) FROM listings;
   ```
3. Notez le nombre d'annonces
4. Connectez-vous en tant qu'utilisateur B
5. Exécutez la même requête
6. Le nombre devrait être différent (ou 0 si l'utilisateur B n'a pas d'annonces)

**Résultat attendu :** Chaque utilisateur voit uniquement ses propres annonces

---

### Test 2: Isolation des Données - Favorites

**Objectif :** Vérifier qu'un utilisateur ne voit que ses propres favoris

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A
2. Exécutez :
   ```sql
   SELECT COUNT(*) FROM favorites;
   ```
3. Connectez-vous en tant qu'utilisateur B
4. Exécutez la même requête
5. Les résultats devraient être différents

**Résultat attendu :** Chaque utilisateur voit uniquement ses propres favoris

---

### Test 3: Création - Listings

**Objectif :** Vérifier qu'une annonce créée est automatiquement liée à l'utilisateur

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A
2. Créez une nouvelle annonce via l'application
3. Vérifiez dans la base de données :
   ```sql
   SELECT user_id FROM listings WHERE id = 'id-de-l-annonce';
   ```
4. Le `user_id` devrait correspondre à l'ID de l'utilisateur A

**Résultat attendu :** L'annonce est automatiquement liée à l'utilisateur créateur

---

### Test 4: Création - Favorites

**Objectif :** Vérifier qu'on ne peut créer un favori que pour soi-même

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A
2. Essayez de créer un favori pour un autre utilisateur (via SQL ou API) :
   ```sql
   INSERT INTO favorites (user_id, listing_id)
   VALUES ('user-id-d-un-autre-utilisateur', 'listing-id');
   ```
3. Cela devrait échouer avec une erreur de permissions

**Résultat attendu :** Impossible de créer un favori pour un autre utilisateur

---

### Test 5: Modification - Listings

**Objectif :** Vérifier qu'on ne peut modifier que ses propres annonces

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A
2. Identifiez une annonce qui appartient à l'utilisateur A
3. Modifiez-la via l'application
4. Cela devrait réussir
5. Connectez-vous en tant qu'utilisateur B
6. Essayez de modifier la même annonce
7. Cela devrait échouer ou ne rien modifier (RLS bloque)

**Résultat attendu :** Seul le propriétaire peut modifier son annonce

---

### Test 6: Modification - Inquiries

**Objectif :** Vérifier qu'on peut marquer comme lu ses propres messages

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A
2. Identifiez un message reçu (inquiry où `to_user_id = user_id_A`)
3. Marquez-le comme lu via l'application
4. Cela devrait réussir
5. Essayez de marquer comme lu un message où vous n'êtes ni expéditeur ni destinataire
6. Cela devrait échouer

**Résultat attendu :** On peut modifier uniquement les messages qu'on a envoyés ou reçus

---

### Test 7: Suppression - Favorites

**Objectif :** Vérifier qu'on ne peut supprimer que ses propres favoris

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A
2. Identifiez un favori de l'utilisateur A
3. Supprimez-le via l'application
4. Cela devrait réussir
5. Connectez-vous en tant qu'utilisateur B
6. Essayez de supprimer un favori de l'utilisateur A (via SQL) :
   ```sql
   DELETE FROM favorites WHERE user_id = 'user-id-A';
   ```
7. Cela devrait échouer ou ne rien supprimer (RLS bloque)

**Résultat attendu :** Seul le propriétaire peut supprimer son favori

---

### Test 8: Suppression - User Profile

**Objectif :** Vérifier qu'on ne peut supprimer que son propre profil

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A
2. Essayez de supprimer votre propre profil
3. Cela devrait réussir (⚠️ Attention : cela supprime aussi l'utilisateur dans auth.users)
4. Connectez-vous en tant qu'utilisateur B
5. Essayez de supprimer le profil de l'utilisateur A (via SQL) :
   ```sql
   DELETE FROM user_profiles WHERE id = 'user-id-A';
   ```
6. Cela devrait échouer

**Résultat attendu :** Seul le propriétaire peut supprimer son profil

---

### Test 9: Protection Administrative - system_roles

**Objectif :** Vérifier que seuls les super admins peuvent modifier les rôles système

**Étapes :**
1. Connectez-vous en tant qu'utilisateur normal (non super admin)
2. Essayez de créer un rôle système (via SQL) :
   ```sql
   INSERT INTO system_roles (name, display_name)
   VALUES ('test_role', 'Test Role');
   ```
3. Cela devrait échouer avec une erreur de permissions
4. Connectez-vous en tant que super admin
5. Essayez la même opération
6. Cela devrait réussir (si vous êtes vraiment super admin)

**Résultat attendu :** Seuls les super admins peuvent gérer les rôles système

---

### Test 10: Protection Administrative - audit_logs

**Objectif :** Vérifier que seuls les super admins peuvent supprimer les logs d'audit

**Étapes :**
1. Connectez-vous en tant qu'utilisateur normal
2. Essayez de supprimer un log d'audit (via SQL) :
   ```sql
   DELETE FROM audit_logs WHERE id = 'log-id';
   ```
3. Cela devrait échouer
4. Connectez-vous en tant que super admin
5. Essayez la même opération
6. Cela devrait réussir (si vous êtes vraiment super admin)

**Résultat attendu :** Seuls les super admins peuvent supprimer les logs d'audit

---

### Test 11: Relations Indirectes - payment_reminders

**Objectif :** Vérifier que les politiques via relations fonctionnent

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A qui gère des propriétés
2. Vérifiez que vous pouvez voir les rappels de paiement :
   ```sql
   SELECT COUNT(*) FROM payment_reminders;
   ```
3. Connectez-vous en tant qu'utilisateur B qui ne gère pas de propriétés
4. Exécutez la même requête
5. Vous devriez voir 0 résultat (ou seulement les rappels de vos propres propriétés)

**Résultat attendu :** Les politiques via relations fonctionnent correctement

---

### Test 12: Notifications en Temps Réel

**Objectif :** Vérifier que les notifications sont isolées par utilisateur

**Étapes :**
1. Connectez-vous en tant qu'utilisateur A
2. Vérifiez vos notifications :
   ```sql
   SELECT COUNT(*) FROM notifications;
   ```
3. Connectez-vous en tant qu'utilisateur B
4. Exécutez la même requête
5. Les résultats devraient être différents

**Résultat attendu :** Chaque utilisateur voit uniquement ses propres notifications

---

## 🔍 Vérification dans l'Application

### Interface Utilisateur

1. **Vérifiez les listes :**
   - "Mes annonces" ne devrait montrer que vos annonces
   - "Mes favoris" ne devrait montrer que vos favoris
   - "Mes messages" ne devrait montrer que vos messages

2. **Vérifiez les actions :**
   - Vous ne pouvez modifier que vos propres ressources
   - Vous ne pouvez supprimer que vos propres ressources
   - Les boutons d'action devraient être désactivés/cachés pour les ressources d'autres utilisateurs

3. **Vérifiez les erreurs :**
   - Si vous essayez d'accéder à une ressource d'un autre utilisateur, vous devriez voir une erreur 403 ou "Accès refusé"

### Console du Navigateur

1. Ouvrez la console (F12)
2. Surveillez les erreurs réseau
3. Si RLS bloque une requête, vous devriez voir une erreur 403 ou un message d'erreur Supabase

---

## 📊 Résultats Attendus

### ✅ Tests qui doivent réussir

- Voir uniquement ses propres données
- Créer des ressources pour soi-même
- Modifier ses propres ressources
- Supprimer ses propres ressources

### ❌ Tests qui doivent échouer

- Voir les données d'autres utilisateurs
- Créer des ressources pour d'autres utilisateurs
- Modifier les ressources d'autres utilisateurs
- Supprimer les ressources d'autres utilisateurs
- Accéder aux tables administratives sans être super admin

---

## 🐛 Dépannage

### Problème : Un utilisateur voit les données d'un autre

**Solution :**
1. Vérifiez que RLS est activé sur la table
2. Vérifiez que les politiques SELECT existent
3. Vérifiez que la clause USING est correcte
4. Vérifiez que `auth.uid()` retourne bien l'ID utilisateur

### Problème : Impossible de créer une ressource

**Solution :**
1. Vérifiez que la politique INSERT existe
2. Vérifiez que la clause WITH CHECK est correcte
3. Vérifiez que l'utilisateur est authentifié
4. Vérifiez les logs Supabase pour l'erreur exacte

### Problème : Impossible de modifier/supprimer

**Solution :**
1. Vérifiez que les politiques UPDATE/DELETE existent
2. Vérifiez que la clause USING est correcte
3. Vérifiez que l'utilisateur est propriétaire de la ressource
4. Vérifiez les logs Supabase pour l'erreur exacte

---

## 📝 Checklist de Validation

- [ ] Test 1: Isolation listings ✅
- [ ] Test 2: Isolation favorites ✅
- [ ] Test 3: Création listings ✅
- [ ] Test 4: Création favorites (bloquée pour autres) ✅
- [ ] Test 5: Modification listings ✅
- [ ] Test 6: Modification inquiries ✅
- [ ] Test 7: Suppression favorites ✅
- [ ] Test 8: Suppression user_profiles ✅
- [ ] Test 9: Protection system_roles ✅
- [ ] Test 10: Protection audit_logs ✅
- [ ] Test 11: Relations payment_reminders ✅
- [ ] Test 12: Isolation notifications ✅

---

**Date** : Décembre 2024  
**Version** : 1.0

