# 🏠 ImmoKey - La clé de votre logement

Plateforme digitale immobilière complète pour le Togo.

## 🎯 Fonctionnalités

### 🏠 Immobilier
- **Recherche et publication d'annonces** (gratuit)
- **Services payants** : Paiement sécurisé, Gestion locative
- **Système de commissions** : Particuliers (5%) et Professionnels (2%)
- **Messages internes** entre utilisateurs
- **Favoris** pour sauvegarder les annonces

### 🏨 Hôtellerie
- **Gestion complète** : Établissements, chambres, réservations
- **Essai gratuit** : 14 jours
- **Abonnements** : Starter (9 900 FCFA), Professionnel (20 000 FCFA), Entreprise (sur devis)
- **Tableau de bord** avec statistiques et revenus

### 💬 Communication
- **Messages internes** sécurisés
- **Notifications multi-canal** : WhatsApp, SMS, Email (adapté au Togo)
- **Notifications en temps réel**

## 🚀 Lancement en Production

**Phase 1 : Tests en Local** ✅ TERMINÉ  
**Phase 2 : Configuration Production** ⏳ EN COURS  
**Phase 3 : Déploiement** ⏳ À FAIRE

👉 **Lis `README_LANCEMENT.md` pour continuer le déploiement !**

### Guides de Lancement
- **`PHASE_2_PRODUCTION.md`** ⭐ Configuration des services (2-3h)
- **`PHASE_3_DEPLOIEMENT.md`** ⭐ Déploiement sur Vercel (1-2h)
- **`README_LANCEMENT.md`** Vue d'ensemble complète
- **`LANCEMENT_FINAL.md`** Checklist et métriques

---

## 🛠️ Développement Local

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte Vercel (pour le déploiement)

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-compte/immokey.git
cd immokey

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# Lancer le serveur de développement
npm run dev
```

### Configuration Supabase

1. Créer un projet sur https://supabase.com
2. Exécuter les scripts SQL dans l'ordre :
   - `database/full_setup.sql`
   - `database/hospitality_subscriptions_schema.sql`
   - `database/real_estate_subscriptions_schema.sql`
   - `database/contact_messages_schema.sql`

Voir `docs/PRODUCTION_SETUP.md` pour plus de détails.

## 📚 Documentation

### Guides Techniques
- **[Configuration Production](docs/PRODUCTION_SETUP.md)** : Guide complet de configuration
- **[Déploiement](docs/DEPLOYMENT.md)** : Guide de déploiement sur Vercel
- **[Monitoring](docs/MONITORING.md)** : Configuration du monitoring
- **[Backups](docs/BACKUPS.md)** : Gestion des backups
- **[Sécurité](docs/SECURITY.md)** : Guide de sécurité
- **[SEO & Marketing](docs/SEO_MARKETING.md)** : Stratégie SEO et marketing
- **[Tests](docs/TESTING.md)** : Guide des tests

### Guides Utilisateur
- **[FAQ](src/pages/FAQPage.tsx)** : Questions fréquentes
- **[Contact](src/pages/ContactPage.tsx)** : Page de contact

### Pages Légales
- **[CGU](src/pages/legal/TermsOfServicePage.tsx)** : Conditions d'utilisation
- **[Confidentialité](src/pages/legal/PrivacyPolicyPage.tsx)** : Politique de confidentialité
- **[Cookies](src/pages/legal/CookiesPolicyPage.tsx)** : Politique des cookies
- **[Mentions Légales](src/pages/legal/LegalNoticePage.tsx)** : Mentions légales

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Couverture de code
npm run test:coverage
```

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

Voir `docs/DEPLOYMENT.md` pour plus de détails.

## 🔒 Sécurité

- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Validation des entrées (Zod)
- ✅ Headers de sécurité
- ✅ HTTPS obligatoire
- ✅ Audit de sécurité automatisé

Voir `docs/SECURITY.md` pour plus de détails.

## 📊 Monitoring

- **Sentry** : Monitoring des erreurs
- **Google Analytics** : Analytics
- **Vercel Analytics** : Performance
- **Uptime Monitoring** : Disponibilité

Voir `docs/MONITORING.md` pour plus de détails.

## 💾 Backups

- Backups automatiques Supabase (quotidiens, hebdomadaires, mensuels)
- Scripts de backup manuel
- Plan de récupération documenté

Voir `docs/BACKUPS.md` pour plus de détails.

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run preview          # Prévisualisation du build

# Tests
npm run test             # Tests unitaires
npm run test:integration # Tests d'intégration
npm run test:e2e         # Tests E2E

# Production
npm run generate:sitemap # Générer le sitemap
./scripts/security-audit.sh      # Audit de sécurité
./scripts/backup-database.sh     # Backup de la base de données
./scripts/post-deploy:check      # Vérification post-déploiement
```

## 📋 Checklist de Lancement

Voir `CHECKLIST_LANCEMENT.md` pour la checklist complète de lancement.

## 📖 Récapitulatif

Voir `RECAPITULATIF_FINAL.md` pour un récapitulatif complet de toutes les fonctionnalités.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est propriétaire. Tous droits réservés.

## 📞 Contact

- **Email** : contact@immokey.tg
- **Site** : https://immokey.tg

## 🎉 Remerciements

Merci d'utiliser ImmoKey ! 🚀

