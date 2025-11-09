# 🔐 Variables d'Environnement Vercel - ImmoKey

## Variables à configurer dans Vercel

Copie-colle ces variables dans Vercel lors du déploiement.

---

## ✅ OBLIGATOIRES - Supabase

```env
VITE_SUPABASE_URL=https://rchnsvcxgzjtiqsmxidt.supabase.co
VITE_SUPABASE_ANON_KEY=[À récupérer sur Supabase Dashboard]
```

**Où trouver ces valeurs ?**
1. Va sur : https://supabase.com/dashboard/project/rchnsvcxgzjtiqsmxidt/settings/api
2. Copie `URL` (ligne "Project URL")
3. Copie `anon public` (ligne "anon key")

---

## ✅ OBLIGATOIRES - Stripe

```env
VITE_STRIPE_PUBLIC_KEY=[Ta clé publique Stripe]
```

**Où trouver cette valeur ?**
1. Va sur : https://dashboard.stripe.com/test/apikeys
2. Copie la `Publishable key` (commence par `pk_test_...`)

---

## 📧 OPTIONNELLES - Analytics & Monitoring

```env
VITE_GA_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**Ces variables peuvent être ajoutées plus tard**

---

## 🔍 Format dans Vercel

Quand tu ajoutes les variables dans Vercel :

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://rchnsvcxgzjtiqsmxidt.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_...` | Production, Preview, Development |

---

## 📝 Checklist

Avant de déployer, assure-toi d'avoir :

- [ ] URL Supabase
- [ ] Clé anon Supabase
- [ ] Clé publique Stripe
- [ ] (Optionnel) Google Analytics ID
- [ ] (Optionnel) Sentry DSN

---

## 🚀 Prochaines étapes

1. ✅ Push vers GitHub (EN COURS...)
2. ⏳ Importer le repo dans Vercel
3. ⏳ Ajouter ces variables
4. ⏳ Déployer !

---

## 🔗 Liens utiles

- **Supabase Dashboard** : https://supabase.com/dashboard/project/rchnsvcxgzjtiqsmxidt
- **Stripe Dashboard** : https://dashboard.stripe.com/test/apikeys
- **Vercel Dashboard** : https://vercel.com/dashboard

---

**Note** : Ne partage JAMAIS ces clés publiquement ou dans un commit Git !

