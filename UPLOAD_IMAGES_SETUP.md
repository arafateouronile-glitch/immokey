# 📸 Configuration de l'Upload d'Images

## ✅ Ce qui a été implémenté

### Services
- ✅ **imageService.ts** : Service complet pour gérer l'upload d'images
  - `uploadListingImage()` : Upload d'une image
  - `uploadListingImages()` : Upload multiple
  - `deleteListingImage()` : Suppression d'une image
  - `checkStorageBucket()` : Vérification du bucket

### Composants
- ✅ **ImageUploader.tsx** : Composant d'upload avec drag & drop
  - Zone de drag & drop
  - Prévisualisation des images
  - Validation client-side (type, taille, nombre)
  - Suppression d'images avant upload
  - Interface responsive

### Pages
- ✅ **CreateListingPage** : Intégration complète
  - Upload automatique après création de l'annonce
  - Validation minimum 3 images
  - Indicateur de progression

## 🔧 Configuration Supabase Storage

### Étape 1 : Créer le bucket

1. Allez dans votre projet Supabase : https://supabase.com/dashboard
2. Cliquez sur **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Configurez :
   - **Name** : `listing-images`
   - **Public bucket** : ✅ **OUI** (pour accès public aux images)
   - Cliquez sur **Create bucket**

### Étape 2 : Configurer les politiques RLS

Cliquez sur le bucket `listing-images`, puis allez dans l'onglet **Policies**.

#### Politique 1 : Insertion (Upload)

```sql
-- Nom : "Permettre upload aux utilisateurs authentifiés"
-- Opération : INSERT
-- Target roles : authenticated

(
  bucket_id = 'listing-images'::text
)
AND
(auth.role() = 'authenticated')
```

**Note** : La vérification que l'utilisateur est propriétaire de l'annonce est faite côté application lors de la création de l'annonce. Le format de chemin utilise `{listingId}/` où `listingId` correspond à une annonce créée par l'utilisateur authentifié.

#### Politique 2 : Lecture (Public)

```sql
-- Nom : "Lecture publique des images"
-- Opération : SELECT
-- Target roles : anon, authenticated

bucket_id = 'listing-images'::text
```

#### Politique 3 : Suppression

```sql
-- Nom : "Suppression par les utilisateurs authentifiés"
-- Opération : DELETE
-- Target roles : authenticated

bucket_id = 'listing-images'::text
AND auth.role() = 'authenticated'
```

**Note** : La vérification des droits de propriétaire est faite côté application avant la suppression (le service vérifie que l'utilisateur est propriétaire de l'annonce via la table `listings`).

### Étape 3 : Vérifier le format des chemins

Le service upload utilise le format : `{listingId}/{timestamp}-{random}.{ext}`

Exemple : `550e8400-e29b-41d4-a716-446655440000/1234567890-abc123.jpg`

### Étape 4 : Tester l'upload

1. Connectez-vous à l'application
2. Allez sur **Publier une annonce**
3. Remplissez le formulaire
4. Glissez-déposez au moins 3 images
5. Publiez l'annonce

Les images seront automatiquement uploadées après la création de l'annonce.

## 🐛 Dépannage

### Erreur : "new row violates row-level security policy"

**Solution** : Vérifiez que les politiques RLS sont bien configurées pour INSERT.

### Erreur : "The resource already exists"

**Solution** : Le nom de fichier existe déjà. Le service génère des noms uniques avec timestamp + random, ce qui devrait éviter ce problème.

### Erreur : "Bucket not found"

**Solution** : 
1. Vérifiez que le bucket `listing-images` existe
2. Vérifiez le nom exact (sensible à la casse)

### Images ne s'affichent pas

**Solutions** :
1. Vérifiez que le bucket est **public**
2. Vérifiez les politiques SELECT
3. Vérifiez les URLs dans la console

### Upload très lent

**Solutions** :
1. Vérifiez la taille des images (max 5MB par défaut)
2. Compressez les images côté client si nécessaire
3. Vérifiez votre connexion internet

## 📊 Limites par défaut

- **Taille max par image** : 5MB
- **Nombre min d'images** : 3
- **Nombre max d'images** : 10
- **Formats acceptés** : JPG, PNG, GIF (images/*)

## 🔒 Sécurité

### Bonnes pratiques implémentées

✅ Validation du type de fichier (images uniquement)
✅ Validation de la taille (max 5MB)
✅ Vérification de l'authentification
✅ Vérification des droits de propriétaire pour la suppression
✅ Nettoyage si l'insertion DB échoue (rollback)
✅ Chemins organisés par listing_id

### Recommandations futures

- [ ] Compression automatique côté client
- [ ] Redimensionnement automatique
- [ ] Watermarking optionnel
- [ ] CDN pour distribution globale
- [ ] Limite de quota par utilisateur

## 📝 Notes techniques

### Structure des dossiers

```
listing-images/
  └── {listing_id}/
      ├── {timestamp}-{random}.jpg
      ├── {timestamp}-{random}.png
      └── ...
```

### Workflow d'upload

1. Utilisateur sélectionne des images → Validation client
2. Création de l'annonce → Récupération du `listing.id`
3. Upload de chaque image → Supabase Storage
4. Insertion dans `listing_images` → Base de données
5. En cas d'erreur DB → Rollback (suppression du fichier)

### Gestion des erreurs

- **Erreur Storage** : Propagation avec message explicite
- **Erreur DB** : Rollback automatique (suppression du fichier uploadé)
- **Erreur réseau** : Affichage dans l'UI avec possibilité de réessayer

## ✅ Vérification finale

Pour vérifier que tout fonctionne :

```typescript
// Dans la console du navigateur
import { checkStorageBucket } from '@/services/imageService'

checkStorageBucket().then(exists => {
  console.log('Bucket disponible:', exists)
})
```

Ou directement dans Supabase Dashboard :
1. Storage > listing-images
2. Vérifiez que des fichiers apparaissent après un upload
3. Cliquez sur un fichier pour voir l'URL publique
