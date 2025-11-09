# 🚀 Configuration Stripe - Guide Rapide

## Étape 1 : Obtenir les clés Stripe

1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Clique sur **Developers** → **API keys**
3. Copie :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`, clique sur "Reveal test key")

---

## Étape 2 : Configurer la clé secrète dans Supabase

### Option A : Via le Dashboard Supabase (Recommandé)

1. Va sur [app.supabase.com](https://app.supabase.com)
2. Sélectionne ton projet
3. Va dans **Settings** → **Edge Functions** → **Secrets**
4. Ajoute un nouveau secret :
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_votre_cle_secrete_ici`
5. Clique sur **Add Secret**

### Option B : Via la CLI

```bash
# 1. Login à Supabase
supabase login

# 2. Lier ton projet (si pas déjà fait)
supabase link --project-ref ton-project-ref

# 3. Configurer le secret
supabase secrets set STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
```

---

## Étape 3 : Déployer l'Edge Function

```bash
# Déployer la fonction de paiement
supabase functions deploy create-payment-intent
```

**Sortie attendue** :
```
Deploying function create-payment-intent...
Function create-payment-intent deployed successfully.
URL: https://ton-projet.supabase.co/functions/v1/create-payment-intent
```

---

## Étape 4 : Tester le paiement

1. Lance l'app en local : `npm run dev`
2. Va sur [http://localhost:5173/hotellerie/inscription](http://localhost:5173/hotellerie/inscription)
3. Remplis le formulaire d'inscription
4. Choisis un pack (Starter, Professionnel ou Entreprise)
5. Clique sur "Créer mon compte et commencer l'essai gratuit"
6. ✅ Tu devrais être redirigé vers le dashboard avec l'essai gratuit activé

**Note** : L'essai gratuit est de 14 jours, donc le paiement n'est pas requis immédiatement. Pour tester un vrai paiement, va sur `/hotellerie/abonnement` après l'inscription.

---

## Étape 5 : Tester un paiement avec une carte de test

1. Va sur [http://localhost:5173/hotellerie/abonnement](http://localhost:5173/hotellerie/abonnement)
2. Sélectionne un pack
3. Choisis **Carte bancaire** comme moyen de paiement
4. Entre les détails de la carte de test :
   - **Numéro** : `4242 4242 4242 4242`
   - **Expiration** : `12/25` (ou n'importe quelle date future)
   - **CVV** : `123`
   - **Nom** : `Test User`
5. Clique sur **Activer le service**
6. ✅ Le paiement devrait être confirmé

---

## Cartes de Test Stripe

| Scénario | Numéro de carte | Résultat |
|----------|----------------|----------|
| Succès | `4242 4242 4242 4242` | ✅ Paiement réussi |
| Refusée | `4000 0000 0000 0002` | ❌ Carte refusée |
| Fonds insuffisants | `4000 0000 0000 9995` | ❌ Fonds insuffisants |
| 3D Secure | `4000 0027 6000 3184` | 🔒 Requiert authentification |

**Expiration** : N'importe quelle date future (ex: `12/25`, `06/30`)  
**CVV** : N'importe quel code 3 chiffres (ex: `123`, `456`)

---

## Vérifier que tout fonctionne

### 1. Vérifier le secret dans Supabase
```bash
supabase secrets list
```

**Sortie attendue** :
```
STRIPE_SECRET_KEY = sk_test_...
```

### 2. Vérifier l'Edge Function
```bash
supabase functions list
```

**Sortie attendue** :
```
NAME                    STATUS
create-payment-intent   DEPLOYED
```

### 3. Vérifier les logs en temps réel
```bash
supabase functions logs create-payment-intent --follow
```

---

## Dépannage

### Erreur : "Stripe secret key not configured"
- ✅ Vérifie que tu as bien ajouté `STRIPE_SECRET_KEY` dans Supabase
- ✅ Redéploie la fonction : `supabase functions deploy create-payment-intent`

### Erreur : "CORS policy"
- ✅ Vérifie que ton URL locale (`http://localhost:5173`) est autorisée dans Supabase (Settings → API)

### Erreur : "Payment failed"
- ✅ Vérifie les logs : `supabase functions logs create-payment-intent`
- ✅ Assure-toi d'utiliser une carte de test valide

---

## Prochaine étape

Une fois que tout fonctionne en développement :
1. ✅ Obtenir les clés de **production** Stripe (`pk_live_...`, `sk_live_...`)
2. ✅ Créer un projet Supabase de production
3. ✅ Déployer sur Vercel avec les clés de production

**Tu es prêt à tester !** 🚀


