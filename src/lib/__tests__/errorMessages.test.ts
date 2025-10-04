import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../errorMessages';

describe('errorMessages', () => {
  it('devrait retourner le message approprié pour "Invalid login credentials"', () => {
    const message = getErrorMessage('Invalid login credentials');
    expect(message).toBe('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
  });

  it('devrait retourner le message approprié pour "User already registered"', () => {
    const message = getErrorMessage('User already registered');
    expect(message).toBe('Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.');
  });

  it('devrait retourner le message approprié pour "Email not confirmed"', () => {
    const message = getErrorMessage('Email not confirmed');
    expect(message).toBe('Veuillez confirmer votre email avant de vous connecter.');
  });

  it('devrait retourner le message générique pour une erreur inconnue', () => {
    const message = getErrorMessage('Some unknown error');
    expect(message).toBe('Une erreur est survenue. Veuillez réessayer.');
  });

  it('devrait gérer les messages d\'erreur avec différentes casses', () => {
    const message = getErrorMessage('INVALID LOGIN CREDENTIALS');
    expect(message).toBe('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
  });

  it('devrait gérer les messages d\'erreur contenant la phrase clé', () => {
    const message = getErrorMessage('Error: Invalid login credentials occurred');
    expect(message).toBe('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
  });
});
