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
}

export const africanCountries: Country[] = [
  {
    code: 'ci',
    name: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    currency: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
    cities: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Daloa'],
    exchangeRate: 600
  },
  {
    code: 'gn',
    name: 'Guinée',
    flag: '🇬🇳',
    currency: { code: 'GNF', symbol: 'FG', name: 'Franc guinéen' },
    cities: ['Conakry', 'Kankan', 'Labé', 'Kindia', 'Nzérékoré', 'Boké'],
    exchangeRate: 8600
  },
  {
    code: 'sn',
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
    cities: ['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Tambacounda'],
    exchangeRate: 600
  },
  {
    code: 'ma',
    name: 'Maroc',
    flag: '🇲🇦',
    currency: { code: 'MAD', symbol: 'DH', name: 'Dirham marocain' },
    cities: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir'],
    exchangeRate: 10.2
  },
  {
    code: 'ng',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: { code: 'NGN', symbol: '₦', name: 'Naira' },
    cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Kaduna'],
    exchangeRate: 750
  },
  {
    code: 'gh',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: { code: 'GHS', symbol: '₵', name: 'Cedi ghanéen' },
    cities: ['Accra', 'Kumasi', 'Tamale', 'Cape Coast', 'Sekondi-Takoradi', 'Sunyani'],
    exchangeRate: 12
  },
  {
    code: 'ke',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: { code: 'KES', symbol: 'KSh', name: 'Shilling kenyan' },
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'],
    exchangeRate: 150
  },
  {
    code: 'za',
    name: 'Afrique du Sud',
    flag: '🇿🇦',
    currency: { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain' },
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'],
    exchangeRate: 18.5
  },
  {
    code: 'tn',
    name: 'Tunisie',
    flag: '🇹🇳',
    currency: { code: 'TND', symbol: 'DT', name: 'Dinar tunisien' },
    cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès'],
    exchangeRate: 3.1
  },
  {
    code: 'eg',
    name: 'Égypte',
    flag: '🇪🇬',
    currency: { code: 'EGP', symbol: 'LE', name: 'Livre égyptienne' },
    cities: ['Le Caire', 'Alexandrie', 'Gizeh', 'Sharm el-Sheikh', 'Hurghada', 'Louxor'],
    exchangeRate: 31
  },
  {
    code: 'cm',
    name: 'Cameroun',
    flag: '🇨🇲',
    currency: { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA Central' },
    cities: ['Douala', 'Yaoundé', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua'],
    exchangeRate: 600
  },
  {
    code: 'rw',
    name: 'Rwanda',
    flag: '🇷🇼',
    currency: { code: 'RWF', symbol: 'FRw', name: 'Franc rwandais' },
    cities: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi', 'Byumba'],
    exchangeRate: 1250
  },
  {
    code: 'et',
    name: 'Éthiopie',
    flag: '🇪🇹',
    currency: { code: 'ETB', symbol: 'Br', name: 'Birr éthiopien' },
    cities: ['Addis-Abeba', 'Dire Dawa', 'Mek\'ele', 'Gondar', 'Awasa', 'Bahir Dar'],
    exchangeRate: 55
  },
  {
    code: 'tz',
    name: 'Tanzanie',
    flag: '🇹🇿',
    currency: { code: 'TZS', symbol: 'TSh', name: 'Shilling tanzanien' },
    cities: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Mbeya', 'Morogoro'],
    exchangeRate: 2500
  },
  {
    code: 'ug',
    name: 'Ouganda',
    flag: '🇺🇬',
    currency: { code: 'UGX', symbol: 'USh', name: 'Shilling ougandais' },
    cities: ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja', 'Mbale'],
    exchangeRate: 3750
  }
];

interface CountryContextType {
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
  countries: Country[];
  formatPrice: (priceInUSD: number) => string;
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

  // Load saved country from localStorage
  useEffect(() => {
    const savedCountryCode = localStorage.getItem('selectedCountry');
    if (savedCountryCode) {
      const country = africanCountries.find(c => c.code === savedCountryCode);
      if (country) {
        setSelectedCountry(country);
      }
    }
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

  const value: CountryContextType = {
    selectedCountry,
    setSelectedCountry: handleCountryChange,
    countries: africanCountries,
    formatPrice,
    convertPrice
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};