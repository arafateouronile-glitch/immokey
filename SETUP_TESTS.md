# 🧪 Configuration des Tests - ImmoKey

## ✅ Ce qui a été configuré

### 1. Packages installés
- ✅ **Vitest** : Framework de tests
- ✅ **@vitest/ui** : Interface UI pour les tests
- ✅ **@testing-library/react** : Utilitaires pour tester React
- ✅ **@testing-library/jest-dom** : Matchers DOM
- ✅ **@testing-library/user-event** : Simuler les interactions utilisateur
- ✅ **@vitest/coverage-v8** : Génération de rapports de couverture
- ✅ **jsdom** : Environnement DOM pour les tests

### 2. Configuration
- ✅ `vitest.config.ts` : Configuration Vitest
- ✅ `src/test/setup.ts` : Setup global des tests
- ✅ Scripts npm ajoutés :
  - `npm test` : Lancer les tests en mode watch
  - `npm run test:ui` : Interface UI interactive
  - `npm run test:run` : Lancer les tests une fois
  - `npm run test:coverage` : Générer le rapport de couverture

### 3. Tests créés
- ✅ **Services** : `listingService.test.ts` (14 tests)
- ✅ **Hooks** : `useAuth.test.tsx` (6 tests)
- ✅ **Composants** : `ListingCard.test.tsx` (12 tests)

### 4. Mocks
- ✅ Mock Supabase configuré
- ✅ Mock React Router
- ✅ Mock composants (LazyImage, FavoriteButton)

## 🚀 Utilisation

### Lancer les tests
```bash
# Mode watch (recommandé pour le développement)
npm test

# Lancer une fois
npm run test:run

# Interface UI interactive
npm run test:ui

# Avec couverture de code
npm run test:coverage
```

### Écrire de nouveaux tests

#### Test de service
```typescript
// src/services/__tests__/myService.test.ts
import { describe, it, expect, vi } from 'vitest'
import { myFunction } from '../myService'

describe('myService', () => {
  it('should do something', () => {
    // Test code
  })
})
```

#### Test de composant
```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

#### Test de hook
```typescript
// src/hooks/__tests__/useMyHook.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('should return correct value', async () => {
    const { result } = renderHook(() => useMyHook())
    await waitFor(() => {
      expect(result.current.value).toBeTruthy()
    })
  })
})
```

## 📊 Objectifs de couverture

- **Services** : 80%+
- **Hooks** : 70%+
- **Composants critiques** : 70%+
- **Utils** : 90%+

## 📝 Prochaines étapes

1. ✅ Configuration de base terminée
2. ⏳ Ajouter tests pour autres services (imageService, favoritesService)
3. ⏳ Ajouter tests pour composants de formulaires
4. ⏳ Configurer tests E2E avec Playwright
5. ⏳ Intégrer tests dans CI/CD

## 🔗 Ressources

- [Documentation Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Guide de tests ImmoKey](./src/test/README.md)







