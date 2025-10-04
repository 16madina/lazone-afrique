import { describe, it, expect } from 'vitest';
import { 
  propertyStep1Schema, 
  signupSchema, 
  loginSchema 
} from '../validationSchemas';

describe('validationSchemas', () => {
  describe('propertyStep1Schema', () => {
    it('devrait valider un objet correct', () => {
      const validData = {
        transactionType: 'sale',
        propertyType: 'villa',
        city: 'Abidjan',
        country: 'CI'
      };

      const result = propertyStep1Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un type de transaction invalide', () => {
      const invalidData = {
        transactionType: 'invalid',
        propertyType: 'villa',
        city: 'Abidjan',
        country: 'CI'
      };

      const result = propertyStep1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter une ville vide', () => {
      const invalidData = {
        transactionType: 'sale',
        propertyType: 'villa',
        city: '',
        country: 'CI'
      };

      const result = propertyStep1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('devrait valider un formulaire d\'inscription correct', () => {
      const validData = {
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'test@example.com',
        country: 'CI',
        city: 'Abidjan',
        phone: '0707070707',
        user_type: 'proprietaire',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!'
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un email invalide', () => {
      const invalidData = {
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'invalid-email',
        country: 'CI',
        city: 'Abidjan',
        phone: '0707070707',
        user_type: 'proprietaire',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!'
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter des mots de passe non correspondants', () => {
      const invalidData = {
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'test@example.com',
        country: 'CI',
        city: 'Abidjan',
        phone: '0707070707',
        user_type: 'proprietaire',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!'
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('devrait valider un formulaire de connexion avec email', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait valider un formulaire de connexion avec téléphone', () => {
      const validData = {
        phone: '0707070707',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un formulaire sans email ni téléphone', () => {
      const invalidData = {
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
