# Guide : Créer un Super Administrateur

## 📋 Étapes à suivre

### Étape 1 : Trouver votre email

1. Ouvrez Supabase Dashboard → SQL Editor
2. Exécutez le script `database/list_users.sql`
3. Notez **votre email** (celui que vous utilisez pour vous connecter à l'application)

### Étape 2 : Créer le rôle super admin

1. Ouvrez le script `database/create_super_admin.sql`
2. Remplacez `'votre@email.com'` par **votre email réel** (celui noté à l'étape 1)
3. Exécutez le script dans Supabase Dashboard → SQL Editor

### Étape 3 : Vérifier

1. Exécutez la requête de vérification à la fin de `create_super_admin.sql`
2. Vous devriez voir votre email avec le rôle `super_admin`
3. Actualisez la page `/admin` dans votre application

## 🔍 Alternative : Utiliser l'ID utilisateur

Si vous préférez utiliser l'ID utilisateur (visible dans `list_users.sql`) :

1. Utilisez la **Méthode 2** dans `create_super_admin.sql`
2. Remplacez `'VOTRE_USER_ID_ICI'` par votre ID utilisateur
3. Exécutez le script

## ⚠️ Erreurs courantes

### "Aucun utilisateur trouvé avec l'email"
- Vérifiez que vous avez bien copié votre email depuis `list_users.sql`
- L'email doit être exactement identique (respectez la casse)

### "Vous devez remplacer 'votre@email.com'"
- Vous avez oublié de remplacer l'email placeholder
- Remplacez `'votre@email.com'` par votre email réel

### "Le rôle super_admin n'existe pas"
- Exécutez d'abord `database/migration_to_saas.sql` pour créer les tables nécessaires

## ✅ Succès

Si tout s'est bien passé, vous verrez :
```
✓ Rôle super_admin créé avec succès pour l'utilisateur votre@email.com
```

Vous pouvez maintenant accéder à `/admin` dans votre application !







