# 🎯 Étapes Immédiates pour Lancer ImmoKey

## 📋 Vue d'Ensemble

Tu es à **85% du lancement** ! Il reste principalement de la **configuration externe** (pas de code).

**Temps estimé** : 4-6 heures de configuration

---

## 🚀 ÉTAPE 1 : Configurer Stripe (30 min)

### 1.1. Créer/Connecter un compte Stripe

1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Inscris-toi ou connecte-toi
3. Active le **mode Test** (toggle en haut à droite)

### 1.2. Obtenir les clés API de test

1. Va dans **Developers** → **API keys**
2. Copie :
   - **Publishable key** : `pk_test_...` (commence par `pk_test_`)
   - **Secret key** : `sk_test_...` (clique sur "Reveal test key")

### 1.3. Ajouter la clé secrète dans Supabase

**Tu as 2 options :**

#### Option A : Dashboard Supabase (Recommandé)
1. Va sur [app.supabase.com](https://app.supabase.com)
2. Sélectionne ton projet : `nashzxodxvfxlkywlbde`
3. **Settings** → **Edge Functions** → **Secrets**
4. Clique sur **Add Secret** :
   - Name: `STRIPE_SECRET_KEY`
   - Value: Ta clé secrète `sk_test_...`
5. Clique sur **Save**

#### Option B : Ligne de commande
```bash
# 1. Login à Supabase (si pas déjà fait)
supabase login

# 2. Lier ton projet
supabase link --project-ref nashzxodxvfxlkywlbde

# 3. Ajouter le secret
supabase secrets set STRIPE_SECRET_KEY=sk_test_ta_cle_ici
```

### 1.4. Déployer l'Edge Function

```bash
cd /Users/arafatetoure/Documents/IMMOKEY
supabase functions deploy create-payment-intent
```

✅ **Vérification** : Tu devrais voir "Function deployed successfully"

---

## 🧪 ÉTAPE 2 : Tester le Paiement (15 min)

### 2.1. Lancer l'application

```bash
npm run dev
```

### 2.2. Tester l'inscription

1. Va sur [http://localhost:5173/hotellerie/inscription](http://localhost:5173/hotellerie/inscription)
2. Remplis le formulaire :
   - Nom complet : `Test User`
   - Email : `test@example.com`
   - Téléphone : `+22890123456`
   - Nom de l'établissement : `Hotel Test`
   - Mot de passe : `password123`
3. Choisis le pack **Starter**
4. Clique sur **Créer mon compte**
5. ✅ Tu devrais être redirigé vers le dashboard avec l'essai gratuit activé

### 2.3. Tester un paiement

1. Va sur [http://localhost:5173/hotellerie/abonnement](http://localhost:5173/hotellerie/abonnement)
2. Sélectionne un pack
3. Choisis **Carte bancaire**
4. Entre :
   - Numéro : `4242 4242 4242 4242`
   - Expiration : `12/25`
   - CVV : `123`
   - Nom : `Test User`
5. Clique sur **Activer le service**
6. ✅ Le paiement devrait être confirmé

---

## 🌍 ÉTAPE 3 : Créer le Projet de Production (1-2h)

### 3.1. Créer un nouveau projet Supabase

1. Va sur [app.supabase.com](https://app.supabase.com)
2. Clique sur **New Project**
3. Remplis :
   - **Name** : `ImmoKey Production`
   - **Database Password** : Génère un mot de passe fort et **SAUVEGARDE-LE**
   - **Region** : `Europe (Frankfurt)` ou le plus proche du Togo
4. Attends 2-3 minutes que le projet soit créé

### 3.2. Exécuter les migrations SQL

1. Va dans **SQL Editor** (dans le menu de gauche)
2. Exécute **dans cet ordre** :

#### Migration 1 : Base de données principale
```sql
-- Copie le contenu de : database/full_setup.sql
```
👉 Copie tout le contenu de `/Users/arafatetoure/Documents/IMMOKEY/database/full_setup.sql` et exécute

#### Migration 2 : Abonnements hôtellerie
```sql
-- Copie le contenu de : database/hospitality_subscriptions_schema.sql
```
👉 Copie tout le contenu de `/Users/arafatetoure/Documents/IMMOKEY/database/hospitality_subscriptions_schema.sql` et exécute

#### Migration 3 : Abonnements immobilier
```sql
-- Copie le contenu de : database/real_estate_subscriptions_schema.sql
```
👉 Copie tout le contenu de `/Users/arafatetoure/Documents/IMMOKEY/database/real_estate_subscriptions_schema.sql` et exécute

#### Migration 4 : Messages de contact
```sql
-- Copie le contenu de : database/contact_messages_schema.sql
```
👉 Copie tout le contenu de `/Users/arafatetoure/Documents/IMMOKEY/database/contact_messages_schema.sql` et exécute

#### Migration 5 : Cron jobs
```sql
-- Copie le contenu de : database/setup_cron_jobs.sql
```
👉 Copie tout le contenu de `/Users/arafatetoure/Documents/IMMOKEY/database/setup_cron_jobs.sql` et exécute

### 3.3. Créer les buckets Storage

1. Va dans **Storage** (menu de gauche)
2. Clique sur **New bucket**
3. Crée ces buckets **un par un** :
   - `listing-images` (Public)
   - `establishment-images` (Public)
   - `room-images` (Public)
   - `property-documents` (Private)
   - `user-avatars` (Public)

### 3.4. Configurer l'authentification

1. Va dans **Authentication** → **URL Configuration**
2. Ajoute ces URLs autorisées :
   - `http://localhost:5173` (développement)
   - `https://immokey.tg` (production - remplace par ton domaine)
   - `https://*.vercel.app` (preview Vercel)

### 3.5. Récupérer les clés API

1. Va dans **Settings** → **API**
2. Copie et **sauvegarde** :
   - **Project URL** : `https://ton-projet.supabase.co`
   - **anon public** : `eyJh...` (clé publique)
   - **service_role** : `eyJh...` (clé secrète - clique sur "Reveal")

---

## 📧 ÉTAPE 4 : Configurer les Services Externes (1h)

### 4.1. Resend (Emails)

1. Va sur [resend.com](https://resend.com)
2. Inscris-toi et vérifie ton email
3. Va dans **API Keys**
4. Clique sur **Create API Key**
5. Copie la clé : `re_...`

### 4.2. Twilio (WhatsApp & SMS)

1. Va sur [twilio.com](https://twilio.com)
2. Inscris-toi et vérifie ton numéro
3. Va dans **Console** → **Account Info**
4. Copie :
   - **Account SID** : `AC...`
   - **Auth Token** : (clique sur "Show" et copie)
5. Va dans **Phone Numbers** → **Manage** → **Buy a number**
6. Achète un numéro avec capacité SMS (environ $1/mois)
7. Pour WhatsApp :
   - Va dans **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Suis les instructions pour connecter ton numéro WhatsApp Business

### 4.3. Google Analytics (Optionnel)

1. Va sur [analytics.google.com](https://analytics.google.com)
2. Crée une propriété pour ton site
3. Copie le **Measurement ID** : `G-XXXXXXXXXX`

### 4.4. Sentry (Monitoring - Optionnel)

1. Va sur [sentry.io](https://sentry.io)
2. Crée un nouveau projet **JavaScript/React**
3. Copie le **DSN** : `https://xxx@sentry.io/xxx`

---

## 🚢 ÉTAPE 5 : Déployer sur Vercel (30 min)

### 5.1. Préparer le déploiement

1. Assure-toi que ton code est sur GitHub
2. Va sur [vercel.com](https://vercel.com)
3. Connecte-toi avec GitHub

### 5.2. Créer le projet Vercel

1. Clique sur **Add New...** → **Project**
2. Importe ton repository GitHub `IMMOKEY`
3. Configure :
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

### 5.3. Ajouter les variables d'environnement

Clique sur **Environment Variables** et ajoute **TOUTES** ces variables :

```env
# Supabase (PRODUCTION)
VITE_SUPABASE_URL=https://ton-projet-prod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...ton_anon_key_prod
SUPABASE_SERVICE_ROLE_KEY=eyJh...ton_service_role_key_prod

# Stripe (PRODUCTION - à obtenir plus tard)
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Resend
RESEND_API_KEY=re_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_PHONE_NUMBER=+1234567890

# Site
SITE_URL=https://immokey.tg

# Analytics (Optionnel)
VITE_GA_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 5.4. Déployer

1. Clique sur **Deploy**
2. Attends 2-3 minutes
3. ✅ Ton site est en ligne sur `https://ton-projet.vercel.app`

---

## 🎯 ÉTAPE 6 : Déployer les Edge Functions en Production

```bash
# 1. Lier le projet de production
supabase link --project-ref ton-project-ref-production

# 2. Configurer les secrets de production
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set TWILIO_ACCOUNT_SID=AC...
supabase secrets set TWILIO_AUTH_TOKEN=...
supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890

# 3. Déployer toutes les Edge Functions
supabase functions deploy create-payment-intent
supabase functions deploy send-email
supabase functions deploy send-whatsapp
supabase functions deploy send-sms
supabase functions deploy send-subscription-reminder
supabase functions deploy send-inquiry-notification
supabase functions deploy check-trial-expirations
```

---

## 🌐 ÉTAPE 7 : Configurer le Domaine (Optionnel)

### 7.1. Acheter le domaine

1. Va sur [namecheap.com](https://www.namecheap.com) ou [nic.tg](https://nic.tg) pour `.tg`
2. Achète `immokey.tg`

### 7.2. Configurer DNS dans Vercel

1. Dans Vercel, va dans **Settings** → **Domains**
2. Ajoute `immokey.tg`
3. Vercel te donnera des records DNS à ajouter
4. Va dans ton registrar de domaine
5. Ajoute les records DNS fournis par Vercel
6. Attends 24-48h pour la propagation DNS

---

## ✅ Checklist Finale

Avant de lancer publiquement :

- [ ] Stripe configuré et testé
- [ ] Projet Supabase de production créé
- [ ] Toutes les migrations SQL exécutées
- [ ] Buckets Storage créés
- [ ] Services externes configurés (Resend, Twilio)
- [ ] Déployé sur Vercel
- [ ] Edge Functions déployées
- [ ] Variables d'environnement configurées
- [ ] Tests fonctionnels effectués
- [ ] Domaine configuré (optionnel)

---

## 🚀 Lancement !

Une fois tout configuré :

1. ✅ Teste toutes les fonctionnalités sur `https://ton-projet.vercel.app`
2. ✅ Annonce le lancement sur les réseaux sociaux
3. ✅ Collecte les premiers feedbacks
4. ✅ Itère et améliore !

**Félicitations ! Tu es prêt à lancer ImmoKey ! 🎉**

---

## 📞 Support

Si tu bloques sur une étape, n'hésite pas à demander de l'aide !


