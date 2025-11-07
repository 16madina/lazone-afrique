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
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Users, ArrowLeft, Shield, Database, UserX, Lock } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { supabase } from '@/integrations/supabase/client';
import LaZoneIcon from '@/assets/lazone-logo-icon.png';
import LaZoneText from '@/assets/lazone-text-logo-3d.png';

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

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

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
    
    if (!acceptTerms) {
      toast({
        title: "Conditions requises",
        description: "Vous devez accepter les Conditions Générales et la Politique de Confidentialité pour vous inscrire.",
        variant: "destructive",
      });
      return;
    }
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
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
                    placeholder="Mot de passe"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                  />
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
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    J'accepte les{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsDialog(true)}
                      className="text-primary underline hover:text-primary/80"
                    >
                      Conditions Générales d'Utilisation
                    </button>
                    {' '}et la{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyDialog(true)}
                      className="text-primary underline hover:text-primary/80"
                    >
                      Politique de Confidentialité
                    </button>
                    {' *'}
                  </label>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms}>
                  {isLoading ? 'Inscription...' : 'S\'inscrire'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>

        {/* Terms Dialog */}
        <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Conditions Générales d'Utilisation</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-2">1. Acceptation des conditions</h3>
                  <p className="text-sm text-muted-foreground">
                    En accédant et en utilisant LaZone Afrique, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. 
                    Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">2. Description du service</h3>
                  <p className="text-sm text-muted-foreground">
                    LaZone Afrique est une plateforme de mise en relation pour l'immobilier en Afrique. Nous permettons aux utilisateurs 
                    de publier des annonces immobilières et de rechercher des biens.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">3. Compte utilisateur</h3>
                  <p className="text-sm text-muted-foreground mb-2">Pour publier des annonces, vous devez créer un compte. Vous êtes responsable de :</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>La confidentialité de vos identifiants de connexion</li>
                    <li>Toutes les activités effectuées depuis votre compte</li>
                    <li>La véracité des informations fournies lors de l'inscription</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">4. Règles de contenu</h3>
                  <p className="text-sm text-muted-foreground mb-2">Les utilisateurs s'engagent à ne pas publier de contenu qui :</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Est faux, trompeur ou frauduleux</li>
                    <li>Viole les droits d'autrui (propriété intellectuelle, vie privée, etc.)</li>
                    <li>Est illégal, offensant, diffamatoire ou inapproprié</li>
                    <li>Contient des virus, malwares ou code malveillant</li>
                    <li>Constitue du spam ou du harcèlement</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">5. Modération et signalement</h3>
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 mb-3">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                      🕐 Engagement de modération sous 24 heures
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Nous nous engageons formellement à examiner et traiter tous les signalements dans un délai maximum de 24 heures.
                    </p>
                  </div>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Signalement facile du contenu inapproprié</li>
                    <li>Blocage d'utilisateurs</li>
                    <li>Filtrage automatique des contenus problématiques</li>
                    <li>Sanctions progressives selon la gravité</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">6. Limitation de responsabilité</h3>
                  <p className="text-sm text-muted-foreground">
                    LaZone Afrique ne garantit pas l'exactitude, la qualité ou la légalité des annonces publiées. 
                    Nous ne sommes pas responsables des transactions entre utilisateurs.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Privacy Policy Dialog */}
        <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Shield className="w-6 h-6" />
                Politique de Confidentialité
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                <section>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Collecte des Données
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    LaZone collecte et traite les données personnelles suivantes :
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li><strong>Informations de compte :</strong> Nom, prénom, adresse email, numéro de téléphone</li>
                    <li><strong>Informations de profil :</strong> Photo de profil, biographie</li>
                    <li><strong>Annonces immobilières :</strong> Photos, descriptions, prix, localisation des biens</li>
                    <li><strong>Messages :</strong> Communications entre utilisateurs</li>
                    <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Utilisation des Données
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Vos données personnelles sont utilisées pour :</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Créer et gérer votre compte utilisateur</li>
                    <li>Publier et gérer vos annonces immobilières</li>
                    <li>Faciliter la communication entre acheteurs et vendeurs</li>
                    <li>Améliorer nos services et l'expérience utilisateur</li>
                    <li>Vous envoyer des notifications importantes</li>
                    <li>Assurer la sécurité et prévenir la fraude</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Partage des Données
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Nous ne vendons jamais vos données personnelles. Vos informations peuvent être partagées uniquement :
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li><strong>Avec d'autres utilisateurs :</strong> Vos annonces et informations de contact sont visibles</li>
                    <li><strong>Prestataires de services :</strong> Hébergement, paiement, analyse (avec accord)</li>
                    <li><strong>Obligations légales :</strong> Si requis par la loi</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Sécurité des Données
                  </h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Chiffrement SSL/TLS pour toutes les communications</li>
                    <li>Authentification sécurisée et hachage des mots de passe</li>
                    <li>Accès limité aux données personnelles</li>
                    <li>Sauvegardes régulières</li>
                    <li>Surveillance continue des activités suspectes</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <UserX className="w-5 h-5" />
                    Vos Droits
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Vous disposez des droits suivants :</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données</li>
                    <li><strong>Droit de rectification :</strong> Corriger vos informations</li>
                    <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                    <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                    <li><strong>Droit d'opposition :</strong> Refuser certains traitements</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">Conservation des Données</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li><strong>Compte actif :</strong> Tant que votre compte existe</li>
                    <li><strong>Après suppression :</strong> 30 jours pour permettre une récupération</li>
                    <li><strong>Données d'annonces :</strong> Archivées pendant 3 mois</li>
                  </ul>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Auth;