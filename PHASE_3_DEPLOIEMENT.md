# 🚀 Phase 3 : Déploiement sur Vercel

## ✅ Phases Précédentes Terminées

- ✅ Phase 1 : Tests en local
- ✅ Phase 2 : Configuration production

---

## 🎯 Phase 3 : Mettre l'Application en Ligne

**Temps estimé** : 1-2 heures  
**Objectif** : Déployer ImmoKey sur Vercel et le rendre accessible au public

---

## 📝 ÉTAPE 1 : Préparer le Repository GitHub (10 min)

### 1.1. Vérifier que ton code est sur GitHub

```bash
cd /Users/arafatetoure/Documents/IMMOKEY

# Vérifier le statut
git status

# Si des fichiers ne sont pas commités
git add .
git commit -m "Préparation pour le déploiement production"
git push origin main
```

### 1.2. Créer un fichier `.env.production` (pour référence)

Crée un fichier `.env.production.example` avec toutes les variables requises (sans les vraies valeurs) :

```env
# Supabase Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe Production
VITE_STRIPE_PUBLIC_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key

# Resend (Emails)
RESEND_API_KEY=re_your_key

# Twilio (SMS & WhatsApp)
TWILIO_ACCOUNT_SID=AC_your_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_PHONE_NUMBER=+1234567890

# Site
SITE_URL=https://immokey.tg

# Analytics (Optionnel)
VITE_GA_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Commit ce fichier** :

```bash
git add .env.production.example
git commit -m "Ajout exemple variables d'environnement production"
git push
```

⚠️ **NE JAMAIS commiter les vraies clés !**

---

## 🚢 ÉTAPE 2 : Créer le Projet Vercel (15 min)

### 2.1. Aller sur Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Clique sur **Sign Up** (ou **Log In** si tu as déjà un compte)
3. Connecte-toi avec **GitHub**

### 2.2. Importer le projet

1. Clique sur **Add New...** → **Project**
2. Sélectionne ton repository **IMMOKEY**
3. Clique sur **Import**

### 2.3. Configurer le projet

**Framework Preset** : Vite (détecté automatiquement)

**Build Settings** :

- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

**Root Directory** : `.` (laisser vide)

**⚠️ NE CLIQUE PAS ENCORE SUR "DEPLOY" !**

---

## 🔑 ÉTAPE 3 : Configurer les Variables d'Environnement (20 min)

### 3.1. Ajouter les variables d'environnement

1. Scroll vers le bas jusqu'à **Environment Variables**
2. Ajoute **TOUTES** ces variables **UNE PAR UNE** :

#### Supabase (Production)

```
Name: VITE_SUPABASE_URL
Value: https://[ton-project-ref].supabase.co
Environment: Production, Preview, Development
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGci... [ta clé anon]
Environment: Production, Preview, Development
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGci... [ta clé service_role]
Environment: Production (seulement Production!)
```

#### Stripe (Production)

```
Name: VITE_STRIPE_PUBLIC_KEY
Value: pk_live_... [ta clé publique]
Environment: Production, Preview, Development
```

```
Name: STRIPE_SECRET_KEY
Value: sk_live_... [ta clé secrète]
Environment: Production (seulement Production!)
```

#### Resend (Emails)

```
Name: RESEND_API_KEY
Value: re_... [ta clé Resend]
Environment: Production (seulement Production!)
```

#### Twilio (SMS & WhatsApp)

```
Name: TWILIO_ACCOUNT_SID
Value: AC... [ton SID]
Environment: Production (seulement Production!)
```

```
Name: TWILIO_AUTH_TOKEN
Value: [ton token]
Environment: Production (seulement Production!)
```

```
Name: TWILIO_WHATSAPP_FROM
Value: whatsapp:+14155238886
Environment: Production, Preview, Development
```

```
Name: TWILIO_PHONE_NUMBER
Value: +1234567890 [ton numéro Twilio]
Environment: Production, Preview, Development
```

#### Site

```
Name: SITE_URL
Value: https://immokey-[random].vercel.app (tu l'auras après le déploiement)
Environment: Production, Preview, Development
```

#### Analytics (Optionnel)

```
Name: VITE_GA_ID
Value: G-XXXXXXXXXX [ton ID Google Analytics]
Environment: Production, Preview, Development
```

```
Name: VITE_SENTRY_DSN
Value: https://xxx@sentry.io/xxx [ton DSN Sentry]
Environment: Production, Preview, Development
```

### 3.2. Vérifier les variables

Assure-toi que :

- ✅ Toutes les variables commençant par `VITE_` sont cochées pour tous les environnements
- ✅ Les clés secrètes (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) sont **SEULEMENT** pour Production

---

## 🚀 ÉTAPE 4 : Déployer ! (5 min)

### 4.1. Lancer le déploiement

1. Clique sur **Deploy**
2. ⏳ Attends 2-3 minutes

### 4.2. Vérifier le déploiement

Tu devrais voir :

```
Building...
✓ Build completed
✓ Deployment completed
```

### 4.3. Récupérer l'URL

1. Copie l'URL : `https://immokey-[random].vercel.app`
2. Retourne dans **Settings** → **Environment Variables**
3. Modifie `SITE_URL` avec la vraie URL
4. Redéploie (Vercel le fait automatiquement)

---

## 🔧 ÉTAPE 5 : Déployer les Edge Functions (30 min)

### 5.1. Configurer les secrets Supabase Production

```bash
cd /Users/arafatetoure/Documents/IMMOKEY

# 1. Login à Supabase (si pas déjà fait)
supabase login

# 2. Lier le projet de PRODUCTION
supabase link --project-ref [ton-project-ref-production]

# 3. Configurer TOUS les secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set TWILIO_ACCOUNT_SID=AC...
supabase secrets set TWILIO_AUTH_TOKEN=...
supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

### 5.2. Déployer avec le script automatique

```bash
# Rendre le script exécutable (si pas déjà fait)
chmod +x deploy-production.sh

# Exécuter le script
./deploy-production.sh
```

Le script va :

1. Vérifier Supabase CLI
2. Te demander ton Project Ref
3. Lier le projet
4. Déployer toutes les Edge Functions

**OU manuellement** :

```bash
# Déployer chaque fonction une par une
supabase functions deploy create-payment-intent
supabase functions deploy send-email
supabase functions deploy send-whatsapp
supabase functions deploy send-sms
supabase functions deploy send-subscription-reminder
supabase functions deploy send-inquiry-notification
supabase functions deploy check-trial-expirations
```

### 5.3. Vérifier les Edge Functions

```bash
# Lister les fonctions déployées
supabase functions list
```

Tu devrais voir :

```
NAME                           STATUS
create-payment-intent          DEPLOYED
send-email                     DEPLOYED
send-whatsapp                  DEPLOYED
send-sms                       DEPLOYED
send-subscription-reminder     DEPLOYED
send-inquiry-notification      DEPLOYED
check-trial-expirations        DEPLOYED
```

---

## 🧪 ÉTAPE 6 : Tests en Production (20 min)

### 6.1. Tester la homepage

1. Va sur ton URL Vercel : `https://immokey-[random].vercel.app`
2. ✅ La page d'accueil doit charger correctement
3. ✅ Pas d'erreurs dans la console

### 6.2. Tester l'inscription hospitality

1. Va sur `/hotellerie/inscription`
2. Remplis le formulaire avec de vraies données
3. Crée un compte
4. ✅ Tu devrais recevoir un email de bienvenue (via Resend)
5. ✅ Tu devrais être redirigé vers le dashboard
6. ✅ L'essai gratuit de 14 jours doit être activé

### 6.3. Tester un paiement

⚠️ **ATTENTION** : Tu es maintenant en **VRAI** mode production avec de vraies cartes !

**Pour tester SANS dépenser d'argent** :

1. Va sur Stripe Dashboard
2. Passe en **Test mode** (temporairement)
3. Utilise une carte de test : `4242 4242 4242 4242`

**Pour tester en VRAI** (petit montant) :

1. Va sur `/hotellerie/abonnement`
2. Choisis le pack Starter (9900 FCFA)
3. Entre les détails d'une vraie carte
4. Confirme le paiement
5. ✅ Le paiement doit être traité par Stripe

### 6.4. Tester la publication d'annonces

1. Va sur `/publier`
2. Crée une nouvelle annonce immobilière
3. Ajoute des images
4. Publie
5. ✅ L'annonce doit apparaître sur `/recherche`

### 6.5. Tester les notifications

1. Envoie un message à un propriétaire
2. ✅ Le propriétaire doit recevoir :
   - Un email (via Resend)
   - Un SMS (via Twilio)
   - Une notification WhatsApp (via Twilio)

### 6.6. Vérifier les logs

```bash
# Voir les logs des Edge Functions
supabase functions logs create-payment-intent --follow
supabase functions logs send-email --follow
```

---

## 🌐 ÉTAPE 7 : Configurer le Domaine (Optionnel - 1h + 24-48h)

### 7.1. Acheter le domaine

1. Va sur [nic.tg](https://nic.tg) pour un domaine `.tg`
2. Ou [namecheap.com](https://namecheap.com) pour d'autres extensions
3. Achète `immokey.tg`

### 7.2. Ajouter le domaine dans Vercel

1. Dans Vercel, va dans **Settings** → **Domains**
2. Clique sur **Add**
3. Entre `immokey.tg`
4. Clique sur **Add**

### 7.3. Configurer DNS

Vercel va te donner des records DNS à ajouter. Généralement :

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

1. Va dans ton registrar de domaine
2. Ajoute ces records DNS
3. ⏳ Attends 24-48h pour la propagation DNS

### 7.4. Forcer HTTPS

1. Dans Vercel → **Settings** → **Domains**
2. Coche **Force HTTPS**

### 7.5. Mettre à jour Supabase

1. Va dans Supabase → **Authentication** → **URL Configuration**
2. Ajoute :
   ```
   https://immokey.tg
   https://immokey.tg/auth/callback
   ```

---

## ✅ Checklist Finale

### Déploiement

- [ ] Code poussé sur GitHub
- [ ] Projet Vercel créé et lié
- [ ] Toutes les variables d'environnement ajoutées
- [ ] Application déployée avec succès (build vert)
- [ ] URL Vercel accessible

### Edge Functions

- [ ] Secrets Supabase configurés
- [ ] 7 Edge Functions déployées
- [ ] Fonctions listées avec `supabase functions list`

### Tests en Production

- [ ] Homepage charge sans erreur
- [ ] Inscription hospitality fonctionne
- [ ] Email de bienvenue reçu
- [ ] Dashboard accessible après inscription
- [ ] Paiement Stripe fonctionne (test ou réel)
- [ ] Publication d'annonce fonctionne
- [ ] Upload d'images fonctionne
- [ ] Notifications (email, SMS, WhatsApp) fonctionnent
- [ ] Pas d'erreurs dans la console
- [ ] Logs Edge Functions propres

### Domaine (Optionnel)

- [ ] Domaine acheté
- [ ] Records DNS ajoutés
- [ ] Domaine ajouté dans Vercel
- [ ] HTTPS forcé
- [ ] URLs mises à jour dans Supabase

### Responsive

- [ ] Testé sur mobile
- [ ] Testé sur tablette
- [ ] Testé sur desktop

---

## 🎉 FÉLICITATIONS !

Si tous les tests passent, **ton application est EN LIGNE** ! 🚀

### Prochaines étapes

1. **Surveiller les logs** pendant les premières 24h

   ```bash
   # Logs Vercel (dans le dashboard)
   # Logs Edge Functions
   supabase functions logs <function-name> --follow
   ```

2. **Annoncer le lancement** 📣
   - Réseaux sociaux
   - Groupes WhatsApp
   - Forums togolais
   - Presse locale

3. **Collecter les feedbacks** 💬
   - Créer un formulaire de feedback
   - Surveiller les erreurs dans Sentry
   - Lire les messages des utilisateurs

4. **Itérer et améliorer** 🔄
   - Corriger les bugs remontés
   - Ajouter les fonctionnalités demandées
   - Optimiser les performances

5. **Intégrer Moov Money et Flooz** 💳
   - Contacter Moov Togo : [moov.africa.tg](https://moov.africa.tg)
   - Contacter Flooz Togo
   - Intégrer leurs APIs

---

## 📊 Métriques à Surveiller

### Supabase

- Nombre d'utilisateurs inscrits
- Nombre de requêtes API
- Utilisation du Storage
- Erreurs de base de données

### Vercel

- Nombre de visiteurs
- Temps de chargement
- Erreurs de build
- Utilisation de la bande passante

### Stripe

- Nombre de paiements
- Montant total des transactions
- Taux d'échec des paiements

### Google Analytics

- Pages vues
- Utilisateurs actifs
- Taux de conversion
- Parcours utilisateur

---

## 🆘 Dépannage Post-Déploiement

### "Build failed" sur Vercel

```bash
# Tester le build en local
npm run build

# Vérifier les erreurs TypeScript
npm run type-check
```

### "Function not found"

```bash
# Redéployer la fonction
supabase functions deploy <function-name>

# Vérifier les logs
supabase functions logs <function-name>
```

### "Unauthorized" sur les requêtes

- ✅ Vérifier les clés API dans Vercel
- ✅ Vérifier les RLS policies dans Supabase
- ✅ Vérifier les URLs autorisées dans Supabase Auth

### Les emails ne sont pas envoyés

- ✅ Vérifier `RESEND_API_KEY` dans les secrets Supabase
- ✅ Vérifier les logs de l'Edge Function `send-email`
- ✅ Vérifier que le domaine est vérifié dans Resend

---

## 📞 Support

Si tu bloques, vérifie :

1. Les logs Vercel
2. Les logs Edge Functions
3. La console du navigateur
4. Les erreurs Sentry (si configuré)

**Tu as réussi ! ImmoKey est maintenant LIVE ! 🎊**
