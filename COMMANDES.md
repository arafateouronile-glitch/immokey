# 📋 Commandes Utiles - ImmoKey

## 🚀 Développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview

# Linter le code
npm run lint

# Formater le code
npm run format
```

## 🗄️ Base de données

```bash
# Dans Supabase Dashboard > SQL Editor
# Copier-coller le contenu de :
database/schema.sql

# Pour réinitialiser (ATTENTION : supprime toutes les données)
# Exécuter schema.sql dans l'ordre :
# 1. DROP TABLE IF EXISTS ...
# 2. Recréer les tables
```

## 🔧 Git

```bash
# Initialiser Git
git init

# Première sauvegarde
git add .
git commit -m "Initial commit - MVP ImmoKey"

# Créer une branche
git checkout -b feature/nom-fonctionnalite

# Pousser vers GitHub
git remote add origin https://github.com/votre-compte/immokey.git
git push -u origin main
```

## 📦 Déploiement

### Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod

# Configurer variables d'environnement
# Dans Vercel Dashboard > Settings > Environment Variables
```

### Supabase

```bash
# CLI Supabase (optionnel)
npm install -g supabase

# Login
supabase login

# Initialize
supabase init

# Link project
supabase link --project-ref votre-project-ref

# Deploy migrations
supabase db push
```

## 🧹 Nettoyage

```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install

# Nettoyer build
rm -rf dist .vercel

# Nettoyer cache
npm cache clean --force
```

## 🔍 Debugging

```bash
# Voir les logs Supabase
# Dans Supabase Dashboard > Logs > Auth / Database

# Voir les erreurs navigateur
# F12 > Console

# Vérifier les variables d'environnement
# console.log(import.meta.env)
```

## 📊 Analytics

```bash
# Vercel Analytics (automatique si configuré)

# Google Analytics
# Ajouter dans .env:
VITE_GA_ID=G-XXXXXXXXXX

# Dans src/main.tsx, ajouter :
import { useEffect } from 'react'

useEffect(() => {
  if (import.meta.env.VITE_GA_ID) {
    // Initialiser GA
  }
}, [])
```

## 🧪 Tests

```bash
# Installer Vitest (si ajouté)
npm install -D vitest @vitest/ui

# Lancer tests
npm run test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🚨 Urgence

```bash
# Revenir à un état propre
git stash
git clean -fd
npm install
npm run dev

# Vérifier l'état du projet
npm run lint
npm run build
```

## 📝 Scripts package.json

Les scripts disponibles dans `package.json` :

```json
{
  "dev": "Lance le serveur de dev (port 5173)",
  "build": "Crée le build de production",
  "preview": "Prévisualise le build",
  "lint": "Vérifie le code avec ESLint",
  "format": "Formate le code avec Prettier"
}
```

## 🔗 Liens utiles

- **Supabase Dashboard** : https://app.supabase.com
- **Vercel Dashboard** : https://vercel.com/dashboard
- **Localhost** : http://localhost:5173
- **Docs Supabase** : https://supabase.com/docs
- **Docs React** : https://react.dev

## 💡 Astuces

```bash
# Mode développement verbose
DEBUG=* npm run dev

# Build avec analyse
npm run build -- --analyze

# Vérifier la taille du bundle
npm run build && du -sh dist/

# Type checking strict
npx tsc --noEmit
```






