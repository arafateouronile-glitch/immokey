#!/bin/bash

# 🚀 Script de Déploiement Production - ImmoKey
# Ce script automatise le déploiement des Edge Functions vers Supabase Production

set -e  # Arrêter en cas d'erreur

echo "========================================="
echo "🚀 Déploiement Production ImmoKey"
echo "========================================="
echo ""

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "   Installez-le avec: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI est installé"
echo ""

# Vérifier que l'utilisateur est connecté
if ! supabase projects list &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Supabase"
    echo "   Exécutez: supabase login"
    exit 1
fi

echo "✅ Connecté à Supabase"
echo ""

# Demander le project ref de production
read -p "📝 Entrez le Project Ref de PRODUCTION (ex: nashzxodxvfxlkywlbde): " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project Ref requis"
    exit 1
fi

echo ""
echo "🔗 Liaison avec le projet de production: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "========================================="
echo "🔐 Configuration des Secrets"
echo "========================================="
echo ""
echo "Vous allez configurer les secrets suivants :"
echo "  1. STRIPE_SECRET_KEY"
echo "  2. RESEND_API_KEY"
echo "  3. TWILIO_ACCOUNT_SID"
echo "  4. TWILIO_AUTH_TOKEN"
echo "  5. TWILIO_WHATSAPP_FROM"
echo "  6. TWILIO_PHONE_NUMBER"
echo ""

read -p "Voulez-vous configurer les secrets maintenant ? (o/n): " CONFIGURE_SECRETS

if [ "$CONFIGURE_SECRETS" = "o" ] || [ "$CONFIGURE_SECRETS" = "O" ]; then
    echo ""
    echo "--- Stripe ---"
    read -p "STRIPE_SECRET_KEY (sk_live_...): " STRIPE_SECRET_KEY
    if [ -n "$STRIPE_SECRET_KEY" ]; then
        supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
        echo "✅ STRIPE_SECRET_KEY configuré"
    fi

    echo ""
    echo "--- Resend ---"
    read -p "RESEND_API_KEY (re_...): " RESEND_API_KEY
    if [ -n "$RESEND_API_KEY" ]; then
        supabase secrets set RESEND_API_KEY="$RESEND_API_KEY"
        echo "✅ RESEND_API_KEY configuré"
    fi

    echo ""
    echo "--- Twilio ---"
    read -p "TWILIO_ACCOUNT_SID (AC...): " TWILIO_ACCOUNT_SID
    if [ -n "$TWILIO_ACCOUNT_SID" ]; then
        supabase secrets set TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID"
        echo "✅ TWILIO_ACCOUNT_SID configuré"
    fi

    read -p "TWILIO_AUTH_TOKEN: " TWILIO_AUTH_TOKEN
    if [ -n "$TWILIO_AUTH_TOKEN" ]; then
        supabase secrets set TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN"
        echo "✅ TWILIO_AUTH_TOKEN configuré"
    fi

    read -p "TWILIO_WHATSAPP_FROM (ex: whatsapp:+14155238886): " TWILIO_WHATSAPP_FROM
    if [ -n "$TWILIO_WHATSAPP_FROM" ]; then
        supabase secrets set TWILIO_WHATSAPP_FROM="$TWILIO_WHATSAPP_FROM"
        echo "✅ TWILIO_WHATSAPP_FROM configuré"
    fi

    read -p "TWILIO_PHONE_NUMBER (ex: +1234567890): " TWILIO_PHONE_NUMBER
    if [ -n "$TWILIO_PHONE_NUMBER" ]; then
        supabase secrets set TWILIO_PHONE_NUMBER="$TWILIO_PHONE_NUMBER"
        echo "✅ TWILIO_PHONE_NUMBER configuré"
    fi
else
    echo "⏭️  Configuration des secrets ignorée"
    echo "   Vous pouvez les configurer manuellement avec:"
    echo "   supabase secrets set NOM_SECRET=valeur"
fi

echo ""
echo "========================================="
echo "📦 Déploiement des Edge Functions"
echo "========================================="
echo ""

# Liste des fonctions à déployer
FUNCTIONS=(
    "create-payment-intent"
    "send-email"
    "send-whatsapp"
    "send-sms"
    "send-subscription-reminder"
    "send-inquiry-notification"
    "check-trial-expirations"
)

DEPLOYED=0
FAILED=0

for FUNCTION in "${FUNCTIONS[@]}"; do
    echo ""
    echo "📤 Déploiement de $FUNCTION..."
    
    # Vérifier si la fonction existe
    if [ ! -d "supabase/functions/$FUNCTION" ]; then
        echo "⚠️  Fonction $FUNCTION n'existe pas, ignorée"
        continue
    fi
    
    if supabase functions deploy "$FUNCTION" --no-verify-jwt; then
        echo "✅ $FUNCTION déployé avec succès"
        DEPLOYED=$((DEPLOYED + 1))
    else
        echo "❌ Échec du déploiement de $FUNCTION"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "========================================="
echo "📊 Résumé du Déploiement"
echo "========================================="
echo ""
echo "✅ Fonctions déployées : $DEPLOYED"
echo "❌ Échecs : $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 Tous les déploiements ont réussi !"
    echo ""
    echo "🔗 Vos Edge Functions sont accessibles à:"
    echo "   https://$PROJECT_REF.supabase.co/functions/v1/<function-name>"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Testez vos fonctions avec Postman ou curl"
    echo "   2. Vérifiez les logs: supabase functions logs <function-name>"
    echo "   3. Déployez votre frontend sur Vercel"
else
    echo "⚠️  Certains déploiements ont échoué"
    echo "   Vérifiez les erreurs ci-dessus et réessayez"
fi

echo ""
echo "========================================="


