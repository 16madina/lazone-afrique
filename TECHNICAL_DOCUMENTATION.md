# Documentation Technique - LaZone

## Table des matières

1. [Architecture Générale](#architecture-générale)
2. [Stack Technique](#stack-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Patterns et Conventions](#patterns-et-conventions)
5. [Sécurité](#sécurité)
6. [Performance et Optimisation](#performance-et-optimisation)
7. [Tests](#tests)
8. [Base de Données](#base-de-données)
9. [APIs et Intégrations](#apis-et-intégrations)
10. [Déploiement](#déploiement)

---

## Architecture Générale

LaZone est une application web de marketplace immobilier construite avec une architecture moderne React/Supabase.

### Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  Components  │  │    Hooks     │  │
│  │              │  │              │  │              │  │
│  │ - Index      │  │ - PropertyCard│ │ - useFavorites│ │
│  │ - Profile    │  │ - Header     │  │ - useAuth    │  │
│  │ - Messages   │  │ - Filters    │  │ - useToast   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Contexts    │  │     Lib      │  │     UI       │  │
│  │              │  │              │  │              │  │
│  │ - Auth       │  │ - Validation │  │ - Shadcn/ui  │  │
│  │ - Country    │  │ - Logger     │  │ - Tailwind   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase Backend Services                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │  Auth        │  │  Storage     │  │
│  │  Database    │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Edge Functions (Serverless)              │  │
│  │  - Geocoding  - Email  - Push Notifications      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│             Services Externes                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Mapbox     │  │  CinetPay    │  │   Resend     │  │
│  │   (Cartes)   │  │  (Paiement)  │  │   (Email)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Stack Technique

### Frontend
- **Framework**: React 18.3+ avec TypeScript
- **Build Tool**: Vite 6.0+
- **Routing**: React Router v6
- **State Management**: 
  - React Query (TanStack Query) pour les requêtes serveur
  - Context API pour l'état global (Auth, Country)
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS avec design tokens personnalisés
- **Forms**: React Hook Form + Zod
- **Mobile**: Capacitor pour apps natives (iOS/Android)

### Backend (Supabase)
- **Database**: PostgreSQL avec Row Level Security (RLS)
- **Authentication**: Supabase Auth (Email, Phone, OAuth)
- **Storage**: Supabase Storage pour les médias
- **Real-time**: Supabase Realtime pour les messages
- **Edge Functions**: Deno pour la logique serverless

### Services Externes
- **Mapbox**: Cartes interactives et géocodage
- **CinetPay**: Paiements mobile money (Afrique)
- **Resend**: Envoi d'emails transactionnels

---

## Structure du Projet

```
src/
├── assets/              # Images et ressources statiques
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base (Shadcn)
│   ├── admin/          # Composants d'administration
│   └── *.tsx           # Composants métier
├── contexts/           # Contexts React (Auth, Country)
├── hooks/              # Custom hooks
├── integrations/       # Intégrations externes (Supabase)
├── lib/                # Utilitaires et helpers
│   ├── __tests__/     # Tests unitaires des utilitaires
│   ├── errorMessages.ts
│   ├── logger.ts
│   ├── passwordValidator.ts
│   ├── validationSchemas.ts
│   └── utils.ts
├── pages/              # Pages de l'application
├── test/               # Configuration de test
├── App.tsx             # Composant racine
├── main.tsx            # Point d'entrée
└── index.css           # Styles globaux + tokens design

supabase/
├── functions/          # Edge Functions
│   ├── geocode-city/
│   ├── send-email-alerts/
│   └── ...
└── migrations/         # Migrations de base de données
```

---

## Patterns et Conventions

### 1. Composants

#### Composants Fonctionnels avec TypeScript
```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

const Component = ({ title, onAction }: ComponentProps) => {
  // Logic
  return <div>{title}</div>;
};
```

#### Composants Mémoïsés pour Performance
```typescript
import { memo } from 'react';

const PropertyCard = memo(({ id, title, price }: PropertyCardProps) => {
  // Composant optimisé avec memo pour éviter re-renders inutiles
  return <Card>...</Card>;
});

PropertyCard.displayName = 'PropertyCard';
```

### 2. Hooks Personnalisés

Pattern standard pour les hooks:
```typescript
export const useCustomHook = () => {
  const [state, setState] = useState();
  
  useEffect(() => {
    // Side effects
  }, []);

  return { state, setState };
};
```

### 3. Validation avec Zod

Toutes les validations utilisent Zod pour la cohérence:
```typescript
import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string().min(5, 'Titre trop court'),
  price: z.number().positive('Prix invalide'),
  type: z.enum(['sale', 'rent', 'commercial'])
});

// Utilisation
const result = propertySchema.safeParse(data);
if (!result.success) {
  // Gérer les erreurs
}
```

### 4. Gestion des Erreurs

#### Logger Centralisé
```typescript
import { logger } from '@/lib/logger';

// En développement: console.log
// En production: silencieux (ou envoi à service externe)
logger.info('Action réussie');
logger.error('Erreur détectée', error);
```

#### Messages d'Erreur Traduits
```typescript
import { getErrorMessage } from '@/lib/errorMessages';

try {
  await action();
} catch (error) {
  const message = getErrorMessage(error.message);
  toast({ title: message, variant: 'destructive' });
}
```

### 5. Design System

#### Tokens CSS (index.css)
```css
:root {
  --primary: 24 63% 50%;        /* HSL colors */
  --secondary: 42 87% 55%;
  --accent: 0 84% 60%;
  
  --gradient-card: linear-gradient(...);
  --shadow-warm: 0 4px 6px -1px...;
}
```

#### Utilisation dans les Composants
```typescript
// ❌ Ne PAS faire
<div className="bg-blue-500 text-white">

// ✅ Faire
<div className="bg-primary text-primary-foreground">
```

---

## Sécurité

### 1. Row Level Security (RLS)

Toutes les tables ont RLS activé:
```sql
-- Exemple: Table listings
CREATE POLICY "Users can view published listings"
ON listings FOR SELECT
USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Users can update own listings"
ON listings FOR UPDATE
USING (user_id = auth.uid());
```

### 2. Validation des Mots de Passe

Force minimale requise: 60/100
```typescript
const { isValid, strength } = validatePassword(password);
if (!isValid) {
  // Mot de passe trop faible
}
```

Critères:
- Minimum 8 caractères
- Majuscules, minuscules, chiffres
- Caractères spéciaux recommandés
- Longueur > 12 pour "Fort"

### 3. Protection des Secrets

- Jamais de clés API côté client
- Utilisation d'Edge Functions pour appels externes
- Variables d'environnement chiffrées dans Supabase

### 4. Authentification

- JWT avec refresh tokens
- Expiration automatique des sessions
- Vérification email obligatoire pour certaines actions
- Rate limiting sur les endpoints sensibles

---

## Performance et Optimisation

### 1. Caching Strategy

#### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 min - fraîcheur
      gcTime: 1000 * 60 * 10,          // 10 min - garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});
```

#### Cache Keys
```typescript
// Convention: ['entity', 'action', ...params]
['listings', 'list', { country, city, type }]
['listing', 'detail', listingId]
['user', 'favorites']
```

### 2. Optimisation des Images

```typescript
// Lazy loading natif
<img loading="lazy" src={url} />

// Limite du nombre d'images dans carousel
photos.slice(0, 5)

// Placeholder SVG data URI pour éviter requêtes
const placeholder = `data:image/svg+xml,%3csvg...`
```

### 3. Code Splitting

```typescript
// Route-based splitting avec React.lazy
const LazyComponent = lazy(() => import('./Component'));

<Suspense fallback={<Skeleton />}>
  <LazyComponent />
</Suspense>
```

### 4. Optimisation des Requêtes N+1

❌ **Mauvais**: 1 requête par profil
```typescript
listings.forEach(async (listing) => {
  const profile = await supabase
    .from('profiles')
    .select('*')
    .eq('id', listing.user_id)
    .single();
});
```

✅ **Bon**: 1 requête groupée
```typescript
const userIds = [...new Set(listings.map(l => l.user_id))];
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .in('id', userIds);

// Map profiles to listings
```

### 5. Mémoïsation

```typescript
import { memo, useMemo, useCallback } from 'react';

// Composant mémoïsé
const PropertyCard = memo(({ id, title }) => { ... });

// Valeurs calculées
const sortedItems = useMemo(
  () => items.sort(compareFn),
  [items]
);

// Callbacks
const handleClick = useCallback(
  () => doSomething(id),
  [id]
);
```

---

## Tests

### Configuration

```bash
# Lancer les tests
npm run test

# Tests avec UI
npm run test:ui

# Coverage
npm run test:coverage
```

### Structure des Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Tests Unitaires

- **Utilitaires**: `src/lib/__tests__/`
- **Composants**: `src/components/__tests__/`
- **Hooks**: `src/hooks/__tests__/`

### Couverture

Objectif: > 70% de couverture pour:
- `src/lib/`
- `src/hooks/`
- Composants critiques

---

## Base de Données

### Schéma Principal

#### Table: listings
```sql
id: uuid (PK)
user_id: uuid (FK -> auth.users)
title: text
description: text
price: numeric
transaction_type: enum('sale', 'rent', 'commercial')
property_type: enum('apartment', 'house', 'villa', 'land', 'commercial')
city: text
country_code: text
latitude: numeric
longitude: numeric
photos: text[]
status: enum('draft', 'published', 'sold', 'rented')
created_at: timestamp
updated_at: timestamp
```

#### Table: profiles
```sql
id: uuid (PK, FK -> auth.users)
full_name: text
phone: text
user_type: enum('particulier', 'agence', 'courtier')
avatar_url: text
verified: boolean
rating: numeric
created_at: timestamp
```

#### Table: favorites
```sql
id: uuid (PK)
user_id: uuid (FK -> auth.users)
listing_id: uuid (FK -> listings)
created_at: timestamp

UNIQUE(user_id, listing_id)
```

### Indexes

```sql
-- Performance des recherches
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_country ON listings(country_code);
CREATE INDEX idx_listings_type ON listings(transaction_type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_user ON listings(user_id);

-- Full-text search
CREATE INDEX idx_listings_search ON listings 
USING gin(to_tsvector('french', title || ' ' || description));
```

---

## APIs et Intégrations

### Supabase Edge Functions

#### Géocodage
```typescript
// GET /functions/v1/geocode-city?city=Abidjan&country=CI
{
  latitude: 5.316667,
  longitude: -4.033333,
  city: "Abidjan"
}
```

#### Notifications Push
```typescript
// POST /functions/v1/send-push-notification
{
  userId: "...",
  title: "Nouveau message",
  body: "Vous avez reçu un message"
}
```

### Mapbox API

```typescript
// Récupération du token via Edge Function
const { data } = await supabase.functions.invoke('get-mapbox-token');
const token = data.token;

// Utilisation dans Mapbox GL
mapboxgl.accessToken = token;
```

### CinetPay

```typescript
// Création d'un paiement
const { data } = await supabase.functions.invoke(
  'create-cinetpay-payment',
  {
    body: {
      amount: 10000,
      currency: 'XOF',
      description: 'Sponsoring annonce'
    }
  }
);

// Vérification du statut
const { data: status } = await supabase.functions.invoke(
  'verify-cinetpay-payment',
  { body: { transactionId } }
);
```

---

## Déploiement

### Variables d'Environnement

#### Frontend (Vite)
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

#### Edge Functions
```bash
MAPBOX_ACCESS_TOKEN=pk.xxx
CINETPAY_API_KEY=xxx
CINETPAY_SITE_ID=xxx
RESEND_API_KEY=re_xxx
```

### Build

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Déploiement Lovable

1. Cliquer sur "Publish" dans l'interface
2. Choisir le domaine (lovable.app ou custom)
3. Les changements sont automatiquement déployés

### Déploiement Custom

```bash
# Build
npm run build

# Déployer dist/ vers:
# - Vercel
# - Netlify
# - Cloudflare Pages
# - S3 + CloudFront
```

---

## Bonnes Pratiques

### 1. Code Quality

- **TypeScript strict mode** activé
- **ESLint** pour la qualité du code
- **Prettier** pour le formatage
- **Commits conventionnels**: `feat:`, `fix:`, `docs:`, etc.

### 2. Performance

- Utiliser `memo` pour les composants lourds
- `useMemo` et `useCallback` pour les calculs coûteux
- Lazy loading pour les routes et images
- Optimiser les requêtes SQL (indexes, EXPLAIN)

### 3. Sécurité

- Toujours valider côté serveur (Edge Functions)
- RLS activé sur toutes les tables
- Sanitize les inputs utilisateur
- Rate limiting sur les actions sensibles

### 4. Accessibilité

- Labels sur tous les inputs
- Alt text sur toutes les images
- Navigation au clavier
- Contrast ratios WCAG AA minimum

### 5. SEO

- Meta tags sur toutes les pages
- Structured data (JSON-LD)
- Sitemap.xml généré
- robots.txt configuré

---

## Maintenance

### Logs et Monitoring

```typescript
// Utiliser le logger pour toutes les opérations
logger.info('User logged in', { userId });
logger.error('Payment failed', { error, transactionId });
```

### Backup

- **Base de données**: Backups automatiques quotidiens (Supabase)
- **Storage**: Réplication automatique
- **Code**: Git repository avec branches protégées

### Mises à Jour

```bash
# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour avec précaution
npm update

# Tests après mise à jour
npm run test
```

---

## Support et Ressources

- **Documentation Supabase**: https://supabase.com/docs
- **Shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **React Query**: https://tanstack.com/query
- **Mapbox**: https://docs.mapbox.com

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-01-04  
**Maintenu par**: Équipe LaZone
