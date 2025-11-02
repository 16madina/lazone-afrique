# ??? GUIDE D'IMPL?MENTATION DES AM?LIORATIONS

Ce guide d?taille comment impl?menter les am?liorations prioritaires identifi?es dans l'audit.

---

## ? D?J? FAIT

### 1. Composant ProtectedRoute Cr?? ?
**Fichier:** `src/components/ProtectedRoute.tsx`

### 2. Composant MapListingsList Cr?? ?
**Fichier:** `src/components/MapListingsList.tsx`

### 3. Hook useHaptics Cr?? ?
**Fichier:** `src/hooks/useHaptics.ts`

### 4. Option Stripe Retir?e ?
**Fichier:** `src/components/PaymentMethodSelector.tsx`

---

## ?? ?TAPES SUIVANTES

### ?TAPE 1: Appliquer les ProtectedRoute (15 min)

**Fichier ? modifier:** `src/App.tsx`

```tsx
// 1. Importer le composant
import { ProtectedRoute } from "@/components/ProtectedRoute";

// 2. Envelopper les routes prot?g?es
<Route 
  path="/add-property" 
  element={
    <ProtectedRoute>
      <AddProperty />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/messages" 
  element={
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/favorites" 
  element={
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requireAdmin>
      <Admin />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/payment" 
  element={
    <ProtectedRoute>
      <Payment />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/sponsorship/:listingId" 
  element={
    <ProtectedRoute>
      <Sponsorship />
    </ProtectedRoute>
  } 
/>
```

---

### ?TAPE 2: Am?liorer la Carte avec Liste (2h)

**Fichier ? modifier:** `src/pages/Map.tsx`

```tsx
// 1. Importer les nouveaux composants
import MapListingsList from "@/components/MapListingsList";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { List } from "lucide-react";

// 2. Ajouter l'?tat pour le hover
const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);

// 3. Ajouter le bottom sheet dans le return (apr?s la div de la carte)
<div className="w-full h-full">
  <MapboxMap 
    listings={filteredListings} 
    selectedCityCoords={selectedCityCoords} 
    mapStyle={mapStyle}
    hoveredListingId={hoveredListingId}
  />
</div>

{/* Bottom Sheet avec liste des annonces */}
<Sheet>
  <SheetTrigger asChild>
    <Button 
      className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 glass shadow-lg"
      size="lg"
    >
      <List className="w-4 h-4 mr-2" />
      Liste ({filteredListings.length})
    </Button>
  </SheetTrigger>
  <SheetContent 
    side="bottom" 
    className="h-[70vh] overflow-hidden p-0"
  >
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 glass p-4 border-b">
        <h3 className="font-semibold text-lg">
          {filteredListings.length} annonce{filteredListings.length > 1 ? 's' : ''}
        </h3>
      </div>
      <MapListingsList 
        listings={filteredListings}
        onListingHover={setHoveredListingId}
      />
    </div>
  </SheetContent>
</Sheet>
```

**Fichier ? modifier:** `src/components/MapboxMap.tsx`

```tsx
// 1. Ajouter la prop hoveredListingId
interface MapboxMapProps {
  listings: Listing[];
  selectedCityCoords?: {lat: number, lng: number} | null;
  mapStyle?: string;
  hoveredListingId?: string | null; // NOUVEAU
}

// 2. Destructurer la nouvelle prop
const MapboxMap: React.FC<MapboxMapProps> = ({ 
  listings, 
  selectedCityCoords, 
  mapStyle = 'streets',
  hoveredListingId // NOUVEAU
}) => {

// 3. Utiliser hoveredListingId pour mettre en ?vidence le marqueur
// Dans la section o? vous cr?ez les marqueurs, apr?s la ligne 265:

// Stocker les marqueurs dans un objet pour pouvoir les manipuler
const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

// Lors de la cr?ation du marqueur (apr?s la ligne 283):
markersRef.current[listing.id] = marker;

// Ajouter un useEffect pour g?rer le hover
useEffect(() => {
  if (!hoveredListingId) {
    // R?initialiser tous les marqueurs
    Object.values(markersRef.current).forEach(marker => {
      const element = marker.getElement();
      element.style.transform = 'scale(1)';
      element.style.zIndex = '1';
    });
    return;
  }

  // Mettre en ?vidence le marqueur survol?
  const hoveredMarker = markersRef.current[hoveredListingId];
  if (hoveredMarker) {
    const element = hoveredMarker.getElement();
    element.style.transform = 'scale(1.3)';
    element.style.zIndex = '1000';
    
    // Centrer la carte sur ce marqueur
    const lngLat = hoveredMarker.getLngLat();
    map.current?.flyTo({
      center: [lngLat.lng, lngLat.lat],
      zoom: 14,
      duration: 1000
    });
  }
}, [hoveredListingId]);
```

---

### ?TAPE 3: Ajouter les Haptics (1h)

**Fichiers ? modifier:** Tous les composants avec interactions

**Exemple - `src/components/PropertyCard.tsx`:**

```tsx
import { useHaptics } from '@/hooks/useHaptics';

const PropertyCard = ({ listing }) => {
  const { light, success } = useHaptics();
  const { toggleFavorite } = useFavorites();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    light(); // Vibration l?g?re au clic
    const result = await toggleFavorite(listing.id);
    if (result) {
      success(); // Vibration de succ?s
    }
  };

  const handleCardClick = () => {
    light(); // Vibration l?g?re au clic
    navigate(`/listing/${listing.id}`);
  };

  return (
    <Card onClick={handleCardClick}>
      {/* Contenu */}
      <Button onClick={handleFavorite}>
        <Heart />
      </Button>
    </Card>
  );
};
```

**Exemple - `src/components/BottomNavigation.tsx`:**

```tsx
import { useHaptics } from '@/hooks/useHaptics';

const BottomNavigation = () => {
  const { selectionChanged } = useHaptics();

  return (
    <nav>
      {navItems.map((item) => (
        <button
          onClick={() => {
            selectionChanged(); // Vibration lors du changement d'onglet
            navigate(item.path);
          }}
        >
          {/* Contenu */}
        </button>
      ))}
    </nav>
  );
};
```

---

### ?TAPE 4: Ajouter la Validation Zod (3h)

**Installation:**

```bash
# D?j? install? dans package.json ?
```

**Cr?er:** `src/lib/validations.ts`

```typescript
import { z } from 'zod';

// Sch?ma pour les annonces
export const listingSchema = z.object({
  title: z.string()
    .min(10, 'Le titre doit faire au moins 10 caract?res')
    .max(100, 'Le titre ne peut pas d?passer 100 caract?res'),
  
  description: z.string()
    .min(50, 'La description doit faire au moins 50 caract?res')
    .max(5000, 'La description ne peut pas d?passer 5000 caract?res'),
  
  price: z.number()
    .positive('Le prix doit ?tre positif')
    .max(1000000000, 'Prix maximum d?pass?'),
  
  city: z.string()
    .min(2, 'Ville invalide'),
  
  property_type: z.enum(['apartment', 'house', 'land', 'commercial']),
  
  transaction_type: z.enum(['sale', 'rent']),
  
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  surface_area: z.number().positive().max(100000).optional(),
  
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type ListingFormData = z.infer<typeof listingSchema>;

// Sch?ma pour les paiements
export const paymentSchema = z.object({
  amount: z.number()
    .positive('Le montant doit ?tre positif')
    .min(100, 'Montant minimum: 100 FCFA')
    .max(10000000, 'Montant maximum: 10M FCFA'),
  
  phone_number: z.string()
    .regex(/^(\+?225|225)?[0-9]{8,10}$/, 'Num?ro de t?l?phone invalide'),
  
  payment_method: z.enum([
    'ORANGE_MONEY_CI',
    'ORANGE_MONEY_SN',
    'WAVE_CI',
    'WAVE_SN',
    'MOOV_CI',
    'MTN_CI'
  ]),
});

// Sch?ma pour le profil
export const profileSchema = z.object({
  full_name: z.string()
    .min(3, 'Le nom doit faire au moins 3 caract?res')
    .max(100, 'Le nom ne peut pas d?passer 100 caract?res'),
  
  phone: z.string()
    .regex(/^(\+?[0-9]{1,4})?[0-9]{7,15}$/, 'Num?ro de t?l?phone invalide')
    .optional(),
  
  email: z.string()
    .email('Email invalide'),
  
  company_name: z.string()
    .min(2)
    .max(100)
    .optional(),
  
  license_number: z.string()
    .min(3)
    .max(50)
    .optional(),
});
```

**Utiliser dans les formulaires:**

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema, ListingFormData } from '@/lib/validations';

const AddPropertyForm = () => {
  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      // ...
    }
  });

  const onSubmit = async (data: ListingFormData) => {
    // Les donn?es sont d?j? valid?es ?
    const { error } = await supabase
      .from('listings')
      .insert(data);
      
    if (error) {
      toast.error(error.message);
      return;
    }
    
    toast.success('Annonce cr??e !');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Formulaire */}
    </form>
  );
};
```

---

### ?TAPE 5: Ajouter Rate Limiting (4h)

**Option 1: Upstash Redis (Recommand?)**

```bash
# 1. Cr?er compte sur upstash.com
# 2. Cr?er une base Redis
# 3. Copier les credentials
```

**Ajouter dans Supabase Secrets:**
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

**Cr?er:** `supabase/functions/_shared/ratelimit.ts`

```typescript
import { Redis } from "https://esm.sh/@upstash/redis@1.31.3";
import { Ratelimit } from "https://esm.sh/@upstash/ratelimit@1.1.1";

const redis = Redis.fromEnv();

export const createRateLimiter = (maxRequests: number, windowSeconds: number) => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
    analytics: true,
  });
};

// Presets
export const strictRateLimit = createRateLimiter(5, 60); // 5 req/min
export const normalRateLimit = createRateLimiter(20, 60); // 20 req/min
export const relaxedRateLimit = createRateLimiter(100, 60); // 100 req/min
```

**Utiliser dans les edge functions:**

```typescript
// Dans create-cinetpay-payment/index.ts
import { strictRateLimit } from "../_shared/ratelimit.ts";

serve(async (req) => {
  // ... auth ...
  
  // V?rifier rate limit
  const { success, remaining, reset } = await strictRateLimit.limit(user.id);
  
  if (!success) {
    return new Response(JSON.stringify({ 
      error: 'Trop de requ?tes. R?essayez dans quelques minutes.',
      reset: new Date(reset).toISOString()
    }), {
      status: 429,
      headers: corsHeaders
    });
  }
  
  // ... reste du code ...
});
```

**Option 2: Simple In-Memory (Pour d?marrer)**

```typescript
// Cr?er: supabase/functions/_shared/simple-ratelimit.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);

  // Nettoyer les anciennes entr?es
  if (userLimit && now > userLimit.resetAt) {
    requestCounts.delete(userId);
  }

  const current = requestCounts.get(userId);

  if (!current) {
    requestCounts.set(userId, {
      count: 1,
      resetAt: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  return { allowed: true, remaining: maxRequests - current.count };
};
```

---

### ?TAPE 6: Ajouter CSP Headers (30 min)

**Fichier:** `index.html`

```html
<head>
  <!-- Autres meta tags... -->
  
  <!-- Content Security Policy -->
  <meta 
    http-equiv="Content-Security-Policy" 
    content="
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://events.mapbox.com;
      style-src 'self' 'unsafe-inline' https://api.mapbox.com;
      img-src 'self' data: https: blob:;
      font-src 'self' data:;
      connect-src 'self' 
        https://*.supabase.co 
        wss://*.supabase.co 
        https://api.mapbox.com 
        https://events.mapbox.com
        https://api-checkout.cinetpay.com;
      frame-src 'self' https://*.cinetpay.com;
      media-src 'self' blob:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    "
  >
</head>
```

---

## ?? CHECKLIST FINALE

Avant de d?ployer en production:

### S?curit?
- [ ] ProtectedRoute appliqu? sur toutes les routes priv?es
- [ ] Validation Zod sur tous les formulaires
- [ ] Rate limiting sur edge functions critiques
- [ ] CSP headers configur?s
- [ ] Pas de dangerouslySetInnerHTML sans sanitization

### Fonctionnalit?s
- [ ] Paiements CinePay test?s (CI & SN)
- [ ] Option Stripe retir?e ou impl?ment?e
- [ ] Carte avec liste bottom sheet
- [ ] Haptics sur interactions mobiles
- [ ] Hover synchronis? liste<->carte

### Performance
- [ ] Images optimis?es (WebP)
- [ ] Lazy loading actif
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 90

### Mobile
- [ ] Splash screen personnalis?
- [ ] Safe areas iOS/Android
- [ ] Haptic feedback
- [ ] Gestures natifs
- [ ] Build APK test?

---

## ?? D?PLOIEMENT

### 1. Build de Production

```bash
npm run build
```

### 2. Test du Build Localement

```bash
npm run preview
```

### 3. Build Mobile

```bash
# Android
npm run build
npx cap sync
npx cap open android

# iOS (n?cessite macOS)
npm run build
npx cap sync
npx cap open ios
```

### 4. Variables d'Environnement Production

V?rifier que toutes les variables sont configur?es:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Et dans Supabase:
- `MAPBOX_ACCESS_TOKEN`
- `CINETPAY_API_KEY`
- `CINETPAY_SITE_ID`
- `RESEND_API_KEY` (emails)
- `BEEM_API_KEY` (SMS)

---

## ?? NOTES IMPORTANTES

1. **Tester en local** avant chaque d?ploiement
2. **Sauvegarder la base** avant grosse migration
3. **Monitorer les erreurs** avec Sentry (? configurer)
4. **V?rifier les limites** Supabase (bandwidth, storage)
5. **Documenter** tout changement majeur

---

**Besoin d'aide?** Consultez:
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Documentation Mapbox](https://docs.mapbox.com/)
- [Documentation CinePay](https://docs.cinetpay.com/)

Bon d?veloppement! ??
