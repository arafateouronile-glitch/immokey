# Guide de Configuration - ImmoKey

Ce guide vous accompagne dans la configuration et le déploiement de la plateforme ImmoKey.

## 📋 Prérequis

- Node.js 18+ installé
- npm ou yarn
- Compte GitHub (pour le code)
- Compte Supabase (gratuit) : https://supabase.com
- Compte Vercel (pour le déploiement) : https://vercel.com

## 🚀 Installation Locale

### 1. Cloner le projet

```bash
git clone https://github.com/votre-compte/immokey.git
cd immokey
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

1. Créer un projet sur https://supabase.com
2. Aller dans Settings > API
3. Copier l'URL du projet et la clé Anon (public)

### 4. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditer le fichier `.env` et remplir :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
```

### 5. Initialiser la base de données

Dans votre dashboard Supabase :

**Option A : Installation propre (recommandé)**
1. Aller dans SQL Editor
2. Créer une nouvelle query
3. Copier le contenu de `/database/full_setup.sql`
4. Exécuter la query

**Option B : Si vous avez des erreurs**
1. D'abord exécuter `/database/reset.sql` (⚠️ supprime tout)
2. Puis exécuter `/database/full_setup.sql`

**En cas de problème** : Consulter `/database/TROUBLESHOOTING.md`

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible sur http://localhost:5173

## 🌐 Déploiement

### Option 1 : Vercel (Recommandé)

1. Installer Vercel CLI : `npm i -g vercel`
2. Se connecter : `vercel login`
3. Déployer : `vercel --prod`
4. Configurer les variables d'environnement dans le dashboard Vercel

### Option 2 : Netlify

1. Installer Netlify CLI : `npm i -g netlify-cli`
2. Se connecter : `netlify login`
3. Déployer : `netlify deploy --prod`
4. Configurer les variables d'environnement dans le dashboard Netlify

## 📊 Configuration Analytics

Pour activer Google Analytics :

1. Créer un compte Google Analytics
2. Récupérer l'ID de mesure (ex: G-XXXXXXXXXX)
3. Ajouter dans `.env` : `VITE_GA_ID=G-XXXXXXXXXX`

## 🔐 Configuration Email

Supabase envoie les emails de vérification automatiquement.
Personnaliser dans : Supabase Dashboard > Authentication > Email Templates

## 📱 Configuration PWA

Les icônes PWA doivent être ajoutées dans `/public/` :
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)
- `apple-touch-icon.png` (180x180 pixels)

## 🧪 Tests

```bash
# Linter
npm run lint

# Build de production
npm run build

# Preview du build
npm run preview
```

## 🐛 Dépannage

### Erreur de connexion Supabase
- Vérifier que les variables d'environnement sont correctement définies
- Vérifier que le projet Supabase est actif
- Vérifier l'URL et la clé API dans Supabase Dashboard

### Erreur de build
- Supprimer `node_modules` et `package-lock.json`
- Réinstaller : `npm install`
- Relancer : `npm run build`

### Erreur RLS (Row Level Security)
- Vérifier que les politiques RLS sont activées dans Supabase
- Vérifier que l'utilisateur est bien authentifié
- Consulter les logs dans Supabase Logs

## 📚 Documentation

- [Documentation React](https://react.dev)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com)
- [Documentation Vite](https://vitejs.dev)

## 🤝 Support

Pour toute question :
- Email : contact@immokey.tg
- GitHub Issues : https://github.com/votre-compte/immokey/issues

