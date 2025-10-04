/**
 * Password validation utility
 * Helps users create secure passwords and checks against known leaked passwords
 */

interface PasswordStrength {
  score: number; // 0-4 (0: very weak, 4: very strong)
  feedback: string[];
  isValid: boolean;
}

/**
 * Common weak passwords that should never be used
 * This is a small subset - in production, you'd use a larger database
 */
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  'bailey', 'passw0rd', 'shadow', '123123', '654321',
  'superman', 'qazwsx', 'michael', 'football'
]);

/**
 * Validate password strength and provide feedback
 */
export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;
  
  // Check minimum length
  if (password.length < 8) {
    feedback.push('Le mot de passe doit contenir au moins 8 caractères');
    return { score: 0, feedback, isValid: false };
  }
  
  // Check for common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    feedback.push('Ce mot de passe est trop commun et facilement devinable');
    return { score: 0, feedback, isValid: false };
  }
  
  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Évitez les caractères répétitifs (ex: aaa, 111)');
    score -= 1;
  }
  
  // Check for sequential patterns
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    feedback.push('Évitez les séquences simples (ex: abc, 123)');
    score -= 1;
  }
  
  // Length bonus
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1; // lowercase
  if (/[A-Z]/.test(password)) score += 1; // uppercase
  if (/[0-9]/.test(password)) score += 1; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special chars
  
  // Cap score at 4
  score = Math.min(4, Math.max(0, score));
  
  // Generate feedback based on score
  if (score < 2) {
    feedback.push('Mot de passe très faible - ajoutez plus de caractères variés');
  } else if (score === 2) {
    feedback.push('Mot de passe faible - essayez d\'ajouter des chiffres et symboles');
  } else if (score === 3) {
    feedback.push('Mot de passe moyen - bon, mais pourrait être amélioré');
  } else {
    feedback.push('Mot de passe fort - excellent !');
  }
  
  return {
    score,
    feedback,
    isValid: score >= 2 // Require at least a weak-medium password
  };
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (score: number): string => {
  switch (score) {
    case 0: return 'Très faible';
    case 1: return 'Faible';
    case 2: return 'Moyen';
    case 3: return 'Fort';
    case 4: return 'Très fort';
    default: return 'Inconnu';
  }
};

/**
 * Get color for password strength indicator
 */
export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1: return 'bg-destructive';
    case 2: return 'bg-warning';
    case 3: return 'bg-primary';
    case 4: return 'bg-success';
    default: return 'bg-muted';
  }
};
