// Mock property data for different African countries
// Prices are stored in USD for easy conversion

import apartmentImage from "@/assets/property-apartment.jpg";
import houseImage from "@/assets/property-house.jpg";
import landImage from "@/assets/property-land.jpg";

interface MockProperty {
  id: string;
  title: string;
  priceUSD: number; // Base price in USD for conversion
  location: string;
  country: string; // Country code
  type: "sale" | "rent" | "commercial";
  propertyType: "apartment" | "house" | "villa" | "land" | "commercial";
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  surface: number;
  agent: {
    name: string;
    type: "individual" | "agency" | "broker";
    rating: number;
    verified: boolean;
  };
  features: string[];
  isSponsored?: boolean;
  isFavorite?: boolean;
}

export const mockProperties: MockProperty[] = [
  // Côte d'Ivoire
  {
    id: "ci-1",
    title: "Villa moderne avec piscine à Cocody",
    priceUSD: 140000,
    location: "Cocody, Abidjan",
    country: "ci",
    type: "sale",
    propertyType: "villa",
    image: houseImage,
    bedrooms: 4,
    bathrooms: 3,
    surface: 200,
    agent: {
      name: "Kouadio Immobilier",
      type: "agency",
      rating: 4.8,
      verified: true
    },
    features: ["Piscine", "Garage", "Climatisation", "Sécurité 24h"],
    isSponsored: true,
    isFavorite: false
  },
  {
    id: "ci-2",
    title: "Appartement standing Plateau",
    priceUSD: 420,
    location: "Plateau, Abidjan",
    country: "ci",
    type: "rent",
    propertyType: "apartment",
    image: apartmentImage,
    bedrooms: 2,
    bathrooms: 1,
    surface: 80,
    agent: {
      name: "Marie Adjoua",
      type: "individual",
      rating: 4.5,
      verified: true
    },
    features: ["Meublé", "Climatisation", "Balcon"],
    isSponsored: false,
    isFavorite: true
  },
  
  // Guinée
  {
    id: "gn-1",
    title: "Belle résidence à Kaloum",
    priceUSD: 85000,
    location: "Kaloum, Conakry",
    country: "gn",
    type: "sale",
    propertyType: "house",
    image: houseImage,
    bedrooms: 3,
    bathrooms: 2,
    surface: 150,
    agent: {
      name: "Mamadou Diallo",
      type: "individual",
      rating: 4.3,
      verified: true
    },
    features: ["Jardin", "Garage", "Sécurité"],
    isSponsored: false,
    isFavorite: false
  },
  {
    id: "gn-2",
    title: "Terrain constructible Dixinn",
    priceUSD: 45000,
    location: "Dixinn, Conakry",
    country: "gn",
    type: "sale",
    propertyType: "land",
    image: landImage,
    surface: 600,
    agent: {
      name: "Fanta Camara",
      type: "broker",
      rating: 4.1,
      verified: false
    },
    features: ["Titre foncier", "Eau", "Électricité"],
    isSponsored: true,
    isFavorite: false
  },

  // Sénégal
  {
    id: "sn-1",
    title: "Villa de luxe aux Almadies",
    priceUSD: 250000,
    location: "Almadies, Dakar",
    country: "sn",
    type: "sale",
    propertyType: "villa",
    image: houseImage,
    bedrooms: 5,
    bathrooms: 4,
    surface: 300,
    agent: {
      name: "Dakar Premium Properties",
      type: "agency",
      rating: 4.9,
      verified: true
    },
    features: ["Vue mer", "Piscine", "Garage double", "Jardin tropical"],
    isSponsored: true,
    isFavorite: false
  },

  // Maroc
  {
    id: "ma-1",
    title: "Riad traditionnel Médina",
    priceUSD: 180000,
    location: "Médina, Marrakech",
    country: "ma",
    type: "sale",
    propertyType: "house",
    image: houseImage,
    bedrooms: 4,
    bathrooms: 3,
    surface: 220,
    agent: {
      name: "Atlas Immobilier",
      type: "agency",
      rating: 4.7,
      verified: true
    },
    features: ["Architecture traditionnelle", "Patio", "Terrasse", "Rénové"],
    isSponsored: false,
    isFavorite: false
  },

  // Nigeria
  {
    id: "ng-1",
    title: "Luxury apartment Victoria Island",
    priceUSD: 350000,
    location: "Victoria Island, Lagos",
    country: "ng",
    type: "sale",
    propertyType: "apartment",
    image: apartmentImage,
    bedrooms: 3,
    bathrooms: 2,
    surface: 120,
    agent: {
      name: "Lagos Elite Properties",
      type: "agency",
      rating: 4.6,
      verified: true
    },
    features: ["Vue lagune", "Piscine commune", "Gym", "Sécurité 24h"],
    isSponsored: true,
    isFavorite: false
  },

  // Ghana
  {
    id: "gh-1",
    title: "Modern family house East Legon",
    priceUSD: 120000,
    location: "East Legon, Accra",
    country: "gh",
    type: "sale",
    propertyType: "house",
    image: houseImage,
    bedrooms: 4,
    bathrooms: 3,
    surface: 180,
    agent: {
      name: "Kwame Asante",
      type: "individual",
      rating: 4.4,
      verified: true
    },
    features: ["Garage", "Jardin", "Sécurité", "Moderne"],
    isSponsored: false,
    isFavorite: false
  },

  // Kenya
  {
    id: "ke-1",
    title: "Penthouse Westlands",
    priceUSD: 280000,
    location: "Westlands, Nairobi",
    country: "ke",
    type: "sale",
    propertyType: "apartment",
    image: apartmentImage,
    bedrooms: 3,
    bathrooms: 2,
    surface: 140,
    agent: {
      name: "Nairobi Heights Real Estate",
      type: "agency",
      rating: 4.8,
      verified: true
    },
    features: ["Vue panoramique", "Terrasse", "Parking", "Ascenseur"],
    isSponsored: false,
    isFavorite: false
  },

  // Afrique du Sud
  {
    id: "za-1",
    title: "Oceanfront villa Cape Town",
    priceUSD: 450000,
    location: "Camps Bay, Cape Town",
    country: "za",
    type: "sale",
    propertyType: "villa",
    image: houseImage,
    bedrooms: 5,
    bathrooms: 4,
    surface: 350,
    agent: {
      name: "Atlantic Seaboard Properties",
      type: "agency",
      rating: 4.9,
      verified: true
    },
    features: ["Vue océan", "Piscine infinity", "Garage triple", "Jardin"],
    isSponsored: true,
    isFavorite: false
  }
];

export const getPropertiesByCountry = (countryCode: string): MockProperty[] => {
  return mockProperties.filter(property => property.country === countryCode);
};