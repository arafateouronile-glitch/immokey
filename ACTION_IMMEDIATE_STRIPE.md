# 🚀 Action Immédiate : Configurer tes Clés Stripe

## ✅ État Actuel

- ✅ Code Stripe prêt (service, Edge Function, etc.)
- ✅ Package Stripe installé
- ⏳ **À faire maintenant** : Configurer tes clés

---

## 📝 3 Actions à Faire MAINTENANT

### Action 1 : Créer le fichier `.env.local` (2 minutes)

1. À la racine du projet, crée un fichier `.env.local`
2. Ajoute ta clé publique Stripe :

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_ta_cle_publique_ici
```

**Remplace** `pk_test_ta_cle_publique_ici` par ta vraie clé publique Stripe.

**💡 Où trouver ta clé ?**

- Dashboard Stripe : https://dashboard.stripe.com/test/apikeys
- C'est la clé qui commence par `pk_test_...` (ou `pk_live_...` pour production)

---

### Action 2 : Configurer la clé secrète dans Supabase (5 minutes)

#### Option A : Via le Dashboard (Plus simple)

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. **Settings** → **Edge Functions** → **Secrets**
4. Clique sur **"Add a new secret"** ou **"New secret"**
5. Remplis :
   - **Name** : `STRIPE_SECRET_KEY`
   - **Value** : `sk_test_ta_cle_secrete_ici` (ta clé secrète Stripe)
6. Clique sur **Save**

**💡 Où trouver ta clé secrète ?**

- Dashboard Stripe : https://dashboard.stripe.com/test/apikeys
- C'est la clé qui commence par `sk_test_...` (ou `sk_live_...` pour production)
- ⚠️ **Important** : C'est la clé secrète, ne la partage JAMAIS publiquement !

#### Option B : Via la ligne de commande

```bash
# 1. Se connecter à Supabase
supabase login

# 2. Lier ton projet (remplace par ton project-ref)
supabase link --project-ref ton-project-ref

# 3. Configurer la clé secrète
supabase secrets set STRIPE_SECRET_KEY=sk_test_ta_cle_secrete_ici
```

**🔍 Comment trouver ton project-ref ?**

- Dashboard Supabase → Ton projet → Settings → General
- Tu verras **Reference ID** (ex: `abcdefghijklmnop`)

---

### Action 3 : Déployer l'Edge Function (2 minutes)

```bash
# Si pas encore connecté
supabase login
supabase link --project-ref ton-project-ref

# Déployer la fonction
supabase functions deploy create-payment-intent
```

---

## ✅ Vérifier que tout fonctionne

### 1. Redémarrer l'application

```bash
npm run dev
```

### 2. Vérifier la configuration

```bash
# Exécuter le script de vérification
./scripts/verify-stripe-config.sh
```

Tu devrais voir :

- ✅ Fichier .env.local trouvé
- ✅ VITE_STRIPE_PUBLIC_KEY est configurée
- ✅ Edge Function create-payment-intent existe

### 3. Tester un paiement

1. Va sur `http://localhost:5173/hotellerie/inscription`
2. Remplis le formulaire
3. Choisis un pack (ex: Starter)
4. Sélectionne **"Paiement par carte"**
5. Utilise une **carte de test Stripe** :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date d'expiration** : `12/25` (ou n'importe quelle date future)
   - **CVV** : `123`
   - **Nom sur la carte** : `Test User`

Si tout fonctionne, tu verras "Paiement traité avec succès" ! 🎉

---

## 📋 Checklist Rapide

- [ ] **Action 1** : Fichier `.env.local` créé avec `VITE_STRIPE_PUBLIC_KEY`
- [ ] **Action 2** : Clé secrète configurée dans Supabase (`STRIPE_SECRET_KEY`)
- [ ] **Action 3** : Edge Function `create-payment-intent` déployée
- [ ] **Test** : Paiement avec carte de test réussi

---

## 🐛 Si ça ne fonctionne pas

### Erreur : "Stripe n'est pas configuré"

**Solution** :

1. Vérifie que `.env.local` existe bien à la racine du projet
2. Vérifie que `VITE_STRIPE_PUBLIC_KEY` est bien écrite (sans espaces, avec le bon nom)
3. **Redémarre** le serveur de développement : `npm run dev`

### Erreur : "Client secret non reçu"

**Solution** :

1. Vérifie que `STRIPE_SECRET_KEY` est bien dans Supabase (Settings → Edge Functions → Secrets)
2. Vérifie que l'Edge Function est déployée : `supabase functions list`
3. Si pas déployée : `supabase functions deploy create-payment-intent`

### Erreur : "STRIPE_SECRET_KEY not configured"

**Solution** :

- La clé secrète n'est pas configurée dans Supabase
- Suis l'**Action 2** ci-dessus

---

## 🎯 Résumé

**3 choses à faire** :

1. ✅ Clé publique → `.env.local` → Frontend
2. ✅ Clé secrète → Supabase Secrets → Edge Functions
3. ✅ Déployer → `supabase functions deploy create-payment-intent`

**Temps total** : ~10 minutes

---

## 📞 Besoin d'aide ?

Si tu rencontres un problème :

1. **Vérifie la configuration** : `./scripts/verify-stripe-config.sh`
2. **Vérifie les logs** : `supabase functions logs create-payment-intent`
3. **Console du navigateur** : Ouvre F12 et regarde les erreurs

---

**Une fois ces 3 actions faites, Stripe sera opérationnel ! 🚀**

Tu pourras ensuite passer aux autres TODOs (Supabase production, Vercel, etc.)

