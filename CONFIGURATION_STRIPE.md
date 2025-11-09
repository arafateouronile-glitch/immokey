# ⚡ Configuration Stripe - Instructions Rapides

## 🎯 Ce que tu dois faire maintenant

Tu as déjà les clés Stripe, voici comment les configurer :

---

## 📝 Étape 1 : Créer le fichier `.env.local`

Crée un fichier `.env.local` à la racine du projet avec tes clés Stripe :

```bash
# Stripe - Tes clés
VITE_STRIPE_PUBLIC_KEY=pk_test_ta_cle_publique_ici
```

**⚠️ Important** :
- Si tu as des clés de **TEST** (`pk_test_...`), utilise-les pour le développement
- Si tu as des clés de **PRODUCTION** (`pk_live_...`), utilise-les uniquement en production (Vercel)

---

## 🚀 Étape 2 : Configurer la clé secrète dans Supabase

La clé **secrète** (`sk_...`) doit être configurée dans Supabase (pas dans le frontend).

### Option A : Via la ligne de commande

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter
supabase login

# Lier ton projet (remplace par ton project-ref)
supabase link --project-ref ton-project-ref

# Configurer la clé secrète Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_ta_cle_secrete_ici
```

### Option B : Via le Dashboard Supabase

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. Va dans **Settings** → **Edge Functions** → **Secrets**
4. Ajoute :
   - **Key** : `STRIPE_SECRET_KEY`
   - **Value** : `sk_test_ta_cle_secrete_ici` (ou `sk_live_...` pour production)

---

## ✅ Étape 3 : Vérifier que tout fonctionne

### 3.1 Démarrer l'application

```bash
npm run dev
```

### 3.2 Tester dans la console

Ouvre la console du navigateur (F12) et tape :

```javascript
console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
```

Tu devrais voir ta clé publique s'afficher.

### 3.3 Tester un paiement

1. Va sur `http://localhost:5173/hotellerie/inscription`
2. Remplis le formulaire
3. Choisis un pack
4. Sélectionne "Paiement par carte"
5. Utilise une carte de test Stripe :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date** : `12/25` (n'importe quelle date future)
   - **CVV** : `123`
   - **Nom** : `Test User`

Si tout fonctionne, le paiement devrait passer ! 🎉

---

## 🔒 Pour la Production (Vercel)

Quand tu seras prêt pour la production :

1. Va dans le dashboard Vercel
2. Settings → Environment Variables
3. Ajoute :
   - `VITE_STRIPE_PUBLIC_KEY` = `pk_live_ta_cle_publique_production`
4. Dans Supabase, configure aussi :
   - `STRIPE_SECRET_KEY` = `sk_live_ta_cle_secrete_production`

---

## 🐛 Si ça ne fonctionne pas

### Erreur : "Stripe n'est pas configuré"

✅ **Solution** : Vérifie que `.env.local` existe et contient `VITE_STRIPE_PUBLIC_KEY`

### Erreur : "Client secret non reçu"

✅ **Solution** : 
1. Vérifie que l'Edge Function `create-payment-intent` est déployée
2. Vérifie que `STRIPE_SECRET_KEY` est configurée dans Supabase
3. Vérifie les logs : `supabase functions logs create-payment-intent`

### L'Edge Function n'est pas déployée

✅ **Solution** : Déploie-la :

```bash
supabase functions deploy create-payment-intent
```

---

## 📋 Checklist

- [ ] Fichier `.env.local` créé avec `VITE_STRIPE_PUBLIC_KEY`
- [ ] Clé secrète configurée dans Supabase (`STRIPE_SECRET_KEY`)
- [ ] Edge Function `create-payment-intent` déployée
- [ ] Test avec une carte de test réussi
- [ ] Prêt pour la production (clés de production configurées dans Vercel)

---

**Une fois ces étapes faites, Stripe sera opérationnel ! 🚀**


