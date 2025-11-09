# 🔐 Intégration Stripe - Guide Complet

## ✅ Ce qui est déjà fait

- ✅ Package Stripe installé (`@stripe/stripe-js` et `stripe`)
- ✅ Service de paiement créé (`src/services/hospitality/paymentService.ts`)
- ✅ Configuration Stripe frontend (`src/lib/stripe.ts`)
- ✅ Interface de paiement créée

## 📝 Étapes pour configurer Stripe

### 1. Configurer les variables d'environnement

#### Pour le développement (`.env.local`)

Créez un fichier `.env.local` à la racine du projet :

```bash
# Stripe - Clés de TEST (pour développement)
VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique_test_ici
```

**Important** :
- ⚠️ Utilisez les clés de **TEST** (`pk_test_...`) pour le développement
- ⚠️ Ne commitez **JAMAIS** le fichier `.env.local` (déjà dans `.gitignore`)

#### Pour la production (Vercel)

Dans le dashboard Vercel :
1. Allez dans votre projet → Settings → Environment Variables
2. Ajoutez :
   - `VITE_STRIPE_PUBLIC_KEY` = `pk_live_votre_cle_publique_production`
   - `STRIPE_SECRET_KEY` = `sk_live_votre_cle_secrete_production` (pour les Edge Functions)

---

### 2. Créer l'Edge Function pour Stripe

Le code utilise une Edge Function `create-payment-intent` qui n'existe pas encore. Il faut la créer.

**Fichier** : `supabase/functions/create-payment-intent/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer la clé secrète Stripe depuis les secrets Supabase
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Récupérer les données de la requête
    const { amount, currency = 'xof', userId, planType, metadata = {} } = await req.json()

    // Valider les données
    if (!amount || !userId || !planType) {
      throw new Error('Missing required fields: amount, userId, planType')
    }

    // Créer le Payment Intent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes (XOF = centimes)
      currency: currency.toLowerCase(),
      metadata: {
        userId,
        planType,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
```

**Fichier** : `supabase/functions/create-payment-intent/deno.json`

```json
{
  "imports": {
    "stripe": "https://esm.sh/stripe@14.21.0?target=deno"
  }
}
```

---

### 3. Déployer l'Edge Function

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier votre projet
supabase link --project-ref votre-project-ref

# Déployer la fonction
supabase functions deploy create-payment-intent

# Configurer le secret Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_test_ici
```

**Pour la production** :
```bash
# Déployer avec la clé de production
supabase secrets set STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_production
```

---

### 4. Tester l'intégration

#### Test avec des cartes Stripe

Stripe fournit des cartes de test :

**Carte de test qui fonctionne** :
- Numéro : `4242 4242 4242 4242`
- Date d'expiration : n'importe quelle date future (ex: `12/25`)
- CVV : n'importe quel 3 chiffres (ex: `123`)
- Nom : n'importe quel nom

**Carte qui échoue** :
- Numéro : `4000 0000 0000 0002`

#### Tester dans l'application

1. Démarrer l'application : `npm run dev`
2. Aller sur `/hotellerie/inscription`
3. Remplir le formulaire
4. Choisir un pack
5. Sélectionner "Paiement par carte"
6. Utiliser une carte de test
7. Vérifier que le paiement passe

---

### 5. Vérifier la configuration

#### Frontend

Vérifiez que `VITE_STRIPE_PUBLIC_KEY` est bien chargée :

```typescript
// Dans la console du navigateur
console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
```

#### Edge Function

Vérifiez que la fonction est déployée :

```bash
supabase functions list
```

Vous devriez voir `create-payment-intent` dans la liste.

---

## 🔒 Sécurité

### ⚠️ Important

1. **Ne jamais exposer la clé secrète** (`sk_...`) dans le frontend
   - ✅ Clé publique (`pk_...`) → Frontend (OK)
   - ❌ Clé secrète (`sk_...`) → Edge Functions uniquement (OK)

2. **Utiliser des clés différentes** pour test et production
   - Test : `pk_test_...` et `sk_test_...`
   - Production : `pk_live_...` et `sk_live_...`

3. **Vérifier les webhooks Stripe** (pour plus tard)
   - Configurer les webhooks pour confirmer les paiements
   - URL : `https://votre-projet.supabase.co/functions/v1/stripe-webhook`

---

## 🐛 Dépannage

### Erreur : "Stripe n'est pas configuré"

**Solution** : Vérifiez que `VITE_STRIPE_PUBLIC_KEY` est bien définie dans `.env.local`

### Erreur : "Client secret non reçu de Stripe"

**Solution** : 
1. Vérifiez que l'Edge Function `create-payment-intent` est déployée
2. Vérifiez que `STRIPE_SECRET_KEY` est configurée dans Supabase
3. Vérifiez les logs de l'Edge Function : `supabase functions logs create-payment-intent`

### Erreur : "Payment Intent not found"

**Solution** : Vérifiez que vous utilisez la bonne clé secrète (test ou production)

---

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe + Supabase](https://supabase.com/docs/guides/payments/stripe)

---

## ✅ Checklist

- [ ] Clés Stripe obtenues (test et production)
- [ ] Fichier `.env.local` créé avec `VITE_STRIPE_PUBLIC_KEY`
- [ ] Edge Function `create-payment-intent` créée
- [ ] Edge Function déployée sur Supabase
- [ ] Secret `STRIPE_SECRET_KEY` configuré dans Supabase
- [ ] Test avec une carte de test réussi
- [ ] Variables d'environnement configurées dans Vercel (production)

---

**Une fois tout configuré, Stripe sera opérationnel ! 🎉**


