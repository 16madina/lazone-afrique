import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PropertyCard from '../PropertyCard';
import { CountryProvider } from '@/contexts/CountryContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const mockProperty = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Belle Villa Moderne',
  price: 150000000,
  currencyCode: 'XOF',
  location: 'Cocody, Abidjan',
  type: 'sale' as const,
  propertyType: 'villa' as const,
  surface: 250,
  bedrooms: 4,
  bathrooms: 3,
  agent: {
    name: 'Jean Dupont',
    type: 'agency' as const,
    rating: 4.5,
    verified: true,
    avatar_url: 'https://example.com/avatar.jpg',
    user_id: 'agent-123',
    phone: '+2250707070707'
  },
  features: ['Piscine', 'Jardin', 'Garage', 'Climatisation'],
  isSponsored: false,
  isFavorite: false
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <CountryProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </CountryProvider>
  </QueryClientProvider>
);

describe('PropertyCard', () => {
  it('devrait afficher le titre de la propriété', () => {
    const { container } = render(<PropertyCard {...mockProperty} />, { wrapper: Wrapper });
    expect(container.textContent).toContain('Belle Villa Moderne');
  });

  it('devrait afficher la localisation', () => {
    const { container } = render(<PropertyCard {...mockProperty} />, { wrapper: Wrapper });
    expect(container.textContent).toContain('Cocody, Abidjan');
  });

  it('devrait afficher les caractéristiques de la propriété', () => {
    const { container } = render(<PropertyCard {...mockProperty} />, { wrapper: Wrapper });
    expect(container.textContent).toContain('4'); // chambres
    expect(container.textContent).toContain('3'); // salles de bain
    expect(container.textContent).toContain('250m²'); // surface
  });

  it('devrait afficher le badge de vente', () => {
    const { container } = render(<PropertyCard {...mockProperty} />, { wrapper: Wrapper });
    expect(container.textContent).toContain('Vente');
  });

  it('devrait afficher le badge sponsorisé quand isSponsored est true', () => {
    const { container } = render(<PropertyCard {...mockProperty} isSponsored={true} />, { wrapper: Wrapper });
    expect(container.textContent).toContain('Sponsorisé');
  });

  it('devrait afficher les informations de l\'agent', () => {
    const { container } = render(<PropertyCard {...mockProperty} />, { wrapper: Wrapper });
    expect(container.textContent).toContain('Jean Dupont');
    expect(container.textContent).toContain('Agence');
  });

  it('devrait afficher les 3 premières features + compteur', () => {
    const { container } = render(<PropertyCard {...mockProperty} />, { wrapper: Wrapper });
    expect(container.textContent).toContain('Piscine');
    expect(container.textContent).toContain('Jardin');
    expect(container.textContent).toContain('Garage');
    expect(container.textContent).toContain('+1'); // +1 pour la 4ème feature
  });

  it('devrait afficher la surface correctement pour un terrain', () => {
    const landProperty = {
      ...mockProperty,
      propertyType: 'land' as const,
      bedrooms: undefined,
      bathrooms: undefined
    };
    
    const { container } = render(<PropertyCard {...landProperty} />, { wrapper: Wrapper });
    expect(container.textContent).toContain('250m² de terrain');
  });
});
