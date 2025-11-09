# 🧪 Guide de Tests - ImmoKey

## 📋 Structure des Tests

```
src/
├── services/
│   └── __tests__/
│       └── listingService.test.ts
├── hooks/
│   └── __tests__/
│       └── useAuth.test.tsx
├── components/
│   └── listings/
│       └── __tests__/
│           └── ListingCard.test.tsx
└── test/
    ├── setup.ts          # Configuration globale
    └── mocks/
        └── supabase.ts   # Mocks Supabase
```

## 🚀 Commandes

```bash
# Lancer les tests en mode watch
npm test

# Lancer les tests une fois
npm run test:run

# Lancer avec interface UI
npm run test:ui

# Générer le rapport de couverture
npm run test:coverage
```

## 📝 Écrire des Tests

### Tests de Services

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getListings } from '../listingService'

describe('listingService', () => {
  it('should fetch listings', async () => {
    // Arrange
    const mockData = [{ id: '1', title: 'Test' }]
    
    // Act
    const result = await getListings()
    
    // Assert
    expect(result).toEqual(mockData)
  })
})
```

### Tests de Composants

```typescript
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ListingCard from '../ListingCard'

describe('ListingCard', () => {
  it('should render listing title', () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Test Listing')).toBeInTheDocument()
  })
})
```

### Tests de Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  it('should return user when authenticated', async () => {
    const { result } = renderHook(() => useAuth())
    
    await waitFor(() => {
      expect(result.current.user).toBeTruthy()
    })
  })
})
```

## 🎯 Bonnes Pratiques

1. **AAA Pattern** : Arrange, Act, Assert
2. **Tests isolés** : Chaque test doit être indépendant
3. **Noms descriptifs** : `should do something when condition`
4. **Mock Supabase** : Utiliser les mocks plutôt que les appels réels
5. **Coverage** : Viser 70%+ de couverture

## 📊 Objectifs de Couverture

- ✅ Services : 80%+
- ✅ Hooks : 70%+
- ✅ Composants critiques : 70%+
- ✅ Utils : 90%+

## 🔧 Mocks

Les mocks Supabase sont dans `src/test/mocks/supabase.ts`. Utilisez-les pour isoler les tests.

```typescript
import { mockSupabaseClient } from '@/test/mocks/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}))
```







