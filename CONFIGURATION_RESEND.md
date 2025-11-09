# 📧 Configuration Resend pour ImmoKey

Guide complet pour configurer Resend avec le domaine **immokey.io**

---

## 🎯 Objectif

Configurer Resend pour envoyer tous les emails transactionnels d'ImmoKey :
- ✉️ Confirmations de réservation
- 🔔 Rappels d'abonnement
- ⏰ Notifications d'expiration de trial
- 📩 Réponses aux messages de contact
- 🔑 Emails de vérification

---

## 📝 Étape 1 : Créer un compte Resend

### 1.1 Inscription

1. **Va sur** https://resend.com
2. **Clique** sur "Sign Up"
3. **Inscris-toi** avec ton email professionnel (idéalement @immokey.io)
4. **Vérifie** ton email

### 1.2 Plan gratuit

Le plan gratuit de Resend inclut :
- ✅ 100 emails/jour
- ✅ 3 000 emails/mois
- ✅ Domaine personnalisé
- ✅ API complète

**Parfait pour démarrer !** Tu pourras upgrader plus tard.

---

## 🌐 Étape 2 : Configurer le domaine immokey.io

### 2.1 Ajouter le domaine

1. Dans le dashboard Resend, va dans **"Domains"**
2. Clique sur **"Add Domain"**
3. Entre : `immokey.io`
4. Clique sur **"Add"**

### 2.2 Enregistrements DNS à ajouter

Resend va te donner **3 enregistrements DNS** à ajouter chez ton registrar (où tu as acheté immokey.io) :

#### 📋 Enregistrements DNS requis

**1. SPF (TXT)**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

**2. DKIM (TXT)**
```
Type: TXT
Name: resend._domainkey
Value: [Resend te donnera une longue clé unique]
TTL: 3600
```

**3. DMARC (TXT)** (optionnel mais recommandé)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@immokey.io
TTL: 3600
```

### 2.3 Où ajouter ces DNS ?

Ça dépend d'où tu as acheté **immokey.io** :

#### Si c'est chez **Namecheap** :
1. Dashboard > Domain List > immokey.io
2. Manage > Advanced DNS
3. Add New Record pour chaque enregistrement

#### Si c'est chez **GoDaddy** :
1. My Products > immokey.io
2. DNS > Manage Zones
3. Add pour chaque enregistrement

#### Si c'est chez **Cloudflare** :
1. Dashboard > immokey.io
2. DNS > Records
3. Add record pour chaque enregistrement

#### Si c'est chez **OVH** :
1. Web Cloud > Noms de domaine > immokey.io
2. Zone DNS > Ajouter une entrée

### 2.4 Vérification

1. **Attends** 5-15 minutes (propagation DNS)
2. Dans Resend, clique sur **"Verify Domain"**
3. ✅ Le statut devrait passer à **"Verified"**

---

## 🔑 Étape 3 : Obtenir la clé API

### 3.1 Créer une clé API

1. Dans Resend, va dans **"API Keys"**
2. Clique sur **"Create API Key"**
3. **Nom** : `ImmoKey Production`
4. **Permission** : `Full Access` (ou `Sending access` uniquement)
5. Clique sur **"Create"**

### 3.2 Copier la clé

⚠️ **IMPORTANT** : La clé s'affiche **UNE SEULE FOIS** !

Elle ressemble à ça :
```
re_123abc456def789ghi012jkl345mno678pqr
```

**Copie-la immédiatement** et garde-la en sécurité !

---

## 🔧 Étape 4 : Configurer dans Supabase

### 4.1 Ajouter la clé dans Supabase

1. **Va sur** ton projet Supabase : https://supabase.com/dashboard
2. **Clique** sur ton projet
3. **Va dans** Settings > Vault
4. **Clique** sur "New secret"
5. **Nom** : `RESEND_API_KEY`
6. **Value** : `re_123abc456def789ghi012jkl345mno678pqr` (ta clé)
7. **Clique** sur "Create secret"

### 4.2 Utiliser dans les Edge Functions

Les Edge Functions pourront maintenant accéder à la clé via :

```typescript
const resendApiKey = Deno.env.get('RESEND_API_KEY')
```

---

## 📨 Étape 5 : Configurer les emails par défaut

### 5.1 Adresse d'envoi par défaut

Dans Resend, configure :

**From Email** : `noreply@immokey.io`

Tu peux aussi créer :
- `contact@immokey.io` - Pour les réponses au support
- `reservations@immokey.io` - Pour les confirmations de réservation
- `notifications@immokey.io` - Pour les rappels

### 5.2 Templates d'emails (optionnel)

Tu peux créer des templates dans Resend pour :
- Confirmation de réservation
- Rappel d'expiration de trial
- Bienvenue
- etc.

Ou tu peux générer le HTML directement dans le code (ce qu'on fait actuellement).

---

## 🧪 Étape 6 : Tester l'envoi d'emails

### 6.1 Test simple via cURL

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_123abc456def789ghi012jkl345mno678pqr' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "noreply@immokey.io",
    "to": "ton-email@example.com",
    "subject": "Test ImmoKey",
    "html": "<h1>Hello from ImmoKey!</h1><p>Si tu reçois cet email, Resend fonctionne parfaitement ! 🎉</p>"
  }'
```

### 6.2 Test depuis Supabase Edge Function

Crée une Edge Function de test :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@immokey.io',
      to: 'ton-email@example.com',
      subject: 'Test depuis Supabase',
      html: '<h1>Email de test ImmoKey</h1>',
    }),
  })

  const data = await response.json()
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

Déploie-la et teste :
```bash
curl https://rchnsvcxgzjtiqsmxidt.supabase.co/functions/v1/test-email
```

---

## 📋 Récapitulatif de configuration

### ✅ Checklist

- [ ] Compte Resend créé
- [ ] Domaine `immokey.io` ajouté dans Resend
- [ ] 3 enregistrements DNS ajoutés chez le registrar
- [ ] Domaine vérifié dans Resend (statut "Verified")
- [ ] Clé API créée et copiée
- [ ] Clé API ajoutée dans Supabase Vault (`RESEND_API_KEY`)
- [ ] Email de test envoyé avec succès

---

## 🔍 Vérification finale

### Test complet

Une fois tout configuré, vérifie :

1. **DNS** : https://mxtoolbox.com/SuperTool.aspx?action=txt%3aimmokey.io
   - Tu devrais voir les enregistrements SPF et DKIM

2. **Envoi d'email** : Utilise la commande cURL ci-dessus

3. **Réception** : Vérifie ta boîte email (et les spams !)

---

## 🚨 Troubleshooting

### Problème : "Domain not verified"

**Solution** :
1. Vérifie que les DNS sont bien configurés (attends 15-30 min)
2. Utilise https://dnschecker.org pour vérifier la propagation
3. Essaie de re-vérifier dans Resend

### Problème : Emails arrivent en spam

**Solution** :
1. Ajoute DMARC (voir section 2.2)
2. Configure un email Reply-To valide
3. Évite les mots comme "GRATUIT", "URGENT" dans les sujets
4. Ajoute un lien de désinscription

### Problème : "Invalid API key"

**Solution** :
1. Vérifie que la clé commence par `re_`
2. Vérifie qu'il n'y a pas d'espace avant/après
3. Recrée une nouvelle clé si nécessaire

---

## 📊 Monitoring

### Dashboard Resend

Resend te donne accès à :
- 📈 Nombre d'emails envoyés
- ✅ Taux de délivrabilité
- 📧 Emails en erreur
- 🔍 Logs détaillés

### Alertes

Configure des alertes pour :
- Limite d'emails approchée
- Taux d'erreur élevé
- Problèmes de délivrabilité

---

## 💰 Upgrade (plus tard)

Quand tu auras besoin de plus :

| Plan | Emails/mois | Prix/mois |
|------|-------------|-----------|
| Free | 3 000 | $0 |
| Pro | 50 000 | $20 |
| Business | 100 000 | $80 |

Tu peux upgrader à tout moment depuis le dashboard.

---

## 🎯 Prochaines étapes après Resend

Une fois Resend configuré :

1. ✅ **Twilio** - SMS/WhatsApp (optionnel)
2. ✅ **Buckets Storage** - Upload de fichiers
3. ✅ **URLs authentification** - Redirection après login
4. ✅ **Vercel** - Déploiement frontend

---

## 📞 Support

- **Documentation Resend** : https://resend.com/docs
- **Support Resend** : support@resend.com
- **Status page** : https://status.resend.com

---

**Besoin d'aide ?** Dis-moi où tu bloques ! 🚀

