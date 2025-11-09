# 🚀 Guide Pas à Pas pour le Lancement - ImmoKey

Ce guide vous accompagne étape par étape pour lancer votre application en production.

---

## 📋 Avant de Commencer

### Vérification Initiale

Exécutez le script de vérification :

```bash
./scripts/check-launch-readiness.sh
```

Cela vous donnera un aperçu de ce qui est déjà configuré et ce qui manque.

---

## 🔴 ÉTAPE 1 : Intégration Stripe (TODOs T1.1 à T1.5)

### T1.1 : Créer un compte Stripe

1. Allez sur https://dashboard.stripe.com/register
2. Créez votre compte
3. Complétez les informations (nom, email, pays, etc.)
4. Vérifiez votre email

**⏱️ Temps estimé** : 10 minutes

### T1.2 : Obtenir les clés API de test

1. Une fois connecté à Stripe Dashboard
2. Allez dans **Developers** → **API keys**
3. Vous verrez deux clés :
   - **Publishable key** (commence par `pk_test_...`) → C'est votre `STRIPE_PUBLIC_KEY`
   - **Secret key** (commence par `sk_test_...`) → C'est votre `STRIPE_SECRET_KEY`

**⚠️ Important** : La clé secrète ne sera visible qu'une seule fois. Copiez-la immédiatement !

**⏱️ Temps estimé** : 2 minutes

### T1.3 : Installer Stripe dans le projet

Exécutez dans votre terminal :

```bash
cd /Users/arafatetoure/Documents/IMMOKEY
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

**⏱️ Temps estimé** : 1 minute

### T1.4 : Ajouter les clés dans .env.local

1. Ouvrez le fichier `.env.local` (créez-le s'il n'existe pas)
2. Ajoutez vos clés Stripe :

```env
# Stripe (Test)
STRIPE_PUBLIC_KEY=pk_test_VOTRE_CLE_PUBLIQUE
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
```

**⚠️ Ne commitez JAMAIS ce fichier sur Git !** (Il devrait déjà être dans `.gitignore`)

**⏱️ Temps estimé** : 1 minute

### T1.5 : Intégrer Stripe dans le code

✅ **BONNE NOUVELLE** : Je vais maintenant intégrer Stripe dans votre `paymentService.ts` !

**⏱️ Temps estimé** : 5 minutes (je vais le faire pour vous)

---

## 🌐 ÉTAPE 2 : Configuration Supabase Production (TODOs T2.1 à T2.4)

### T2.1 : Créer un projet Supabase de production

1. Allez sur https://supabase.com
2. Connectez-vous ou créez un compte
3. Cliquez sur **New Project**
4. Remplissez :
   - **Name** : `immokey-production` (ou autre nom)
   - **Database Password** : Choisissez un mot de passe fort
   - **Region** : Choisissez la région la plus proche (Europe pour le Togo)
   - **Pricing Plan** : Free tier pour commencer
5. Cliquez sur **Create new project**
6. Attendez que le projet soit créé (2-3 minutes)

**⏱️ Temps estimé** : 5 minutes

### T2.2 : Obtenir les clés Supabase

1. Dans votre projet Supabase, allez dans **Settings** → **API**
2. Vous verrez :
   - **Project URL** → C'est votre `VITE_SUPABASE_URL`
   - **anon public** key → C'est votre `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → C'est votre `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRET !)

3. Copiez ces valeurs dans votre `.env.local` :

```env
# Supabase Production
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET)
```

**⏱️ Temps estimé** : 2 minutes

### T2.3 : Exécuter les migrations SQL

1. Dans Supabase, allez dans **SQL Editor**
2. Ouvrez chaque fichier SQL dans l'ordre et exécutez-les :
   - `database/full_setup.sql`
   - `database/hospitality_subscriptions_schema.sql`
   - `database/real_estate_subscriptions_schema.sql`
   - `database/contact_messages_schema.sql`

3. Pour chaque fichier :
   - Copiez le contenu
   - Collez dans le SQL Editor
   - Cliquez sur **Run**

**⏱️ Temps estimé** : 15 minutes

### T2.4 : Configurer les domaines autorisés

1. Dans Supabase, allez dans **Settings** → **Authentication** → **URL Configuration**
2. Dans **Site URL**, ajoutez : `http://localhost:5173` (pour le développement)
3. Dans **Redirect URLs**, ajoutez :
   - `http://localhost:5173/**`
   - `https://immokey.tg/**` (pour la production)

**⏱️ Temps estimé** : 2 minutes

### T2.5 : Créer les buckets Storage

1. Dans Supabase, allez dans **Storage**
2. Créez les buckets suivants (cliquez sur **New bucket** pour chacun) :
   - `listing-images` (Public : ✅)
   - `establishment-images` (Public : ✅)
   - `room-images` (Public : ✅)
   - `profile-images` (Public : ✅)

**⏱️ Temps estimé** : 5 minutes

---

## 📧 ÉTAPE 3 : Configuration Services Externes (TODOs T3.1 à T3.4)

### T3.1 : Resend (Email)

1. Allez sur https://resend.com
2. Créez un compte
3. Vérifiez votre email
4. Allez dans **API Keys**
5. Créez une nouvelle clé API
6. Copiez la clé (commence par `re_...`)
7. Ajoutez dans `.env.local` :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**⏱️ Temps estimé** : 5 minutes

### T3.2 : Twilio (WhatsApp & SMS)

1. Allez sur https://twilio.com
2. Créez un compte (essai gratuit disponible)
3. Vérifiez votre numéro de téléphone
4. Allez dans **Console** → **Account** → **API Keys & Tokens**
5. Notez :
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`
6. Pour WhatsApp (optionnel) :
   - Allez dans **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Notez le numéro WhatsApp (ex: `whatsapp:+14155238886`) → `TWILIO_WHATSAPP_FROM`
7. Pour SMS :
   - Achetez un numéro dans **Phone Numbers** → **Buy a number**
   - Notez le numéro → `TWILIO_PHONE_NUMBER`
8. Ajoutez dans `.env.local` :

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_PHONE_NUMBER=+14155551234
```

**⏱️ Temps estimé** : 15 minutes

### T3.3 : Google Analytics (Optionnel)

1. Allez sur https://analytics.google.com
2. Créez un compte
3. Créez une propriété pour `immokey.tg`
4. Obtenez l'ID de mesure (format `G-XXXXXXXXXX`)
5. Ajoutez dans `.env.local` :

```env
VITE_GA_ID=G-XXXXXXXXXX
```

**⏱️ Temps estimé** : 10 minutes

### T3.4 : Sentry (Optionnel)

1. Allez sur https://sentry.io
2. Créez un compte
3. Créez un nouveau projet (choisissez React)
4. Obtenez le DSN (format `https://xxx@sentry.io/xxx`)
5. Ajoutez dans `.env.local` :

```env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

**⏱️ Temps estimé** : 10 minutes

---

## 🚀 ÉTAPE 4 : Déploiement Vercel (TODOs T4.1 à T4.2)

### T4.1 : Créer un projet Vercel

1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Cliquez sur **Add New** → **Project**
4. Importez votre repository GitHub (IMMOKEY)
5. Vercel détectera automatiquement que c'est un projet Vite/React

**⏱️ Temps estimé** : 5 minutes

### T4.2 : Configurer les variables d'environnement

1. Dans votre projet Vercel, allez dans **Settings** → **Environment Variables**
2. Ajoutez toutes les variables (une par une) :

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (Marquer comme Secret)
RESEND_API_KEY (Marquer comme Secret)
TWILIO_ACCOUNT_SID (Marquer comme Secret)
TWILIO_AUTH_TOKEN (Marquer comme Secret)
TWILIO_WHATSAPP_FROM
TWILIO_PHONE_NUMBER
STRIPE_PUBLIC_KEY
STRIPE_SECRET_KEY (Marquer comme Secret)
SITE_URL
VITE_GA_ID
VITE_SENTRY_DSN
```

3. Pour chaque variable marquée comme "Secret", cochez la case **Encrypted**

**⏱️ Temps estimé** : 10 minutes

### T4.3 : Déployer

1. Vercel déploiera automatiquement après chaque push sur GitHub
2. Ou allez dans **Deployments** → **Redeploy**
3. Attendez la fin du déploiement (2-3 minutes)
4. Vous obtiendrez une URL comme : `immokey.vercel.app`

**⏱️ Temps estimé** : 5 minutes

---

## 🧪 ÉTAPE 5 : Tests

### Tester localement

```bash
npm run dev
```

Testez toutes les fonctionnalités :
- ✅ Inscription/Connexion
- ✅ Publication d'annonce
- ✅ Recherche
- ✅ Messages
- ✅ Inscription hôtellerie
- ✅ Paiements (mode test Stripe)

### Tester en production

1. Allez sur votre URL Vercel
2. Testez les mêmes fonctionnalités
3. Vérifiez que tout fonctionne correctement

**⏱️ Temps estimé** : 1-2 heures

---

## 🎉 Félicitations !

Votre application est maintenant en ligne ! 🚀

---

## 📝 Prochaines Étapes (Optionnelles)

### Ajouter le domaine personnalisé

1. Dans Vercel, allez dans **Settings** → **Domains**
2. Ajoutez `immokey.tg`
3. Suivez les instructions DNS
4. Attendez la propagation (jusqu'à 24h)

### Déployer les Edge Functions

Voir `docs/DEPLOY_EDGE_FUNCTIONS.md`

### Ajouter Moov Money et Flooz

Voir `TODOS_LANCEMENT.md` section "Paiements Mobiles"

---

## 🆘 Besoin d'aide ?

Consultez :
- `TODOS_LANCEMENT.md` : Liste complète des TODOs
- `docs/PRODUCTION_SETUP.md` : Guide de configuration production
- `docs/DEPLOYMENT.md` : Guide de déploiement

---

**Bonne chance pour le lancement ! 🚀**

