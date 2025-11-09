# 🔍 Intégration Sentry - ImmoKey

**Date** : Décembre 2024  
**Objectif** : Monitoring des erreurs et performance en production

---

## ✅ Intégration Complétée

Sentry est maintenant intégré dans l'application pour le monitoring des erreurs en production.

---

## 📋 Configuration

### 1. Créer un compte Sentry

1. Aller sur https://sentry.io
2. Créer un compte (gratuit jusqu'à 5,000 erreurs/mois)
3. Créer un nouveau projet "React"
4. Copier le **DSN** (Data Source Name)

### 2. Configurer le DSN

Ajouter dans votre fichier `.env` :

```env
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**Important** : Le DSN est public, c'est normal. Il ne contient pas de secrets.

### 3. Déployer

Sentry est automatiquement activé en production si :
- ✅ Le DSN est configuré (`VITE_SENTRY_DSN`)
- ✅ L'environnement est `production` (pas `development`)

---

## 🎯 Fonctionnalités Activées

### Monitoring des Erreurs
- ✅ **Capture automatique** : Toutes les erreurs sont capturées
- ✅ **Context riche** : Tags, contexte utilisateur, stack traces
- ✅ **Filtrage intelligent** : Erreurs non critiques filtrées (ex: ResizeObserver)
- ✅ **Intégration avec errorHandler** : Utilise le système centralisé d'erreurs

### Performance Monitoring
- ✅ **Traces de performance** : 10% des transactions en production
- ✅ **Métriques** : Temps de chargement, requêtes lentes
- ✅ **Routing** : Suivi des navigations React Router

### Session Replay (Optionnel)
- ✅ **10% des sessions** : Replay automatique
- ✅ **100% des sessions avec erreurs** : Replay quand erreur détectée

---

## 📊 Utilisation

### Erreurs Automatiques

Toutes les erreurs capturées via `errorHandler.ts` sont automatiquement envoyées à Sentry :

```typescript
// Dans errorHandler.ts - automatique
logError(appError, 'createListing')
// → Envoyé à Sentry en production
```

### Erreurs Manuelles

Pour capturer une erreur manuellement :

```typescript
import * as Sentry from '@sentry/react'

try {
  // Code qui peut échouer
} catch (error) {
  Sentry.captureException(error, {
    tags: { context: 'custom-operation' },
    extra: { customData: 'value' },
  })
}
```

### Ajouter du Contexte

```typescript
import * as Sentry from '@sentry/react'

// Ajouter des tags
Sentry.setTag('user_type', 'professional')

// Ajouter des données supplémentaires
Sentry.setContext('listing', {
  id: listing.id,
  title: listing.title,
})

// Ajouter de l'utilisateur
Sentry.setUser({
  id: user.id,
  email: user.email,
})
```

---

## 🔧 Configuration Technique

### Fichiers Modifiés

1. **`src/lib/sentry.ts`** : Configuration Sentry
   - Initialisation conditionnelle (prod uniquement)
   - Filtrage des erreurs
   - Configuration des traces

2. **`src/main.tsx`** : Intégration dans le point d'entrée
   - Initialisation au démarrage
   - Avant React render

3. **`src/utils/errorHandler.ts`** : Intégration avec le système d'erreurs
   - Envoi automatique à Sentry
   - Tags et métadonnées

### Variables d'Environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `VITE_SENTRY_DSN` | DSN Sentry | Oui (pour activation) |

---

## 📈 Dashboard Sentry

Une fois configuré, vous pouvez voir dans le dashboard Sentry :

### Issues
- Liste de toutes les erreurs
- Groupement intelligent
- Fréquence et impact
- Stack traces complètes

### Performance
- Temps de chargement des pages
- Requêtes lentes
- Transactions critiques

### Releases
- Tracking des versions
- Déploiements
- Nouveaux bugs par version

---

## 🛡️ Sécurité et Confidentialité

### Données Envoyées

Sentry capture automatiquement :
- ✅ Messages d'erreur
- ✅ Stack traces
- ✅ URL de la page
- ✅ User agent
- ✅ Tags et contexte

### Données Sensibles

**Important** : Ne pas envoyer de données sensibles (mots de passe, tokens, etc.)

Les données sensibles sont automatiquement filtrées, mais vérifiez avant production.

### Quota Gratuit

- **5,000 erreurs/mois** : Gratuit
- **10,000 erreurs/mois** : Plan Team (payant)

Pour réduire la consommation :
- ✅ Filtrage des erreurs non critiques (déjà configuré)
- ✅ Sample rate des traces (10% en prod)
- ✅ Sample rate des sessions (10%)

---

## 🧪 Test en Local

Par défaut, Sentry est **désactivé en développement**.

Pour tester en local :

1. Créer un fichier `.env.local` :
```env
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

2. Forcer le mode production :
```bash
npm run build
npm run preview
```

Ou modifier `src/lib/sentry.ts` temporairement :
```typescript
// Ligne 12 : Commenter la condition
// if (!dsn || environment === 'development') {
```

⚠️ **Attention** : Ne pas commiter cette modification !

---

## 📝 Checklist de Déploiement

- [ ] Compte Sentry créé
- [ ] Projet React créé
- [ ] DSN copié
- [ ] Variable `VITE_SENTRY_DSN` configurée en production
- [ ] Test de capture d'erreur effectué
- [ ] Dashboard Sentry vérifié
- [ ] Alerts configurées (optionnel)

---

## 🔗 Ressources

- **Documentation Sentry React** : https://docs.sentry.io/platforms/javascript/guides/react/
- **Dashboard Sentry** : https://sentry.io
- **Pricing** : https://sentry.io/pricing/

---

## ✅ Résumé

Sentry est maintenant intégré et prêt à monitorer les erreurs en production. 

**Prochaines étapes** :
1. Configurer le DSN en production
2. Tester une erreur de capture
3. Configurer les alerts (optionnel)
4. Monitorer les métriques

---

**Date d'intégration** : Décembre 2024  
**Version Sentry** : @sentry/react@^10.22.0





