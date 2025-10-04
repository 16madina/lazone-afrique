/**
 * Centralized error message translations and handling
 * Maps Supabase error codes to user-friendly French messages
 */

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'invalid_credentials': 'Email ou mot de passe incorrect',
  'invalid_grant': 'Email ou mot de passe incorrect',
  'user_not_found': 'Aucun compte trouvé avec cet email',
  'invalid_password': 'Mot de passe incorrect',
  'email_not_confirmed': 'Veuillez confirmer votre email avant de vous connecter',
  'user_already_registered': 'Un compte existe déjà avec cet email',
  'email_exists': 'Un compte existe déjà avec cet email',
  'weak_password': 'Le mot de passe est trop faible. Utilisez au moins 8 caractères avec des lettres et chiffres',
  
  // Session errors
  'session_not_found': 'Session expirée. Veuillez vous reconnecter',
  'refresh_token_not_found': 'Session expirée. Veuillez vous reconnecter',
  'invalid_token': 'Session invalide. Veuillez vous reconnecter',
  
  // Rate limiting
  'over_email_send_rate_limit': 'Trop de tentatives. Veuillez réessayer dans quelques minutes',
  'over_request_rate_limit': 'Trop de requêtes. Veuillez patienter un instant',
  
  // Phone auth errors
  'invalid_phone': 'Numéro de téléphone invalide',
  'phone_not_found': 'Aucun compte trouvé avec ce numéro',
  'phone_exists': 'Un compte existe déjà avec ce numéro',
  
  // Network errors
  'network_error': 'Erreur de connexion. Vérifiez votre connexion internet',
  'timeout': 'La requête a expiré. Veuillez réessayer',
  
  // Default
  'default': 'Une erreur est survenue. Veuillez réessayer',
};

export const DATABASE_ERROR_MESSAGES: Record<string, string> = {
  'permission_denied': 'Vous n\'avez pas les permissions pour cette action',
  'row_not_found': 'Ressource introuvable',
  'unique_violation': 'Cette valeur existe déjà',
  'foreign_key_violation': 'Impossible de supprimer : des données dépendantes existent',
  'not_null_violation': 'Certains champs obligatoires sont manquants',
  'check_violation': 'Les données ne respectent pas les règles de validation',
  'default': 'Erreur lors de l\'opération sur la base de données',
};

export const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  'invalid_mime_type': 'Type de fichier non autorisé',
  'file_too_large': 'Le fichier est trop volumineux',
  'bucket_not_found': 'Espace de stockage introuvable',
  'object_not_found': 'Fichier introuvable',
  'permission_denied': 'Vous n\'avez pas les permissions pour accéder à ce fichier',
  'default': 'Erreur lors du téléchargement du fichier',
};

/**
 * Get user-friendly error message from Supabase error
 */
export const getAuthErrorMessage = (error: any): string => {
  if (!error) return AUTH_ERROR_MESSAGES.default;
  
  // Check for specific error codes
  const errorCode = error.code || error.error_code || error.status;
  const errorMessage = error.message || error.msg || '';
  
  // Map common error patterns
  if (errorMessage.toLowerCase().includes('invalid login credentials')) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }
  if (errorMessage.toLowerCase().includes('email not confirmed')) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }
  if (errorMessage.toLowerCase().includes('user already registered')) {
    return AUTH_ERROR_MESSAGES.user_already_registered;
  }
  if (errorMessage.toLowerCase().includes('weak password')) {
    return AUTH_ERROR_MESSAGES.weak_password;
  }
  if (errorMessage.toLowerCase().includes('rate limit')) {
    return AUTH_ERROR_MESSAGES.over_email_send_rate_limit;
  }
  
  // Check error code
  if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
    return AUTH_ERROR_MESSAGES[errorCode];
  }
  
  // Network errors
  if (error.name === 'NetworkError' || errorMessage.includes('network')) {
    return AUTH_ERROR_MESSAGES.network_error;
  }
  
  return AUTH_ERROR_MESSAGES.default;
};

/**
 * Get user-friendly error message from database error
 */
export const getDatabaseErrorMessage = (error: any): string => {
  if (!error) return DATABASE_ERROR_MESSAGES.default;
  
  const errorCode = error.code || error.error_code;
  const errorMessage = error.message || error.msg || '';
  
  // PostgreSQL error codes
  if (errorCode === '23505') return DATABASE_ERROR_MESSAGES.unique_violation;
  if (errorCode === '23503') return DATABASE_ERROR_MESSAGES.foreign_key_violation;
  if (errorCode === '23502') return DATABASE_ERROR_MESSAGES.not_null_violation;
  if (errorCode === '23514') return DATABASE_ERROR_MESSAGES.check_violation;
  
  // Check error message patterns
  if (errorMessage.includes('permission denied') || errorMessage.includes('policy')) {
    return DATABASE_ERROR_MESSAGES.permission_denied;
  }
  if (errorMessage.includes('not found')) {
    return DATABASE_ERROR_MESSAGES.row_not_found;
  }
  
  return DATABASE_ERROR_MESSAGES.default;
};

/**
 * Get user-friendly error message from storage error
 */
export const getStorageErrorMessage = (error: any): string => {
  if (!error) return STORAGE_ERROR_MESSAGES.default;
  
  const errorMessage = error.message || error.msg || '';
  
  if (errorMessage.includes('mime type') || errorMessage.includes('file type')) {
    return STORAGE_ERROR_MESSAGES.invalid_mime_type;
  }
  if (errorMessage.includes('too large') || errorMessage.includes('size')) {
    return STORAGE_ERROR_MESSAGES.file_too_large;
  }
  if (errorMessage.includes('not found')) {
    return STORAGE_ERROR_MESSAGES.object_not_found;
  }
  if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
    return STORAGE_ERROR_MESSAGES.permission_denied;
  }
  
  return STORAGE_ERROR_MESSAGES.default;
};

/**
 * Generic error message handler
 */
export const getErrorMessage = (error: any, context?: 'auth' | 'database' | 'storage'): string => {
  switch (context) {
    case 'auth':
      return getAuthErrorMessage(error);
    case 'database':
      return getDatabaseErrorMessage(error);
    case 'storage':
      return getStorageErrorMessage(error);
    default:
      return error?.message || 'Une erreur est survenue';
  }
};
