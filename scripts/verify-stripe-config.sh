#!/bin/bash

# Script pour vérifier la configuration Stripe
# Usage: ./scripts/verify-stripe-config.sh

echo "========================================="
echo "🔍 Vérification de la configuration Stripe"
echo "========================================="

# Vérifier si .env.local existe
if [ -f .env.local ]; then
  echo "✅ Fichier .env.local trouvé"
  
  # Vérifier si VITE_STRIPE_PUBLIC_KEY est définie
  if grep -q "VITE_STRIPE_PUBLIC_KEY" .env.local; then
    STRIPE_KEY=$(grep "VITE_STRIPE_PUBLIC_KEY" .env.local | cut -d '=' -f2)
    if [ -n "$STRIPE_KEY" ] && [ "$STRIPE_KEY" != "pk_test_ta_cle_publique_ici" ] && [ "$STRIPE_KEY" != "" ]; then
      echo "✅ VITE_STRIPE_PUBLIC_KEY est configurée"
      echo "   Clé: ${STRIPE_KEY:0:20}..." # Afficher seulement les 20 premiers caractères
      
      # Vérifier si c'est une clé de test ou de production
      if [[ $STRIPE_KEY == pk_test_* ]]; then
        echo "   Type: TEST (mode développement)"
      elif [[ $STRIPE_KEY == pk_live_* ]]; then
        echo "   ⚠️  Type: PRODUCTION (attention, utilise en dev uniquement si nécessaire)"
      else
        echo "   ⚠️  Format de clé non reconnu"
      fi
    else
      echo "❌ VITE_STRIPE_PUBLIC_KEY n'est pas configurée correctement"
      echo "   Veuillez ajouter votre clé publique Stripe dans .env.local"
    fi
  else
    echo "❌ VITE_STRIPE_PUBLIC_KEY non trouvée dans .env.local"
    echo "   Ajoutez: VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_ici"
  fi
else
  echo "❌ Fichier .env.local non trouvé"
  echo "   Créez-le avec: VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_ici"
fi

echo ""

# Vérifier si Supabase CLI est installé
if command -v supabase &> /dev/null; then
  echo "✅ Supabase CLI est installé"
  
  # Vérifier si le projet est lié
  if [ -f .supabase/config.toml ]; then
    echo "✅ Projet Supabase lié"
    
    # Note: On ne peut pas vérifier les secrets directement depuis le CLI sans être authentifié
    echo "ℹ️  Pour vérifier STRIPE_SECRET_KEY, utilisez:"
    echo "   supabase secrets list"
  else
    echo "⚠️  Projet Supabase non lié"
    echo "   Exécutez: supabase link --project-ref votre-project-ref"
  fi
else
  echo "⚠️  Supabase CLI n'est pas installé"
  echo "   Installez-le avec: npm install -g supabase"
fi

echo ""

# Vérifier si l'Edge Function existe
if [ -f "supabase/functions/create-payment-intent/index.ts" ]; then
  echo "✅ Edge Function create-payment-intent existe"
else
  echo "❌ Edge Function create-payment-intent non trouvée"
fi

echo ""

# Vérifier si les packages Stripe sont installés
if [ -f "package.json" ]; then
  if grep -q "@stripe/stripe-js" package.json; then
    echo "✅ Package @stripe/stripe-js installé"
  else
    echo "❌ Package @stripe/stripe-js non installé"
    echo "   Installez-le avec: npm install @stripe/stripe-js"
  fi
fi

echo ""
echo "========================================="
echo "📋 Résumé"
echo "========================================="
echo ""
echo "Pour compléter la configuration Stripe :"
echo ""
echo "1. ✅ Clé publique dans .env.local"
echo "2. ⏳ Clé secrète dans Supabase (Settings → Edge Functions → Secrets)"
echo "3. ⏳ Edge Function déployée (supabase functions deploy create-payment-intent)"
echo ""
echo "Pour tester :"
echo "  - Utilisez une carte de test: 4242 4242 4242 4242"
echo "  - Date: 12/25, CVV: 123"
echo ""
echo "========================================="


