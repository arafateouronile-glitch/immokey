# 🎭 Tests E2E avec Playwright

## 📋 Structure

```
e2e/
├── auth.spec.ts          # Tests d'authentification
├── listings.spec.ts      # Tests de flux listings
└── example.spec.ts       # Tests de base
```

## 🚀 Commandes

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Interface UI interactive
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug
npm run test:e2e:debug

# Tests spécifiques
npx playwright test auth.spec.ts

# Tests sur un navigateur spécifique
npx playwright test --project=chromium
```

## 📝 Écrire des Tests

### Structure de base

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading')).toBeVisible()
  })
})
```

### Bonnes Pratiques

1. **Utiliser des sélecteurs robustes** :
   ```typescript
   // ✅ Bon
   page.getByRole('button', { name: /submit/i })
   page.getByLabel('Email')
   
   // ❌ Éviter
   page.locator('.btn-submit')
   ```

2. **Attendre les éléments** :
   ```typescript
   await expect(element).toBeVisible()
   await page.waitForLoadState('networkidle')
   ```

3. **Gérer les états asynchrones** :
   ```typescript
   await page.waitForResponse(response => 
     response.url().includes('/api/listings')
   )
   ```

## 🎯 Tests à Ajouter

### Priorité 1
- [ ] Flow complet : Inscription → Publication → Visualisation
- [ ] Flow : Recherche → Filtres → Résultats
- [ ] Flow : Connexion → Favoris → Ajout favoris

### Priorité 2
- [ ] Flow : Module Rental (Création propriété → Ajout locataire)
- [ ] Flow : Module Hospitality (Création établissement → Réservation)
- [ ] Tests de régression pour bugs critiques

## 🔧 Configuration

Le serveur de développement est automatiquement lancé avant les tests (voir `webServer` dans `playwright.config.ts`).

## 📊 Rapports

Les rapports HTML sont générés dans `playwright-report/` après chaque exécution.

```bash
# Ouvrir le dernier rapport
npx playwright show-report
```

## 🌐 Navigateurs Testés

Par défaut, les tests s'exécutent sur :
- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit (Safari Desktop)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

Vous pouvez modifier cela dans `playwright.config.ts`.






