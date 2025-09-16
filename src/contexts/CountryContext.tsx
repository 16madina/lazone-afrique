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
    cities: ['Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'San-Pédro', 'Korhogo', 'Man', 'Abengourou', 'Divo', 'Gagnoa', 'Anyama', 'Agboville', 'Dabou', 'Grand-Bassam', 'Jacqueville', 'Tiassalé', 'Adzopé', 'Alépé', 'Bondoukou', 'Tanda', 'Bouna', 'Nassian', 'Doropo', 'Téhini', 'Ferkessédougou', 'Boundiali', 'Odienné', 'Minignan', 'Samatiguila', 'Touba', 'Biankouma', 'Danané', 'Bangolo', 'Duékoué', 'Guiglo', 'Toulepleu', 'Tabou', 'Soubré', 'Méagui', 'Buyo', 'Issia', 'Sinfra', 'Oumé', 'Lakota'],
    exchangeRate: 600,
    coordinates: { lat: 7.5399, lng: -5.5471, zoom: 6 }
  },
  {
    code: 'gn',
    name: 'Guinée',
    flag: '🇬🇳',
    currency: { code: 'GNF', symbol: 'FG', name: 'Franc guinéen' },
    cities: ['Conakry', 'Kankan', 'Labé', 'Nzérékoré', 'Kindia', 'Mamou', 'Boké', 'Faranah', 'Kissidougou', 'Guéckédou', 'Siguiri', 'Kouroussa', 'Mandiana', 'Dabola', 'Dinguiraye', 'Télimélé', 'Gaoual', 'Koundara', 'Mali-ville', 'Tougué', 'Koubia', 'Lélouma', 'Pita', 'Dalaba', 'Macenta', 'Yomou', 'Lola', 'Beyla', 'Kerouané', 'Coyah', 'Forécariah', 'Boffa', 'Fria', 'Sangarédi', 'Kamsar'],
    exchangeRate: 8600,
    coordinates: { lat: 9.9456, lng: -9.6966, zoom: 6 }
  },
  {
    code: 'sn',
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
    cities: ['Dakar', 'Thiès', 'Kaolack', 'Ziguinchor', 'Saint-Louis', 'Tambacounda', 'Mbour', 'Diourbel', 'Louga', 'Kolda', 'Rufisque', 'Pikine', 'Guédiawaye', 'Touba', 'Fatick', 'Sédhiou', 'Kédougou', 'Matam', 'Kaffrine', 'Linguère', 'Podor', 'Dagana', 'Richard-Toll', 'Bakel', 'Saraya', 'Vélingara', 'Bignona', 'Oussouye', 'Foundiougne', 'Gossas', 'Sokone', 'Bambey', 'Mbacké'],
    exchangeRate: 600,
    coordinates: { lat: 14.6928, lng: -14.6043, zoom: 6 }
  },
  {
    code: 'ma',
    name: 'Maroc',
    flag: '🇲🇦',
    currency: { code: 'MAD', symbol: 'DH', name: 'Dirham marocain' },
    cities: ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'Mohammedia', 'Khouribga', 'El Jadida', 'Béni Mellal', 'Nador', 'Taza', 'Settat', 'Larache', 'Ksar el-Kebir', 'Sale', 'Berrechid', 'Khemisset', 'Inezgane', 'Ouarzazate', 'Sidi Kacem', 'Taourirt', 'Berkane', 'Sidi Slimane', 'Errachidia', 'Guelmim', 'Ait Melloul', 'Laayoune', 'Tiznit', 'Taroudant'],
    exchangeRate: 10.2,
    coordinates: { lat: 31.7917, lng: -7.0926, zoom: 5 }
  },
  {
    code: 'ng',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: { code: 'NGN', symbol: '₦', name: 'Naira' },
    cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Kaduna', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin', 'Oyo', 'Enugu', 'Abeokuta', 'Ogbomoso', 'Sokoto', 'Onitsha', 'Warri', 'Okene', 'Calabar', 'Uyo', 'Abakaliki', 'Bauchi', 'Akure', 'Makurdi', 'Lafia', 'Gombe', 'Umuahia', 'Osogbo', 'Ado-Ekiti', 'Lokoja', 'Awka', 'Owerri', 'Asaba', 'Jalingo', 'Yenagoa', 'Dutse', 'Gusau', 'Birnin Kebbi'],
    exchangeRate: 750,
    coordinates: { lat: 9.0765, lng: 7.3986, zoom: 5 }
  },
  {
    code: 'gh',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: { code: 'GHS', symbol: '₵', name: 'Cedi ghanéen' },
    cities: ['Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Cape Coast', 'Tema', 'Ho', 'Koforidua', 'Sunyani', 'Wa', 'Techiman', 'Obuasi', 'Tarkwa', 'Prestea', 'Axim', 'Half Assini', 'Elubo', 'Nkroful', 'Elmina', 'Winneba', 'Kasoa', 'Swedru', 'Saltpond', 'Agona Swedru', 'Dunkwa-on-Offin', 'Oduponkpehe', 'Oda', 'Akim Oda', 'Kibi', 'Nkawkaw', 'Mpraeso', 'Abetifi', 'Begoro', 'Somanya', 'Akuse'],
    exchangeRate: 12,
    coordinates: { lat: 7.9465, lng: -1.0232, zoom: 6 }
  },
  {
    code: 'ke',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: { code: 'KES', symbol: 'KSh', name: 'Shilling kenyan' },
    cities: ['Nairobi', 'Mombasa', 'Nakuru', 'Eldoret', 'Kisumu', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho', 'Embu', 'Migori', 'Homa Bay', 'Kilifi', 'Isiolo', 'Nanyuki', 'Voi', 'Bungoma', 'Siaya', 'Kitui', 'Kabarnet', 'Kapenguria', 'Maralal', 'Marsabit', 'Moyale', 'Lodwar', 'Lokichoggio', 'Mandera', 'Wajir', 'El Wak', 'Takaba'],
    exchangeRate: 150,
    coordinates: { lat: -0.0236, lng: 37.9062, zoom: 6 }
  },
  {
    code: 'za',
    name: 'Afrique du Sud',
    flag: '🇿🇦',
    currency: { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain' },
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Pietermaritzburg', 'Benoni', 'Tembisa', 'East London', 'Vereeniging', 'Bloemfontein', 'Boksburg', 'Welkom', 'Newcastle', 'Krugersdorp', 'Diepsloot', 'Botshabelo', 'Brakpan', 'Witbank', 'Oberholzer', 'Centurion', 'Springer', 'Klerksdorp', 'Midrand', 'Roodepoort', 'Uitenhage', 'Polokwane', 'Potchefstroom', 'Carletonville', 'Rustenburg'],
    exchangeRate: 18.5,
    coordinates: { lat: -30.5595, lng: 22.9375, zoom: 5 }
  },
  {
    code: 'tn',
    name: 'Tunisie',
    flag: '🇹🇳',
    currency: { code: 'TND', symbol: 'DT', name: 'Dinar tunisien' },
    cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous', 'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Beja', 'Jendouba', 'Mahdia', 'Siliana', 'Manouba', 'Zaghouan', 'Tozeur', 'Kebili', 'Sidi Bouzid', 'Kef', 'Hammamet', 'Djerba', 'Zarzis', 'Korba', 'Grombalia', 'Soliman'],
    exchangeRate: 3.1,
    coordinates: { lat: 33.8869, lng: 9.5375, zoom: 6 }
  },
  {
    code: 'eg',
    name: 'Égypte',
    flag: '🇪🇬',
    currency: { code: 'EGP', symbol: 'LE', name: 'Livre égyptienne' },
    cities: ['Le Caire', 'Alexandrie', 'Gizeh', 'Shubra el-Kheima', 'Port-Saïd', 'Suez', 'Luxor', 'al-Mahalla al-Kubra', 'Mansourah', 'Tanta', 'Assiout', 'Ismaïlia', 'Fayyoum', 'Zagazig', 'Assouan', 'Damiette', 'al-Minya', 'Damanhur', 'Beni Suef', 'Hurghada', 'Qena', 'Sohag', 'Shibin al-Kom', 'Banha', 'Kafr el-Sheikh', 'Arish', 'Mallawi', '10th of Ramadan City', 'Bilbays', 'Marsa Matruh'],
    exchangeRate: 31,
    coordinates: { lat: 26.8206, lng: 30.8025, zoom: 5 }
  },
  {
    code: 'cm',
    name: 'Cameroun',
    flag: '🇨🇲',
    currency: { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA Central' },
    cities: ['Yaoundé', 'Douala', 'Garoua', 'Bafoussam', 'Bamenda', 'Maroua', 'Nkongsamba', 'Bertoua', 'Loum', 'Kumba', 'Edéa', 'Foumban', 'Ebolowa', 'Kribi', 'Limbe', 'Dschang', 'Mbouda', 'Bafang', 'Bandjoun', 'Baham', 'Bangangté', 'Manjo', 'Mbanga', 'Penja', 'Njombé', 'Kekem', 'Foumbot', 'Koutaba', 'Galim', 'Magba'],
    exchangeRate: 600,
    coordinates: { lat: 7.3697, lng: 12.3547, zoom: 6 }
  },
  {
    code: 'rw',
    name: 'Rwanda',
    flag: '🇷🇼',
    currency: { code: 'RWF', symbol: 'FRw', name: 'Franc rwandais' },
    cities: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi', 'Byumba', 'Cyangugu', 'Kibungo', 'Kibuye', 'Gikongoro', 'Umutara', 'Kigoma', 'Nyanza', 'Muhanga', 'Musanze', 'Rubavu', 'Nyagatare', 'Kayonza', 'Rusizi', 'Karongi', 'Nyaruguru', 'Gicumbi', 'Rulindo', 'Gakenke', 'Burera'],
    exchangeRate: 1250,
    coordinates: { lat: -1.9403, lng: 29.8739, zoom: 8 }
  },
  {
    code: 'et',
    name: 'Éthiopie',
    flag: '🇪🇹',
    currency: { code: 'ETB', symbol: 'Br', name: 'Birr éthiopien' },
    cities: ['Addis-Abeba', 'Dire Dawa', 'Mekelle', 'Gondar', 'Adama', 'Awasa', 'Bahir Dar', 'Dessie', 'Jimma', 'Jijiga', 'Shashamane', 'Bishoftu', 'Sodo', 'Arba Minch', 'Hosaena', 'Harar', 'Dilla', 'Nekemte', 'Debre Markos', 'Adigrat', 'Aksum', 'Shire', 'Alamata', 'Wukro', 'Maychew', 'Korem', 'Lalibela', 'Debre Tabor', 'Finote Selam', 'Injibara'],
    exchangeRate: 55,
    coordinates: { lat: 9.1450, lng: 40.4897, zoom: 5 }
  },
  {
    code: 'tz',
    name: 'Tanzanie',
    flag: '🇹🇿',
    currency: { code: 'TZS', symbol: 'TSh', name: 'Shilling tanzanien' },
    cities: ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya', 'Morogoro', 'Tanga', 'Kahama', 'Tabora', 'Zanzibar City', 'Kigoma', 'Sumbawanga', 'Kasulu', 'Musoma', 'Shinyanga', 'Iringa', 'Singida', 'Njombe', 'Bukoba', 'Mtwara', 'Lindi', 'Songea', 'Mpanda', 'Makete', 'Kyela', 'Mbozi', 'Rungwe', 'Mbarali', 'Kilosa', 'Mvomero'],
    exchangeRate: 2500,
    coordinates: { lat: -6.3690, lng: 34.8888, zoom: 5 }
  },
  {
    code: 'ug',
    name: 'Ouganda',
    flag: '🇺🇬',
    currency: { code: 'UGX', symbol: 'USh', name: 'Shilling ougandais' },
    cities: ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja', 'Bwizibwera', 'Mbale', 'Mukono', 'Kasese', 'Masaka', 'Entebbe', 'Njeru', 'Kitgum', 'Arua', 'Koboko', 'Yumbe', 'Moyo', 'Adjumani', 'Nebbi', 'Pakwach', 'Masindi', 'Hoima', 'Kibaale', 'Kyenjojo', 'Kabarole', 'Bundibugyo', 'Ntoroko', 'Kamwenge', 'Ibanda', 'Kiruhura'],
    exchangeRate: 3750,
    coordinates: { lat: 1.3733, lng: 32.2903, zoom: 6 }
  },
  {
    code: 'dz',
    name: 'Algérie',
    flag: '🇩🇿',
    currency: { code: 'DZD', symbol: 'DA', name: 'Dinar algérien' },
    cities: ['Alger', 'Oran', 'Constantine', 'Batna', 'Djelfa', 'Sétif', 'Annaba', 'Sidi Bel Abbès', 'Biskra', 'Témouchent', 'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa', 'Tlemcen', 'Ouargla', 'Blida', 'Jijel', 'Relizane', 'Médéa', 'Tindouf', 'Mascara', 'Oum el-Bouaghi', 'El Bayadh', 'Bordj Bou Arréridj', 'Chlef', 'Laghouat', 'Souk Ahras', 'Bouïra'],
    exchangeRate: 134,
    coordinates: { lat: 28.0339, lng: 1.6596, zoom: 5 }
  },
  {
    code: 'ly',
    name: 'Libye',
    flag: '🇱🇾',
    currency: { code: 'LYD', symbol: 'LD', name: 'Dinar libyen' },
    cities: ['Tripoli', 'Benghazi', 'Misratah', 'Tarhuna', 'al-Bayda', 'Zawiya', 'Zuwara', 'Ajdabiya', 'Tobrouk', 'Sabha', 'Sirte', 'al-Marj', 'Ubari', 'Ghat', 'Murzuq', 'Hun', 'Bani Walid', 'Yafran', 'Nalut', 'Gharyan', 'al-Khums', 'Zliten', 'Derna', 'Shahat', 'Qaminis', 'al-Abyar', 'Tocra', 'Cyrène', 'Apollonia', 'Taucheira'],
    exchangeRate: 4.8,
    coordinates: { lat: 26.3351, lng: 17.2283, zoom: 5 }
  },
  {
    code: 'ml',
    name: 'Mali',
    flag: '🇲🇱',
    currency: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
    cities: ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes', 'Ségou', 'Gao', 'Kidal', 'Tombouctou', 'Djenné', 'Kati', 'Kolokani', 'Niono', 'San', 'Bandiagara', 'Douentza', 'Youwarou', 'Ténenkou', 'Niafunké', 'Gourma-Rharous', 'Ansongo', 'Bourem', 'Ménaka', 'Tessalit', 'Aguelhok', 'Abeibara', 'Tin-Essako', 'Koulikoro', 'Kangaba', 'Yanfolila'],
    exchangeRate: 600,
    coordinates: { lat: 17.5707, lng: -3.9962, zoom: 5 }
  },
  {
    code: 'bf',
    name: 'Burkina Faso',
    flag: '🇧🇫',
    currency: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
    cities: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Kaya', 'Tenkodogo', 'Dori', 'Gaoua', 'Ziniaré', 'Réo', 'Manga', 'Zabré', 'Pouytenga', 'Garango', 'Bittou', 'Fada N\'Gourma', 'Diapaga', 'Bogandé', 'Diébougou', 'Batié', 'Dissin', 'Sindou', 'Orodara', 'Solenzo', 'Nouna', 'Dédougou', 'Boromo', 'Houndé', 'Safané'],
    exchangeRate: 600,
    coordinates: { lat: 12.2383, lng: -1.5616, zoom: 6 }
  },
  {
    code: 'ne',
    name: 'Niger',
    flag: '🇳🇪',
    currency: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA' },
    cities: ['Niamey', 'Zinder', 'Maradi', 'Tahoua', 'Agadez', 'Arlit', 'Dosso', 'Tillabéri', 'Diffa', 'Nguigmi', 'Mayahi', 'Tessaoua', 'Aguié', 'Dakoro', 'Guidan Roumji', 'Madarounfa', 'Tibiri', 'Bouza', 'Keïta', 'Madaoua', 'Malbaza', 'Illéla', 'Konni', 'Birni N\'Konni', 'Abalak', 'Tchintabaraden', 'Ingall', 'Tassara', 'Bilma', 'N\'Gourti'],
    exchangeRate: 600,
    coordinates: { lat: 17.6078, lng: 8.0817, zoom: 5 }
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