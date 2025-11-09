# 📝 Notes de Développement - ImmoKey

## 🎨 Bonnes Pratiques

### React / TypeScript

```typescript
// ✅ Bon : Composant typé
interface Props {
  title: string
  onClick: () => void
}

export function MyComponent({ title, onClick }: Props) {
  return <button onClick={onClick}>{title}</button>
}

// ❌ Éviter : any
function MyComponent(props: any) { ... }
```

### Styling Tailwind

```typescript
// ✅ Bon : Classes Tailwind
<div className="bg-white rounded-lg shadow-md p-6">

// ✅ Bon : Classes conditionnelles
<button className={clsx(
  "btn",
  isLoading && "opacity-50 cursor-not-allowed"
)}>

// ❌ Éviter : inline styles
<div style={{ backgroundColor: 'white', padding: '24px' }}>
```

### Gestion d'état

```typescript
// ✅ Pour état local : useState
const [count, setCount] = useState(0)

// ✅ Pour état global : Zustand
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}))

// ✅ Pour serveur : React Query (recommandé pour fetch)
```

### Supabase

```typescript
// ✅ Bon : Gestion d'erreurs
try {
  const { data, error } = await supabase.from('listings').select()
  if (error) throw error
  return data
} catch (error) {
  console.error('Error fetching listings:', error)
  return []
}

// ❌ Éviter : Ignorer les erreurs
const { data } = await supabase.from('listings').select()
```

## 📁 Organisation du code

```
src/
├── components/
│   ├── common/         # Composants partagés
│   ├── forms/          # Composants formulaires
│   ├── listings/       # Composants listings
│   └── maps/           # Composants cartes
├── pages/              # Pages/routes
├── hooks/              # Hooks personnalisés
├── services/           # Services API
├── stores/             # États globaux
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
└── lib/                # Configurations externes
```

## 🚀 Performance

### Images

```typescript
// ✅ Lazy loading
<img loading="lazy" src={image} alt="description" />

// ✅ Dimensions explicites
<img width={400} height={300} src={image} />

// ✅ Responsive images
<img srcset="small.jpg 400w, large.jpg 800w" sizes="50vw" />
```

### Code splitting

```typescript
// ✅ Lazy load components
const CreateListing = lazy(() => import('./pages/CreateListingPage'))

// ✅ Lazy load routes
<Route path="/publier" element={<Suspense fallback={<Loader />}>
  <CreateListing />
</Suspense>} />
```

### Supabase queries

```typescript
// ✅ Sélectionner seulement les colonnes nécessaires
.select('id, title, price')  // Pas .select('*')

// ✅ Utiliser des indexes
// Créer les indexes dans schema.sql

// ✅ Pagination
.limit(20)
.range(0, 19)
```

## 🔒 Sécurité

### RLS (Row Level Security)

```sql
-- ✅ Politique vérifie auth.uid()
CREATE POLICY "Users can update own listings"
ON listings FOR UPDATE
USING (auth.uid() = user_id);
```

### Variables d'environnement

```typescript
// ✅ Ne JAMAIS exposer de secrets côté client
// Les variables VITE_* sont publiques

// ✅ Stocker les secrets côté serveur
// Utiliser Edge Functions pour opérations sensibles
```

### Validation

```typescript
// ✅ Valider côté client ET serveur
// Client : Zod schemas
// Serveur : Database constraints + RLS
```

## 📱 Mobile-first

```typescript
// ✅ Responsive par défaut
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ Touch-friendly
<button className="min-h-[44px] min-w-[44px]">

// ✅ PWA ready
// Déjà configuré dans vite.config.ts
```

## 🌍 Internationalisation (future)

```typescript
// Structure pour futur i18n
// src/
//   locales/
//     fr.json
//     en.json

// const t = useTranslation()
// <h1>{t('welcome.title')}</h1>
```

## 🧪 Tests (à implémenter)

```typescript
// Vitest setup
import { describe, it, expect } from 'vitest'

describe('ListingService', () => {
  it('should fetch listings', async () => {
    const listings = await getListings()
    expect(listings).toBeInstanceOf(Array)
  })
})
```

## 🐛 Debugging

```typescript
// ✅ Logs utiles
console.log('[LISTING] Fetching...', { filters })
console.error('[LISTING] Error:', error)

// ❌ Éviter en production
console.log('Debug:', x, y, z)

// ✅ Utiliser Supabase logs
// Dashboard > Logs > Filter par date
```

## 📊 Analytics

```typescript
// ✅ Track events
function trackEvent(eventName: string, data?: object) {
  if (import.meta.env.VITE_GA_ID) {
    gtag('event', eventName, data)
  }
}

// Usage
trackEvent('listing_viewed', { listingId: id })
trackEvent('search_performed', { query: searchQuery })
```

## 🎯 Patterns recommandés

### Fetching data

```typescript
// ✅ Pattern avec loading/error
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true)
      const result = await getListings()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

### Form handling

```typescript
// ✅ React Hook Form + Zod
const schema = z.object({
  title: z.string().min(10),
  price: z.number().positive()
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

### Protected routes

```typescript
// ✅ HOC ou composant guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <Loader />
  if (!user) return <Navigate to="/connexion" />
  return children
}
```

## 📚 Ressources

- **React Patterns** : https://reactpatterns.com
- **Supabase Best Practices** : https://supabase.com/docs/guides
- **Tailwind UI** : https://tailwindui.com/components
- **TypeScript Handbook** : https://www.typescriptlang.org/docs/

## 💡 Conseils

1. **Commits réguliers** : Commit souvent avec messages clairs
2. **Code reviews** : Faire reviewer votre code
3. **Tests** : Tester manuellement chaque fonctionnalité
4. **Documentation** : Commenter le code complexe
5. **Performance** : Profiler régulièrement
6. **Sécurité** : Vérifier RLS et validations
7. **UX** : Tester sur différents appareils

## 🎓 Apprentissage

Si vous débutez :
1. Comprendre React basics (components, state, props)
2. Apprendre TypeScript (types, interfaces)
3. Maîtriser Tailwind CSS
4. Découvrir Supabase (auth, db, storage)
5. Comprendre le routing avec React Router

Bon code ! 🚀







