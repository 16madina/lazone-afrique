import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  cities: string[];
  exchangeRate: number; // Taux par rapport au USD pour conversion
  coordinates: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

export const africanCountries: Country[] = [
  {
    code: 'ci',
    name: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    currency: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
    cities: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Daloa'],
    exchangeRate: 600,
    coordinates: { lat: 7.5399, lng: -5.5471, zoom: 6 }
  },
  {
    code: 'gn',
    name: 'Guinée',
    flag: '🇬🇳',
    currency: { code: 'GNF', symbol: 'FG', name: 'Franc guinéen' },
    cities: ['Conakry', 'Kankan', 'Labé', 'Kindia', 'Nzérékoré', 'Boké'],
    exchangeRate: 8600,
    coordinates: { lat: 9.9456, lng: -9.6966, zoom: 6 }
  },
  {
    code: 'sn',
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
    cities: ['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Tambacounda'],
    exchangeRate: 600,
    coordinates: { lat: 14.6928, lng: -14.6043, zoom: 6 }
  },
  {
    code: 'ma',
    name: 'Maroc',
    flag: '🇲🇦',
    currency: { code: 'MAD', symbol: 'DH', name: 'Dirham marocain' },
    cities: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir'],
    exchangeRate: 10.2,
    coordinates: { lat: 31.7917, lng: -7.0926, zoom: 5 }
  },
  {
    code: 'ng',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: { code: 'NGN', symbol: '₦', name: 'Naira' },
    cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Kaduna'],
    exchangeRate: 750,
    coordinates: { lat: 9.0765, lng: 7.3986, zoom: 5 }
  },
  {
    code: 'gh',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: { code: 'GHS', symbol: '₵', name: 'Cedi ghanéen' },
    cities: ['Accra', 'Kumasi', 'Tamale', 'Cape Coast', 'Sekondi-Takoradi', 'Sunyani'],
    exchangeRate: 12,
    coordinates: { lat: 7.9465, lng: -1.0232, zoom: 6 }
  },
  {
    code: 'ke',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: { code: 'KES', symbol: 'KSh', name: 'Shilling kenyan' },
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'],
    exchangeRate: 150,
    coordinates: { lat: -0.0236, lng: 37.9062, zoom: 6 }
  },
  {
    code: 'za',
    name: 'Afrique du Sud',
    flag: '🇿🇦',
    currency: { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain' },
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'],
    exchangeRate: 18.5,
    coordinates: { lat: -30.5595, lng: 22.9375, zoom: 5 }
  },
  {
    code: 'tn',
    name: 'Tunisie',
    flag: '🇹🇳',
    currency: { code: 'TND', symbol: 'DT', name: 'Dinar tunisien' },
    cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès'],
    exchangeRate: 3.1,
    coordinates: { lat: 33.8869, lng: 9.5375, zoom: 6 }
  },
  {
    code: 'eg',
    name: 'Égypte',
    flag: '🇪🇬',
    currency: { code: 'EGP', symbol: 'LE', name: 'Livre égyptienne' },
    cities: ['Le Caire', 'Alexandrie', 'Gizeh', 'Sharm el-Sheikh', 'Hurghada', 'Louxor'],
    exchangeRate: 31,
    coordinates: { lat: 26.8206, lng: 30.8025, zoom: 5 }
  },
  {
    code: 'cm',
    name: 'Cameroun',
    flag: '🇨🇲',
    currency: { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA Central' },
    cities: ['Douala', 'Yaoundé', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua'],
    exchangeRate: 600,
    coordinates: { lat: 7.3697, lng: 12.3547, zoom: 6 }
  },
  {
    code: 'rw',
    name: 'Rwanda',
    flag: '🇷🇼',
    currency: { code: 'RWF', symbol: 'FRw', name: 'Franc rwandais' },
    cities: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi', 'Byumba'],
    exchangeRate: 1250,
    coordinates: { lat: -1.9403, lng: 29.8739, zoom: 8 }
  },
  {
    code: 'et',
    name: 'Éthiopie',
    flag: '🇪🇹',
    currency: { code: 'ETB', symbol: 'Br', name: 'Birr éthiopien' },
    cities: ['Addis-Abeba', 'Dire Dawa', 'Mek\'ele', 'Gondar', 'Awasa', 'Bahir Dar'],
    exchangeRate: 55,
    coordinates: { lat: 9.1450, lng: 40.4897, zoom: 5 }
  },
  {
    code: 'tz',
    name: 'Tanzanie',
    flag: '🇹🇿',
    currency: { code: 'TZS', symbol: 'TSh', name: 'Shilling tanzanien' },
    cities: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Mbeya', 'Morogoro'],
    exchangeRate: 2500,
    coordinates: { lat: -6.3690, lng: 34.8888, zoom: 5 }
  },
  {
    code: 'ug',
    name: 'Ouganda',
    flag: '🇺🇬',
    currency: { code: 'UGX', symbol: 'USh', name: 'Shilling ougandais' },
    cities: ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja', 'Mbale'],
    exchangeRate: 3750,
    coordinates: { lat: 1.3733, lng: 32.2903, zoom: 6 }
  }
];

interface CountryContextType {
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
  countries: Country[];
  formatPrice: (priceInUSD: number) => string;
  formatLocalPrice: (priceInLocalCurrency: number) => string;
  convertPrice: (priceInUSD: number, targetCountry?: Country) => number;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

interface CountryProviderProps {
  children: React.ReactNode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({ children }) => {
  // Default to Côte d'Ivoire
  const [selectedCountry, setSelectedCountry] = useState<Country>(africanCountries[0]);

  // Detect user's country by geolocation
  const detectUserCountry = async () => {
    try {
      if (!navigator.geolocation) {
        console.log('Géolocalisation non supportée');
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Simple mapping of coordinates to African countries
      const countryFromCoords = getCountryFromCoordinates(latitude, longitude);
      if (countryFromCoords) {
        const country = africanCountries.find(c => c.code === countryFromCoords);
        if (country && !localStorage.getItem('selectedCountry')) {
          setSelectedCountry(country);
          localStorage.setItem('selectedCountry', country.code);
          console.log(`Pays détecté automatiquement: ${country.name}`);
        }
      }
    } catch (error) {
      console.log('Impossible de détecter la localisation:', error);
    }
  };

  // Simple function to map coordinates to country codes
  const getCountryFromCoordinates = (lat: number, lng: number): string | null => {
    // West Africa region
    if (lat >= 4 && lat <= 15 && lng >= -17 && lng <= 3) {
      if (lng >= -8.6 && lng <= -2.5 && lat >= 4.3 && lat <= 10.7) return 'ci'; // Côte d'Ivoire
      if (lng >= -17 && lng <= -11.4 && lat >= 12.3 && lat <= 16.7) return 'sn'; // Sénégal  
      if (lng >= -15 && lng <= -7.6 && lat >= 7.3 && lat <= 12.7) return 'gn'; // Guinée
      if (lng >= -1 && lng <= 4 && lat >= 6 && lat <= 11.2) return 'gh'; // Ghana
      if (lng >= 2.7 && lng <= 14.7 && lat >= 4.3 && lat <= 13.9) return 'ng'; // Nigeria
      if (lng >= 8 && lng <= 16 && lat >= 1.7 && lat <= 13) return 'cm'; // Cameroun
    }
    
    // North Africa
    if (lat >= 15 && lat <= 37 && lng >= -17 && lng <= 37) {
      if (lng >= -13 && lng <= -1 && lat >= 21 && lat <= 35.9) return 'ma'; // Maroc
      if (lng >= 7.5 && lng <= 11.6 && lat >= 30.2 && lat <= 37.5) return 'tn'; // Tunisie
      if (lng >= 25 && lng <= 36 && lat >= 22 && lat <= 31.7) return 'eg'; // Égypte
    }
    
    // East Africa
    if (lat >= -12 && lat <= 15 && lng >= 29 && lng <= 45) {
      if (lng >= 33.9 && lng <= 41.9 && lat >= -1.5 && lat <= 5.0) return 'ke'; // Kenya
      if (lng >= 29.3 && lng <= 35.0 && lat >= -11.7 && lat <= -0.95) return 'tz'; // Tanzanie
      if (lng >= 29.6 && lng <= 35.0 && lat >= -1.5 && lat <= 4.2) return 'ug'; // Ouganda
      if (lng >= 28.9 && lng <= 30.9 && lat >= -2.8 && lat <= -1.0) return 'rw'; // Rwanda
      if (lng >= 32.9 && lng <= 48.0 && lat >= 3.4 && lat <= 15.0) return 'et'; // Éthiopie
    }
    
    // Southern Africa
    if (lat >= -35 && lat <= -15 && lng >= 16 && lng <= 33) {
      if (lng >= 16.5 && lng <= 32.9 && lat >= -34.8 && lat <= -22.1) return 'za'; // Afrique du Sud
    }
    
    return null;
  };

  // Load saved country from localStorage or detect automatically
  useEffect(() => {
    const savedCountryCode = localStorage.getItem('selectedCountry');
    if (savedCountryCode) {
      const country = africanCountries.find(c => c.code === savedCountryCode);
      if (country) {
        setSelectedCountry(country);
        return;
      }
    }
    
    // Only auto-detect if no country was saved
    detectUserCountry();
  }, []);

  // Save country to localStorage when changed
  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    localStorage.setItem('selectedCountry', country.code);
  };

  // Convert price from USD to local currency
  const convertPrice = (priceInUSD: number, targetCountry?: Country): number => {
    const country = targetCountry || selectedCountry;
    return Math.round(priceInUSD * country.exchangeRate);
  };

  // Format price with local currency
  const formatPrice = (priceInUSD: number): string => {
    const convertedPrice = convertPrice(priceInUSD);
    const currency = selectedCountry.currency;
    
    // Format number with spaces for readability
    const formattedNumber = convertedPrice.toLocaleString('fr-FR');
    
    return `${formattedNumber} ${currency.symbol}`;
  };

  // Format price that's already in local currency
  const formatLocalPrice = (priceInLocalCurrency: number): string => {
    const currency = selectedCountry.currency;
    
    // Format number with spaces for readability
    const formattedNumber = priceInLocalCurrency.toLocaleString('fr-FR');
    
    return `${formattedNumber} ${currency.symbol}`;
  };

  const value: CountryContextType = {
    selectedCountry,
    setSelectedCountry: handleCountryChange,
    countries: africanCountries,
    formatPrice,
    formatLocalPrice,
    convertPrice
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};