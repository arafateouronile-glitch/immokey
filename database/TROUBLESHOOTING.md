# 🔧 Résolution des Problèmes SQL - ImmoKey

## ❌ Erreur : "syntax error at or near 'order'"

**Cause** : Le mot "order" est réservé en SQL et ne peut pas être utilisé comme nom de colonne sans guillemets.

**Solution** : Le fichier `schema.sql` utilise déjà `sort_order` au lieu de `order`.

Si vous avez cette erreur, c'est que vous avez peut-être une ancienne version ou des tables existantes.

### Option 1 : Réinitialiser complètement (Recommandé pour développement)

1. Aller dans **Supabase Dashboard > SQL Editor**
2. Exécuter `reset.sql` puis `full_setup.sql`

**OU** copier-coller simplement ce qui suit :

```sql
-- Supprimer et recréer proprement
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Puis exécuter full_setup.sql
```

### Option 2 : Vérifier vos tables existantes

Vérifier si vous avez la colonne `order` :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listing_images';
```

Si vous voyez `order`, vous devez supprimer et recréer les tables.

## ❌ Erreur : "relation already exists"

**Cause** : Les tables existent déjà.

**Solution** :

```sql
-- Option A : Supprimer et recréer (perd les données)
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS listing_images CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Puis exécuter schema.sql

-- Option B : Supprimer toute la base
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## ❌ Erreur : "permission denied for schema public"

**Cause** : Problème de permissions.

**Solution** :

```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## ❌ Erreur : "trigger already exists"

**Cause** : Le trigger existe déjà.

**Solution** :

```sql
-- Supprimer d'abord
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Puis créer
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

## ❌ Erreur : "policy already exists"

**Cause** : La politique RLS existe déjà.

**Solution** :

```sql
-- Supprimer toutes les politiques d'abord
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
-- Répéter pour toutes les politiques

-- Ou désactiver RLS complètement
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Puis recréer en exécutant schema.sql
```

## ✅ Installation propre recommandée

Pour une installation propre sans conflits :

```bash
# Dans Supabase Dashboard > SQL Editor
# 1. Exécuter reset.sql (supprime tout)
# 2. Exécuter full_setup.sql (crée tout)
```

## 🔍 Vérifier l'installation

Vérifier que tout est bien installé :

```sql
-- Vérifier les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Devrait afficher :
-- favorites
-- inquiries
-- listing_images
-- listings
-- user_profiles

-- Vérifier les politiques RLS
SELECT tablename, policyname 
FROM pg_policies 
ORDER BY tablename, policyname;

-- Vérifier les triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## 🆘 Besoin d'aide ?

Si vous avez toujours des problèmes :

1. **Vérifier les logs** : Supabase Dashboard > Logs
2. **Nettoyer complètement** : DROP SCHEMA public CASCADE;
3. **Réinstaller** : Exécuter full_setup.sql
4. **Vérifier la version** : Assurez-vous d'utiliser le bon fichier

## 📝 Fichiers SQL disponibles

- **schema.sql** : Schéma de base (peut avoir des conflits)
- **full_setup.sql** : Installation complète tout-en-un
- **reset.sql** : Script de nettoyage avant installation

## ⚠️ ATTENTION

⚠️ Les scripts de réinitialisation **SUPPRIMENT TOUTES LES DONNÉES** !

Ne les exécutez que :
- En développement
- Sur un environnement de test
- Si vous êtes sûr de vouloir tout supprimer

En production, préférez des migrations SQL incrémentales.






