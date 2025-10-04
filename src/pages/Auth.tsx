import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCountry } from '@/contexts/CountryContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Users, ArrowLeft, AlertCircle } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { supabase } from '@/integrations/supabase/client';
import LaZoneIcon from '@/assets/lazone-logo-icon.png';
import LaZoneText from '@/assets/lazone-text-logo-3d.png';
import { validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/passwordValidator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const { signIn, signInWithPhone, signUp, user, loading } = useAuth();
  const { countries, selectedCountry } = useCountry();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loginForm, setLoginForm] = useState({
    email: '',
    phone: '',
    password: '',
  });
  
  const [signupForm, setSignupForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    country: selectedCountry.code,
    city: '',
    neighborhood: '',
    phone: '',
    user_type: 'proprietaire' as 'proprietaire' | 'demarcheur' | 'agence',
    password: '',
    confirmPassword: '',
    company_name: '',
    license_number: '',
  });

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let result;
    if (loginMethod === 'email') {
      result = await signIn(loginForm.email, loginForm.password);
    } else {
      result = await signInWithPhone(loginForm.phone, loginForm.password);
    }
    
    if (result.error) {
      toast({
        title: "Erreur de connexion",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      // Délai pour s'assurer que l'état auth est bien mis à jour
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
    
    setIsLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!loginForm.email) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer votre email pour réinitialiser le mot de passe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(loginForm.email, {
      redirectTo: `${window.location.origin}/`,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email envoyé",
        description: "Un lien de réinitialisation a été envoyé à votre email.",
      });
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const strength = validatePassword(signupForm.password);
    if (!strength.isValid) {
      toast({
        title: "Mot de passe trop faible",
        description: strength.feedback.join('. '),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const userData = {
      first_name: signupForm.first_name,
      last_name: signupForm.last_name,
      full_name: `${signupForm.first_name} ${signupForm.last_name}`.trim(),
      country: signupForm.country,
      city: signupForm.city,
      neighborhood: signupForm.neighborhood,
      phone: signupForm.phone,
      user_type: signupForm.user_type,
      ...(signupForm.user_type === 'agence' && signupForm.company_name && { company_name: signupForm.company_name }),
      ...(signupForm.user_type !== 'proprietaire' && signupForm.license_number && { license_number: signupForm.license_number }),
    };

    const { error } = await signUp(signupForm.email, signupForm.password, userData);
    
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Inscription réussie",
        description: "Un email de confirmation vous a été envoyé.",
      });
    }
    
    setIsLoading(false);
  };

  const userTypeOptions = [
    { value: 'proprietaire', label: 'Propriétaire', icon: User, description: 'Je souhaite vendre ou louer mon bien' },
    { value: 'demarcheur', label: 'Démarcheur', icon: Users, description: 'Je prospecte des biens immobiliers' },
    { value: 'agence', label: 'Agence', icon: Building2, description: 'Je représente une agence immobilière' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Bouton retour */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        
        <Card className="w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img 
              src={LaZoneIcon} 
              alt="LaZone Logo" 
              className="w-12 h-12"
            />
            <img 
              src={LaZoneText} 
              alt="LaZone" 
              className="h-8"
            />
          </div>
          <CardDescription>Connexion à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Méthode de connexion</Label>
                  <Select value={loginMethod} onValueChange={(value: 'email' | 'phone') => setLoginMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Numéro de téléphone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {loginMethod === 'email' ? (
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <PhoneInput
                    id="login-phone"
                    label="Numéro de téléphone"
                    value={loginForm.phone}
                    onChange={(value) => setLoginForm({ ...loginForm, phone: value })}
                    required
                  />
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
                
                {loginMethod === 'email' && (
                  <div className="text-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={handlePasswordReset}
                      disabled={isLoading}
                      className="text-sm"
                    >
                      Mot de passe oublié ?
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Nom *</Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      placeholder="Nom de famille"
                      value={signupForm.last_name}
                      onChange={(e) => setSignupForm({ ...signupForm, last_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">Prénom *</Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      placeholder="Prénom"
                      value={signupForm.first_name}
                      onChange={(e) => setSignupForm({ ...signupForm, first_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pays *</Label>
                    <Select
                      value={signupForm.country}
                      onValueChange={(value) => {
                        setSignupForm({ ...signupForm, country: value, city: '' });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ville *</Label>
                    <Select
                      value={signupForm.city}
                      onValueChange={(value) => setSignupForm({ ...signupForm, city: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.find(c => c.code === signupForm.country)?.cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-neighborhood">Quartier</Label>
                  <Input
                    id="signup-neighborhood"
                    type="text"
                    placeholder="Nom du quartier"
                    value={signupForm.neighborhood}
                    onChange={(e) => setSignupForm({ ...signupForm, neighborhood: e.target.value })}
                  />
                </div>

                <PhoneInput
                  id="signup-phone"
                  label="Téléphone"
                  value={signupForm.phone}
                  onChange={(value) => setSignupForm({ ...signupForm, phone: value })}
                  selectedCountryCode={signupForm.country}
                  required
                />
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Type d'utilisateur *</Label>
                  <Select
                    value={signupForm.user_type}
                    onValueChange={(value: 'proprietaire' | 'demarcheur' | 'agence') => 
                      setSignupForm({ ...signupForm, user_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-muted-foreground">{option.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {signupForm.user_type === 'agence' && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-company">Nom de l'agence</Label>
                    <Input
                      id="signup-company"
                      type="text"
                      placeholder="Nom de votre agence"
                      value={signupForm.company_name}
                      onChange={(e) => setSignupForm({ ...signupForm, company_name: e.target.value })}
                    />
                  </div>
                )}

                {signupForm.user_type !== 'proprietaire' && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-license">Numéro de licence</Label>
                    <Input
                      id="signup-license"
                      type="text"
                      placeholder="Votre numéro de licence"
                      value={signupForm.license_number}
                      onChange={(e) => setSignupForm({ ...signupForm, license_number: e.target.value })}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Minimum 8 caractères"
                    value={signupForm.password}
                    onChange={(e) => {
                      const newPassword = e.target.value;
                      setSignupForm({ ...signupForm, password: newPassword });
                      if (newPassword.length > 0) {
                        setPasswordStrength(validatePassword(newPassword));
                      } else {
                        setPasswordStrength(null);
                      }
                    }}
                    required
                  />
                  {passwordStrength && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Force du mot de passe</span>
                        <span className="font-medium">{getPasswordStrengthLabel(passwordStrength.score)}</span>
                      </div>
                      <Progress 
                        value={(passwordStrength.score / 4) * 100} 
                        className={`h-2 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      />
                      {passwordStrength.feedback.length > 0 && (
                        <Alert variant={passwordStrength.isValid ? "default" : "destructive"} className="py-2">
                          <AlertCircle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            {passwordStrength.feedback[0]}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirmer le mot de passe *</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Inscription...' : 'S\'inscrire'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;