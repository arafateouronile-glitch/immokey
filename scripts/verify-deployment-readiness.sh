#!/bin/bash

# ==========================================
# Script de vérification - Prêt pour déploiement
# ImmoKey - Phase 3
# ==========================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔍 VÉRIFICATION - Prêt pour déploiement ImmoKey          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

check_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

check_failed() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((CHECKS_WARNING++))
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ==========================================
# 1. VÉRIFICATION GIT
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 1. VÉRIFICATION GIT & GITHUB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier si Git est initialisé
if [ -d .git ]; then
    check_success "Repository Git initialisé"
else
    check_failed "Repository Git NON initialisé"
fi

# Vérifier le remote GitHub
if git remote -v | grep -q "github.com"; then
    GITHUB_URL=$(git remote get-url origin)
    check_success "Remote GitHub configuré: $GITHUB_URL"
else
    check_failed "Remote GitHub NON configuré"
fi

# Vérifier l'état du working tree
if [ -z "$(git status --porcelain)" ]; then
    check_success "Working tree propre (aucune modification non commitée)"
else
    check_warning "Modifications non commitées détectées"
    echo "   Fichiers modifiés:"
    git status --short | sed 's/^/   /'
fi

# Nombre de commits
COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
check_info "Nombre de commits: $COMMIT_COUNT"

echo ""

# ==========================================
# 2. VÉRIFICATION FICHIERS ESSENTIELS
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 2. VÉRIFICATION FICHIERS ESSENTIELS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REQUIRED_FILES=(
    "package.json"
    "vite.config.ts"
    "tsconfig.json"
    ".gitignore"
    "README.md"
    ".env.example"
    "index.html"
    "src/main.tsx"
    "src/App.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_success "$file existe"
    else
        check_failed "$file MANQUANT"
    fi
done

echo ""

# ==========================================
# 3. VÉRIFICATION DEPENDENCIES
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 3. VÉRIFICATION DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "node_modules" ]; then
    check_success "node_modules présent"
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    check_info "Nombre de modules: $MODULE_COUNT"
else
    check_warning "node_modules absent (exécute: npm install)"
fi

if [ -f "package-lock.json" ]; then
    check_success "package-lock.json présent"
else
    check_warning "package-lock.json absent"
fi

echo ""

# ==========================================
# 4. VÉRIFICATION BUILD
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 4. VÉRIFICATION BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "dist" ]; then
    check_success "Dossier dist/ existe"
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    check_info "Taille du build: $DIST_SIZE"
else
    check_warning "Dossier dist/ absent (exécute: npm run build)"
fi

echo ""

# ==========================================
# 5. VÉRIFICATION SUPABASE
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  5. VÉRIFICATION SUPABASE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REQUIRED_SQL_FILES=(
    "database/full_setup.sql"
    "database/contact_messages_schema.sql"
    "database/setup_cron_jobs.sql"
)

for file in "${REQUIRED_SQL_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_success "$file existe"
    else
        check_failed "$file MANQUANT"
    fi
done

SQL_COUNT=$(find database -name "*.sql" | wc -l)
check_info "Nombre de fichiers SQL: $SQL_COUNT"

echo ""

# ==========================================
# 6. VÉRIFICATION VARIABLES D'ENVIRONNEMENT
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 6. VÉRIFICATION VARIABLES D'ENVIRONNEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env.example" ]; then
    check_success ".env.example existe"
    
    # Compter les variables
    VAR_COUNT=$(grep -c "^VITE_" .env.example 2>/dev/null || echo "0")
    check_info "Variables définies dans .env.example: $VAR_COUNT"
else
    check_failed ".env.example MANQUANT"
fi

if [ -f ".env.local" ]; then
    check_warning ".env.local existe (NE PAS commiter ce fichier !)"
else
    check_info ".env.local absent (normal - à créer en production)"
fi

echo ""

# ==========================================
# 7. VÉRIFICATION DOCUMENTATION
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 7. VÉRIFICATION DOCUMENTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOC_FILES=(
    "README.md"
    "PHASE_2_PRODUCTION.md"
    "PHASE_3_DEPLOIEMENT.md"
    "CONFIGURATION_STRIPE.md"
    "CONFIGURATION_RESEND.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_success "$file existe"
    else
        check_warning "$file manquant"
    fi
done

echo ""

# ==========================================
# 8. VÉRIFICATION TESTS
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 8. VÉRIFICATION TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Compter les fichiers de tests
TEST_COUNT=$(find src -name "*.test.ts*" -o -name "*.spec.ts" | wc -l)
E2E_COUNT=$(find e2e -name "*.spec.ts" 2>/dev/null | wc -l)

if [ "$TEST_COUNT" -gt 0 ]; then
    check_success "Tests unitaires trouvés: $TEST_COUNT fichiers"
else
    check_warning "Aucun test unitaire trouvé"
fi

if [ "$E2E_COUNT" -gt 0 ]; then
    check_success "Tests E2E trouvés: $E2E_COUNT fichiers"
else
    check_warning "Aucun test E2E trouvé"
fi

echo ""

# ==========================================
# 9. VÉRIFICATION SÉCURITÉ
# ==========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 9. VÉRIFICATION SÉCURITÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier que .env.local est dans .gitignore
if grep -q "\.env\.local" .gitignore 2>/dev/null; then
    check_success ".env.local est dans .gitignore"
else
    check_failed ".env.local NON présent dans .gitignore"
fi

# Vérifier qu'il n'y a pas de secrets commitées (exclure .example)
if git log --all --pretty=format: --name-only | grep "\.env\.local$" | grep -v "\.example$" | grep -q "."; then
    check_failed "⚠️  DANGER: .env.local a été commité dans l'historique !"
else
    check_success "Aucun fichier .env.local dans l'historique Git"
fi

echo ""

# ==========================================
# RÉSUMÉ FINAL
# ==========================================
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    📊 RÉSUMÉ FINAL                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNING))

echo -e "${GREEN}✅ Vérifications réussies : $CHECKS_PASSED${NC}"
echo -e "${RED}❌ Vérifications échouées : $CHECKS_FAILED${NC}"
echo -e "${YELLOW}⚠️  Avertissements        : $CHECKS_WARNING${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Total                  : $TOTAL_CHECKS"
echo ""

# Décision finale
if [ $CHECKS_FAILED -eq 0 ]; then
    if [ $CHECKS_WARNING -eq 0 ]; then
        echo -e "${GREEN}🎉 PARFAIT ! Tous les tests sont passés !${NC}"
        echo -e "${GREEN}✅ Tu es PRÊT pour déployer sur Vercel${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  ATTENTION : Il y a des avertissements${NC}"
        echo -e "${YELLOW}Tu peux continuer mais vérifie les points ci-dessus${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ ERREUR : Des vérifications critiques ont échoué${NC}"
    echo -e "${RED}Corrige les erreurs avant de déployer${NC}"
    exit 1
fi

