#!/bin/bash

# Fichier: scripts/check-launch-readiness.sh
# Description: Script pour vérifier l'état de préparation au lancement
# Usage: ./scripts/check-launch-readiness.sh

echo "========================================="
echo "🚀 Vérification de Préparation au Lancement - ImmoKey"
echo "========================================="

ERRORS=0
WARNINGS=0

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour vérifier un élément
check_item() {
    local name=$1
    local condition=$2
    local status=$3
    
    if eval "$condition"; then
        echo -e "${GREEN}✅${NC} $name"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️${NC} $name (optionnel)"
        ((WARNINGS++))
    else
        echo -e "${RED}❌${NC} $name"
        ((ERRORS++))
    fi
}

echo -e "\n--- 1. Vérification des fichiers essentiels ---"
check_item "Fichier .env.local existe" "[ -f .env.local ]" "error"
check_item "Fichier vite.config.ts existe" "[ -f vite.config.ts ]" "error"
check_item "Fichier package.json existe" "[ -f package.json ]" "error"

echo -e "\n--- 2. Vérification des dépendances ---"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} node_modules installé"
else
    echo -e "${RED}❌${NC} node_modules non installé (exécutez: npm install)"
    ((ERRORS++))
fi

echo -e "\n--- 3. Vérification des services ---"
check_item "Service paymentService.ts existe" "[ -f src/services/hospitality/paymentService.ts ]" "error"
check_item "Service inquiryService.ts existe" "[ -f src/services/inquiryService.ts ]" "error"

echo -e "\n--- 4. Vérification des variables d'environnement (développement) ---"
if [ -f .env.local ]; then
    source .env.local 2>/dev/null || true
    
    check_item "VITE_SUPABASE_URL configuré" "[ ! -z \"\$VITE_SUPABASE_URL\" ]" "error"
    check_item "VITE_SUPABASE_ANON_KEY configuré" "[ ! -z \"\$VITE_SUPABASE_ANON_KEY\" ]" "error"
    check_item "RESEND_API_KEY configuré" "[ ! -z \"\$RESEND_API_KEY\" ]" "warning"
    check_item "TWILIO_ACCOUNT_SID configuré" "[ ! -z \"\$TWILIO_ACCOUNT_SID\" ]" "warning"
    check_item "STRIPE_PUBLIC_KEY configuré" "[ ! -z \"\$STRIPE_PUBLIC_KEY\" ]" "warning"
else
    echo -e "${RED}❌${NC} Fichier .env.local non trouvé"
    ((ERRORS++))
fi

echo -e "\n--- 5. Vérification du build ---"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Build réussi"
else
    echo -e "${RED}❌${NC} Build échoué (exécutez: npm run build)"
    ((ERRORS++))
fi

echo -e "\n--- 6. Vérification des Edge Functions ---"
if [ -d "supabase/functions" ]; then
    FUNCTIONS=("send-email" "send-whatsapp" "send-sms" "send-subscription-reminder" "send-inquiry-notification" "check-trial-expirations")
    for func in "${FUNCTIONS[@]}"; do
        if [ -d "supabase/functions/$func" ]; then
            echo -e "${GREEN}✅${NC} Edge Function $func existe"
        else
            echo -e "${YELLOW}⚠️${NC} Edge Function $func non trouvée"
            ((WARNINGS++))
        fi
    done
else
    echo -e "${YELLOW}⚠️${NC} Dossier supabase/functions non trouvé"
    ((WARNINGS++))
fi

echo -e "\n--- 7. Vérification des scripts SQL ---"
SQL_FILES=("database/full_setup.sql" "database/hospitality_subscriptions_schema.sql" "database/real_estate_subscriptions_schema.sql" "database/contact_messages_schema.sql")
for sql_file in "${SQL_FILES[@]}"; do
    check_item "Fichier $sql_file existe" "[ -f $sql_file ]" "error"
done

echo -e "\n--- 8. Vérification des outils CLI ---"
check_item "Supabase CLI installé" "command -v supabase > /dev/null 2>&1" "warning"
check_item "Vercel CLI installé" "command -v vercel > /dev/null 2>&1" "warning"

echo -e "\n========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les éléments essentiels sont prêts !${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️ Prêt avec $WARNINGS avertissements (éléments optionnels manquants)${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s) trouvée(s), $WARNINGS avertissement(s)${NC}"
    echo -e "\nConsultez TODOS_LANCEMENT.md pour les prochaines étapes"
    exit 1
fi

