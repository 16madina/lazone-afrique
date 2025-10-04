import { describe, it, expect } from 'vitest';
import { 
  validatePassword, 
  getPasswordStrengthLabel, 
  getPasswordStrengthColor 
} from '../passwordValidator';

describe('passwordValidator', () => {
  describe('validatePassword', () => {
    it('devrait rejeter les mots de passe trop courts', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(2);
    });

    it('devrait accepter les mots de passe forts', () => {
      const result = validatePassword('StrongPassword123!@#');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(2);
    });

    it('devrait détecter les mots de passe faibles sans caractères spéciaux', () => {
      const result = validatePassword('weakpassword123');
      expect(result.score).toBeLessThan(4);
    });

    it('devrait donner un score élevé aux mots de passe complexes', () => {
      const result = validatePassword('C0mpl3x!P@ssw0rd#2024');
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('devrait calculer correctement la force pour différentes longueurs', () => {
      const short = validatePassword('Test123!');
      const medium = validatePassword('TestPassword123!');
      const long = validatePassword('VeryLongAndComplexPassword123!@#$');
      
      expect(medium.score).toBeGreaterThanOrEqual(short.score);
      expect(long.score).toBeGreaterThanOrEqual(medium.score);
    });
  });

  describe('getPasswordStrengthLabel', () => {
    it('devrait retourner "Très faible" pour score 0', () => {
      expect(getPasswordStrengthLabel(0)).toBe('Très faible');
    });

    it('devrait retourner "Faible" pour score 1', () => {
      expect(getPasswordStrengthLabel(1)).toBe('Faible');
    });

    it('devrait retourner "Moyen" pour score 2', () => {
      expect(getPasswordStrengthLabel(2)).toBe('Moyen');
    });

    it('devrait retourner "Fort" pour score 3', () => {
      expect(getPasswordStrengthLabel(3)).toBe('Fort');
    });

    it('devrait retourner "Très fort" pour score 4', () => {
      expect(getPasswordStrengthLabel(4)).toBe('Très fort');
    });
  });

  describe('getPasswordStrengthColor', () => {
    it('devrait retourner la couleur correcte pour chaque niveau', () => {
      expect(getPasswordStrengthColor(0)).toBe('bg-destructive');
      expect(getPasswordStrengthColor(1)).toBe('bg-destructive');
      expect(getPasswordStrengthColor(2)).toBe('bg-warning');
      expect(getPasswordStrengthColor(3)).toBe('bg-primary');
      expect(getPasswordStrengthColor(4)).toBe('bg-success');
    });
  });
});
