# 📄 Configuration du bucket rental-documents

## ⚠️ Erreur actuelle

```
StorageApiError: Bucket not found
```

Le bucket `rental-documents` n'existe pas dans Supabase Storage. Suivez ce guide pour le créer.

## 🚀 Étapes de configuration

### 1. Créer le bucket

1. Ouvrez votre projet Supabase : https://supabase.com/dashboard
2. Cliquez sur **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Configurez :
   - **Name** : `rental-documents`
   - **Public bucket** : ❌ **NON** (privé pour la sécurité)
   - **File size limit** : 50 MB
5. Cliquez sur **Create bucket**

### 2. Configurer les politiques RLS

Allez dans l'onglet **Policies** du bucket et ajoutez ces politiques (voir `database/create_rental_documents_bucket.sql` pour le SQL complet).

## 📁 Structure des fichiers

```
rental-documents/
  └── {user_id}/
      ├── {timestamp}.pdf
      └── ...
```

## ✅ Vérification

Après création, testez l'upload d'un document dans l'application.
