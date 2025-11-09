# 🌍 Phase 2 : Configuration Production

## ✅ Phase 1 Terminée
- ✅ Stripe configuré et testé en local
- ✅ Edge Function déployée
- ✅ Inscription et paiement fonctionnels

---

## 🎯 Phase 2 : Créer l'Infrastructure de Production

**Temps estimé** : 2-3 heures  
**Objectif** : Préparer tous les services pour le déploiement public

---

## 📝 ÉTAPE 1 : Créer le Projet Supabase de Production (30 min)

### 1.1. Créer un nouveau projet

1. Va sur [app.supabase.com](https://app.supabase.com)
2. Clique sur **New Project**
3. Configure :
   - **Organization** : Sélectionne ton organisation
   - **Name** : `ImmoKey Production`
   - **Database Password** : **IMPORTANT** - Génère un mot de passe fort
     - Clique sur "Generate a password"
     - **COPIE ET SAUVEGARDE CE MOT DE PASSE** (tu en auras besoin)
   - **Region** : `Europe (Frankfurt)` (le plus proche du Togo)
   - **Pricing Plan** : Free (pour commencer)
4. Clique sur **Create new project**
5. ⏳ Attends 2-3 minutes que le projet soit créé

### 1.2. Récupérer les informations du projet

Une fois le projet créé, va dans **Settings** → **API** :

**Copie et sauvegarde ces informations** :
```
Project URL: https://xxxxxxxxxx.supabase.co
Project Ref: xxxxxxxxxx
anon public: eyJhbGci...
service_role: eyJhbGci... (clique sur "Reveal" pour voir)
```

⚠️ **IMPORTANT** : Sauvegarde ces clés dans un endroit sûr (gestionnaire de mots de passe, fichier texte sécurisé)

---

## 📦 ÉTAPE 2 : Exécuter les Migrations SQL (30 min)

### 2.1. Aller dans le SQL Editor

1. Dans ton projet Supabase de production
2. Clique sur **SQL Editor** dans le menu de gauche

### 2.2. Exécuter les migrations dans cet ordre

#### Migration 1 : Base de données principale ✅

1. Copie **tout le contenu** de `/Users/arafatetoure/Documents/IMMOKEY/database/full_setup.sql`
2. Colle-le dans le SQL Editor
3. Clique sur **Run** (en bas à droite)
4. ✅ Vérifie qu'il y a un message de succès

#### Migration 2 : Abonnements hôtellerie ✅

1. Copie **tout le contenu** de `/Users/arafatetoure/Documents/IMMOKEY/database/hospitality_subscriptions_schema.sql`
2. Colle-le dans le SQL Editor
3. Clique sur **Run**
4. ✅ Vérifie le succès

#### Migration 3 : Abonnements immobilier ✅

1. Copie **tout le contenu** de `/Users/arafatetoure/Documents/IMMOKEY/database/real_estate_subscriptions_schema.sql`
2. Colle-le dans le SQL Editor
3. Clique sur **Run**
4. ✅ Vérifie le succès

#### Migration 4 : Messages de contact ✅

1. Copie **tout le contenu** de `/Users/arafatetoure/Documents/IMMOKEY/database/contact_messages_schema.sql`
2. Colle-le dans le SQL Editor
3. Clique sur **Run**
4. ✅ Vérifie le succès

#### Migration 5 : Cron jobs ✅

1. Copie **tout le contenu** de `/Users/arafatetoure/Documents/IMMOKEY/database/setup_cron_jobs.sql`
2. Colle-le dans le SQL Editor
3. Clique sur **Run**
4. ✅ Vérifie le succès

### 2.3. Vérifier les tables

1. Clique sur **Table Editor** dans le menu de gauche
2. Tu devrais voir toutes ces tables :
   - `user_profiles`
   - `listings`
   - `listing_images`
   - `favorites`
   - `inquiries`
   - `hospitality_establishments`
   - `hospitality_rooms`
   - `hospitality_bookings`
   - `hospitality_subscriptions`
   - `hospitality_payments`
   - `real_estate_services`
   - `real_estate_commissions`
   - `real_estate_transactions`
   - `contact_messages`
   - Et bien d'autres...

---

## 🗄️ ÉTAPE 3 : Créer les Buckets Storage (10 min)

### 3.1. Aller dans Storage

1. Clique sur **Storage** dans le menu de gauche

### 3.2. Créer les buckets

Crée ces **5 buckets** (un par un) :

| Nom du bucket | Public ? | Description |
|---------------|----------|-------------|
| `listing-images` | ✅ Oui | Images des annonces immobilières |
| `establishment-images` | ✅ Oui | Images des établissements hôteliers |
| `room-images` | ✅ Oui | Images des chambres |
| `property-documents` | ❌ Non | Documents privés (contrats, etc.) |
| `user-avatars` | ✅ Oui | Photos de profil des utilisateurs |

**Pour chaque bucket** :
1. Clique sur **New bucket**
2. Entre le nom
3. Coche **Public bucket** si nécessaire
4. Clique sur **Create bucket**

---

## 🔐 ÉTAPE 4 : Configurer l'Authentification (5 min)

### 4.1. Aller dans Authentication

1. Clique sur **Authentication** dans le menu de gauche
2. Clique sur **URL Configuration**

### 4.2. Ajouter les URLs autorisées

Dans **Site URL**, mets : `https://immokey.tg` (ou ton domaine)

Dans **Redirect URLs**, ajoute (ligne par ligne) :
```
http://localhost:5173
http://localhost:5173/auth/callback
https://immokey.tg
https://immokey.tg/auth/callback
https://*.vercel.app
https://*.vercel.app/auth/callback
```

Clique sur **Save**

---

## 📧 ÉTAPE 5 : Configurer les Services Externes (1h)

### 5.1. Resend (Emails) - 15 min

1. Va sur [resend.com](https://resend.com)
2. Clique sur **Sign Up** (ou **Login** si tu as déjà un compte)
3. Vérifie ton email
4. Va dans **API Keys**
5. Clique sur **Create API Key**
6. Donne un nom : `ImmoKey Production`
7. **COPIE LA CLÉ** : `re_...`
8. ✅ Sauvegarde-la

**Pour configurer un domaine personnalisé (optionnel)** :
- Va dans **Domains**
- Clique sur **Add Domain**
- Entre ton domaine (ex: `immokey.tg`)
- Ajoute les records DNS fournis
- Vérifie le domaine

### 5.2. Twilio (SMS & WhatsApp) - 30 min

#### Créer le compte
1. Va sur [twilio.com](https://twilio.com)
2. Clique sur **Sign Up**
3. Remplis le formulaire
4. Vérifie ton email et ton numéro de téléphone

#### Obtenir les clés API
1. Va dans **Console** → **Account Info**
2. **COPIE CES INFORMATIONS** :
   - **Account SID** : `AC...`
   - **Auth Token** : Clique sur "Show" et copie
3. ✅ Sauvegarde-les

#### Acheter un numéro pour SMS
1. Va dans **Phone Numbers** → **Manage** → **Buy a number**
2. Sélectionne :
   - **Country** : United States (ou un autre pays)
   - **Capabilities** : SMS
3. Choisis un numéro et clique sur **Buy**
4. **COPIE LE NUMÉRO** : `+1234567890`
5. ✅ Sauvegarde-le

#### Configurer WhatsApp (Optionnel)
1. Va dans **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Scanne le QR code avec WhatsApp
3. Envoie "join [code]" au numéro Twilio
4. Le numéro WhatsApp Sandbox est : `whatsapp:+14155238886`
5. ✅ Sauvegarde-le

**Pour WhatsApp en production** (plus tard) :
- Crée un compte WhatsApp Business
- Demande l'approbation à Twilio (peut prendre quelques jours)

### 5.3. Google Analytics - 10 min

1. Va sur [analytics.google.com](https://analytics.google.com)
2. Clique sur **Start measuring** (ou connecte-toi)
3. Crée un compte Google Analytics
4. Crée une propriété :
   - **Property name** : `ImmoKey`
   - **Reporting time zone** : `(GMT+00:00) Africa/Lome`
   - **Currency** : `West African CFA franc (XOF)`
5. Crée un flux de données Web :
   - **Website URL** : `https://immokey.tg`
   - **Stream name** : `ImmoKey Web`
6. **COPIE LE MEASUREMENT ID** : `G-XXXXXXXXXX`
7. ✅ Sauvegarde-le

### 5.4. Sentry (Monitoring - Optionnel) - 10 min

1. Va sur [sentry.io](https://sentry.io)
2. Clique sur **Get Started**
3. Crée un compte
4. Crée un nouveau projet :
   - **Platform** : React
   - **Project name** : `immokey`
5. **COPIE LE DSN** : `https://xxx@sentry.io/xxx`
6. ✅ Sauvegarde-le

---

## 🔑 ÉTAPE 6 : Obtenir les Clés Stripe de Production (15 min)

### 6.1. Activer le compte Stripe

1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Complète ton profil (informations de l'entreprise)
3. Ajoute les informations bancaires pour recevoir les paiements

### 6.2. Passer en mode Live

1. En haut à droite, passe de **Test mode** à **Live mode**
2. Active ton compte (si ce n'est pas déjà fait)

### 6.3. Obtenir les clés de production

1. Va dans **Developers** → **API keys**
2. **COPIE CES CLÉS** :
   - **Publishable key** : `pk_live_...`
   - **Secret key** : `sk_live_...` (clique sur "Reveal live key")
3. ✅ Sauvegarde-les

⚠️ **ATTENTION** : Les clés `sk_live_...` sont secrètes et doivent être bien protégées !

---

## 📋 Récapitulatif des Clés Obtenues

À ce stade, tu devrais avoir **toutes ces clés** :

### Supabase Production
```
Project URL: https://xxxxxxxxxx.supabase.co
Project Ref: xxxxxxxxxx
anon public: eyJhbGci...
service_role: eyJhbGci...
Database Password: [ton mot de passe généré]
```

### Stripe Production
```
VITE_STRIPE_PUBLIC_KEY: pk_live_...
STRIPE_SECRET_KEY: sk_live_...
```

### Resend
```
RESEND_API_KEY: re_...
```

### Twilio
```
TWILIO_ACCOUNT_SID: AC...
TWILIO_AUTH_TOKEN: [ton token]
TWILIO_PHONE_NUMBER: +1234567890
TWILIO_WHATSAPP_FROM: whatsapp:+14155238886
```

### Google Analytics (Optionnel)
```
VITE_GA_ID: G-XXXXXXXXXX
```

### Sentry (Optionnel)
```
VITE_SENTRY_DSN: https://xxx@sentry.io/xxx
```

---

## ✅ Checklist Phase 2

- [ ] Projet Supabase de production créé
- [ ] Clés API Supabase récupérées et sauvegardées
- [ ] Migration 1 : `full_setup.sql` exécutée
- [ ] Migration 2 : `hospitality_subscriptions_schema.sql` exécutée
- [ ] Migration 3 : `real_estate_subscriptions_schema.sql` exécutée
- [ ] Migration 4 : `contact_messages_schema.sql` exécutée
- [ ] Migration 5 : `setup_cron_jobs.sql` exécutée
- [ ] 5 buckets Storage créés
- [ ] URLs d'authentification configurées
- [ ] Compte Resend créé et clé API obtenue
- [ ] Compte Twilio créé et clés API obtenues
- [ ] Numéro Twilio acheté
- [ ] WhatsApp Sandbox configuré (optionnel)
- [ ] Google Analytics configuré et Measurement ID obtenu
- [ ] Sentry configuré et DSN obtenu (optionnel)
- [ ] Clés Stripe de production obtenues

---

## 🎯 Prochaine Étape

Une fois que tu as **toutes les clés** ci-dessus, tu es prêt pour la **Phase 3 : Déploiement** !

👉 Continue avec le fichier **`PHASE_3_DEPLOIEMENT.md`**

---

**Tu progresses bien ! Encore 1-2 heures et l'app sera en ligne ! 🚀**


