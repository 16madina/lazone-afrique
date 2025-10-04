import { z } from 'zod';

/**
 * Centralized validation schemas for the application
 * Using Zod for type-safe validation
 */

// Property listing validation schema
export const propertyListingSchema = z.object({
  // Step 1: Property Type
  transactionType: z.enum(['rent', 'sale', 'commercial'], {
    required_error: "Le type de transaction est requis",
  }),
  propertyType: z.string().min(1, "Le type de bien est requis"),
  city: z.string().min(1, "La ville est requise"),
  country: z.string().min(2, "Le pays est requis"),

  // Step 2: Details
  title: z.string()
    .min(10, "Le titre doit contenir au moins 10 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z.string()
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(2000, "La description ne peut pas dépasser 2000 caractères")
    .optional(),
  area: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "La surface doit être un nombre positif",
    })
    .optional(),
  bedrooms: z.string()
    .refine((val) => val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 0), {
      message: "Le nombre de chambres doit être un nombre positif ou nul",
    })
    .optional(),
  bathrooms: z.string()
    .refine((val) => val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 0), {
      message: "Le nombre de salles de bain doit être un nombre positif ou nul",
    })
    .optional(),
  floorNumber: z.string().optional(),
  landType: z.string().optional(),
  landShape: z.string().optional(),

  // Step 3: Price & Contact
  price: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Le prix doit être un nombre positif",
    }),
  
  // Contact info
  fullName: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
});

// Partial schemas for step-by-step validation
export const propertyStep1Schema = propertyListingSchema.pick({
  transactionType: true,
  propertyType: true,
  city: true,
  country: true,
});

export const propertyStep2Schema = propertyListingSchema.pick({
  title: true,
  description: true,
  area: true,
  bedrooms: true,
  bathrooms: true,
  floorNumber: true,
  landType: true,
  landShape: true,
});

export const propertyStep3Schema = propertyListingSchema.pick({
  price: true,
  fullName: true,
  email: true,
  phone: true,
  whatsapp: true,
});

// User signup validation schema
export const signupSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  country: z.string().min(2, "Le pays est requis"),
  city: z.string().min(1, "La ville est requise"),
  neighborhood: z.string().optional(),
  phone: z.string().min(8, "Le numéro de téléphone est invalide"),
  user_type: z.enum(['proprietaire', 'demarcheur', 'agence']),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  company_name: z.string().optional(),
  license_number: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  password: z.string().min(1, "Le mot de passe est requis"),
}).refine((data) => data.email || data.phone, {
  message: "Email ou numéro de téléphone requis",
});

// Contact form validation
export const contactSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  phone: z.string()
    .min(8, "Le numéro de téléphone est invalide")
    .max(20, "Le numéro de téléphone est trop long")
    .optional(),
  message: z.string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
});

// Email validation helper
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

// Phone validation helper
export const validatePhone = (phone: string): boolean => {
  return z.string().min(8).safeParse(phone).success;
};

// Price validation helper
export const validatePrice = (price: string | number): boolean => {
  const priceStr = typeof price === 'number' ? price.toString() : price;
  return z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0).safeParse(priceStr).success;
};
