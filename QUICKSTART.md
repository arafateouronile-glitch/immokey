# ⚡ Démarrage Rapide - ImmoKey

Guide ultra-rapide pour démarrer le projet en 5 minutes.

## 🎯 Étape 1 : Installation

```bash
# Installer les dépendances
npm install
```

## 🔑 Étape 2 : Configuration Supabase

1. Créer un compte : https://supabase.com (gratuit)
2. Créer un nouveau projet
3. Aller dans **Settings > API**
4. Copier :
   - Project URL
   - Anon public key

## ⚙️ Étape 3 : Configuration .env

Créer un fichier `.env` :

```bash
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

## 🗄️ Étape 4 : Base de données

Dans Supabase Dashboard :

1. Aller dans **SQL Editor**
2. New Query
3. Copier-coller le contenu de `database/full_setup.sql`
4. Run

⚠️ **Si erreur** : Consultez `database/TROUBLESHOOTING.md`

## 🚀 Étape 5 : Lancer

```bash
npm run dev
```

Ouvrir http://localhost:5173

## ✅ Vérification

1. ✅ Le site charge sans erreurs
2. ✅ Vous pouvez voir la page d'accueil
3. ✅ Navigation fonctionne
4. ✅ Responsive sur mobile

## 📝 Prochaines étapes

1. Tester l'inscription : `/inscription`
2. Créer une annonce : `/publier`
3. Vérifier la recherche : `/recherche`

## 🐛 Problèmes fréquents

**Erreur : "Missing Supabase environment variables"**
→ Vérifier votre fichier `.env`

**Erreur : "Failed to fetch"**
→ Vérifier que votre projet Supabase est actif

**Erreur : "relation does not exist"**
→ Exécuter le fichier `database/schema.sql`

## 📚 Documentation complète

Voir `SETUP.md` pour la configuration avancée et le déploiement.

