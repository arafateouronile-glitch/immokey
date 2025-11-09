# ⚡ Configuration Rapide Stripe - 3 Étapes

## ✅ Tu as tes clés Stripe ? Parfait !

Voici les **3 étapes simples** pour les configurer :

---

## 📝 Étape 1 : Créer `.env.local`

Crée un fichier `.env.local` à la racine du projet :

```bash
# À la racine du projet (même niveau que package.json)
touch .env.local
```

Puis ajoute ta clé publique Stripe :

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_ta_cle_publique_ici
```

**💡 Astuce** :
- Si tu as `pk_test_...` → Utilise-la pour le développement
- Si tu as `pk_live_...` → Garde-la pour la production (Vercel)

---

## 🔐 Étape 2 : Configurer la clé secrète dans Supabase

Ta clé **secrète** (`sk_...`) doit aller dans Supabase, pas dans le fichier `.env.local`.

### Méthode Rapide (Dashboard Supabase) :

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. **Settings** → **Edge Functions** → **Secrets**
4. Clique sur **"Add a new secret"**
5. Ajoute :
   - **Name** : `STRIPE_SECRET_KEY`
   - **Value** : `sk_test_ta_cle_secrete_ici` (ou `sk_live_...` pour production)
6. Clique sur **Save**

### Méthode Ligne de Commande :

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter
supabase login

# Lier ton projet (remplace par ton project-ref)
supabase link --project-ref ton-project-ref

# Configurer la clé secrète
supabase secrets set STRIPE_SECRET_KEY=sk_test_ta_cle_secrete_ici
```

**🔍 Comment trouver ton project-ref ?**
- Va sur https://supabase.com/dashboard
- Sélectionne ton projet
- Va dans **Settings** → **General**
- Tu verras **Reference ID** (ex: `abcdefghijklmnop`)

---

## 🚀 Étape 3 : Déployer l'Edge Function (si pas déjà fait)

L'Edge Function existe déjà dans le code, il faut juste la déployer :

```bash
# Si tu n'es pas encore connecté
supabase login
supabase link --project-ref ton-project-ref

# Déployer la fonction
supabase functions deploy create-payment-intent
```

---

## ✅ Vérifier que ça fonctionne

### 1. Redémarrer l'application

```bash
npm run dev
```

### 2. Tester dans la console

Ouvre la console du navigateur (F12) et tape :

```javascript
console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
```

Tu devrais voir ta clé publique.

### 3. Tester un paiement

1. Va sur `http://localhost:5173/hotellerie/inscription`
2. Remplis le formulaire
3. Choisis un pack
4. Sélectionne **"Paiement par carte"**
5. Utilise une **carte de test Stripe** :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date** : `12/25` (n'importe quelle date future)
   - **CVV** : `123`
   - **Nom** : `Test User`

Si tout fonctionne, tu verras "Paiement traité avec succès" ! 🎉

---

## 🐛 Si ça ne marche pas

### "Stripe n'est pas configuré"

✅ **Solution** : Vérifie que `.env.local` existe et contient bien `VITE_STRIPE_PUBLIC_KEY`

### "Client secret non reçu"

✅ **Solution** : 
1. Vérifie que `STRIPE_SECRET_KEY` est bien dans Supabase (Settings → Edge Functions → Secrets)
2. Vérifie que l'Edge Function est déployée : `supabase functions list`
3. Si pas déployée : `supabase functions deploy create-payment-intent`

### "STRIPE_SECRET_KEY not configured"

✅ **Solution** : La clé secrète n'est pas configurée dans Supabase. Suis l'Étape 2 ci-dessus.

---

## 📋 Checklist Rapide

- [ ] Fichier `.env.local` créé avec `VITE_STRIPE_PUBLIC_KEY`
- [ ] Clé secrète configurée dans Supabase (`STRIPE_SECRET_KEY`)
- [ ] Edge Function `create-payment-intent` déployée
- [ ] Test avec carte de test réussi

---

## 🎯 Résumé

1. **Clé publique** (`pk_...`) → Fichier `.env.local` → Frontend
2. **Clé secrète** (`sk_...`) → Supabase Secrets → Edge Functions
3. **Déployer** → `supabase functions deploy create-payment-intent`

**C'est tout ! 🚀**

Une fois ces 3 étapes faites, Stripe sera opérationnel et tu pourras accepter des paiements !

---

## 📞 Besoin d'aide ?

Si tu rencontres un problème, vérifie :
1. Les logs de l'Edge Function : `supabase functions logs create-payment-intent`
2. La console du navigateur (F12)
3. Les variables d'environnement : `console.log(import.meta.env)`


