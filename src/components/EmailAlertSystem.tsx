import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  Settings, 
  Home, 
  DollarSign, 
  MessageSquare, 
  Target,
  Clock,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EmailPreferences {
  id: string;
  userId: string;
  newListings: boolean;
  priceChanges: boolean;
  newMessages: boolean;
  propertyMatches: boolean;
  weeklyDigest: boolean;
  marketReports: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  maxPrice?: number;
  minPrice?: number;
  locations: string[];
  propertyTypes: string[];
}

interface EmailTemplate {
  id: string;
  type: 'new_listing' | 'price_change' | 'new_message' | 'property_match';
  name: string;
  description: string;
  enabled: boolean;
}

export const EmailAlertSystem = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEmailPreferences();
      loadEmailTemplates();
    }
  }, [user]);

  const fetchEmailPreferences = async () => {
    if (!user) return;

    try {
      // Simuler les préférences email pour l'exemple
      const mockPreferences: EmailPreferences = {
        id: '1',
        userId: user.id,
        newListings: true,
        priceChanges: true,
        newMessages: true,
        propertyMatches: false,
        weeklyDigest: true,
        marketReports: false,
        frequency: 'immediate',
        maxPrice: 50000000,
        minPrice: 5000000,
        locations: ['Abidjan', 'Cocody', 'Marcory'],
        propertyTypes: ['apartment', 'house']
      };

      setPreferences(mockPreferences);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
      toast.error('Erreur lors du chargement des préférences');
    }
  };

  const loadEmailTemplates = () => {
    const mockTemplates: EmailTemplate[] = [
      {
        id: '1',
        type: 'new_listing',
        name: 'Nouvelle annonce',
        description: 'Notifications lors de nouvelles propriétés correspondant à vos critères',
        enabled: true
      },
      {
        id: '2',
        type: 'price_change',
        name: 'Changement de prix',
        description: 'Alertes lors de modifications de prix sur vos favoris',
        enabled: true
      },
      {
        id: '3',
        type: 'new_message',
        name: 'Nouveau message',
        description: 'Notifications pour les nouveaux messages reçus',
        enabled: true
      },
      {
        id: '4',
        type: 'property_match',
        name: 'Correspondance propriété',
        description: 'Suggestions de propriétés basées sur vos recherches',
        enabled: false
      }
    ];

    setTemplates(mockTemplates);
    setLoading(false);
  };

  const updatePreferences = async (updates: Partial<EmailPreferences>) => {
    if (!preferences) return;

    setSaving(true);
    try {
      const updatedPreferences = { ...preferences, ...updates };
      setPreferences(updatedPreferences);

      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Préférences mises à jour');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Veuillez saisir une adresse email');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-email-alerts', {
        body: {
          type: 'new_listing',
          recipientEmail: testEmail,
          recipientName: 'Test User',
          data: {
            listingTitle: 'Villa moderne 4 chambres',
            listingUrl: 'https://lazone-afrique.com/listing/123',
            location: 'Cocody, Abidjan',
            propertyType: 'Villa'
          }
        }
      });

      if (error) throw error;

      toast.success('Email de test envoyé avec succès');
      setTestEmail('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du test:', error);
      toast.error('Erreur lors de l\'envoi du test');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Impossible de charger les préférences</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Alertes Email</h2>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          <span className="text-sm text-muted-foreground">
            Configurez vos notifications personnalisées
          </span>
        </div>
      </div>

      {/* Préférences principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Types de Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-500" />
                  <Label className="font-medium">Nouvelles Annonces</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recevez un email pour chaque nouvelle propriété correspondant à vos critères
                </p>
              </div>
              <Switch
                checked={preferences.newListings}
                onCheckedChange={(checked) => updatePreferences({ newListings: checked })}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <Label className="font-medium">Changements de Prix</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alertes lors de modifications de prix sur vos favoris
                </p>
              </div>
              <Switch
                checked={preferences.priceChanges}
                onCheckedChange={(checked) => updatePreferences({ priceChanges: checked })}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <Label className="font-medium">Nouveaux Messages</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Notifications pour les messages reçus
                </p>
              </div>
              <Switch
                checked={preferences.newMessages}
                onCheckedChange={(checked) => updatePreferences({ newMessages: checked })}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <Label className="font-medium">Correspondances IA</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Suggestions personnalisées basées sur vos recherches
                </p>
              </div>
              <Switch
                checked={preferences.propertyMatches}
                onCheckedChange={(checked) => updatePreferences({ propertyMatches: checked })}
                disabled={saving}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Résumé Hebdomadaire</Label>
                <p className="text-sm text-muted-foreground">
                  Rapport hebdomadaire de vos activités
                </p>
              </div>
              <Switch
                checked={preferences.weeklyDigest}
                onCheckedChange={(checked) => updatePreferences({ weeklyDigest: checked })}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium">Rapports de Marché</Label>
                <p className="text-sm text-muted-foreground">
                  Analyses et tendances du marché immobilier
                </p>
              </div>
              <Switch
                checked={preferences.marketReports}
                onCheckedChange={(checked) => updatePreferences({ marketReports: checked })}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de fréquence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Fréquence des Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Fréquence</Label>
              <Select
                value={preferences.frequency}
                onValueChange={(value: 'immediate' | 'daily' | 'weekly') => 
                  updatePreferences({ frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immédiat</SelectItem>
                  <SelectItem value="daily">Quotidien (17h)</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire (Lundi 9h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres de prix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Critères de Filtrage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Prix Minimum (FCFA)</Label>
              <Input
                type="number"
                value={preferences.minPrice || ''}
                onChange={(e) => updatePreferences({ minPrice: parseInt(e.target.value) || undefined })}
                placeholder="Prix minimum"
              />
            </div>
            <div>
              <Label>Prix Maximum (FCFA)</Label>
              <Input
                type="number"
                value={preferences.maxPrice || ''}
                onChange={(e) => updatePreferences({ maxPrice: parseInt(e.target.value) || undefined })}
                placeholder="Prix maximum"
              />
            </div>
          </div>

          <div>
            <Label>Localisations d'Intérêt</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.locations.map((location, index) => (
                <Badge key={index} variant="outline">
                  {location}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Types de Propriété</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.propertyTypes.map((type, index) => (
                <Badge key={index} variant="outline">
                  {type === 'apartment' ? 'Appartement' : 
                   type === 'house' ? 'Maison' : 
                   type === 'villa' ? 'Villa' : 
                   type === 'land' ? 'Terrain' : type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test d'email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Test d'Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Envoyez-vous un email de test pour vérifier le bon fonctionnement des notifications.
          </p>
          
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="votre@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={sendTestEmail} 
              disabled={sending || !testEmail}
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Tester
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statut de sauvegarde */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sauvegarde en cours...
          </div>
        </div>
      )}
    </div>
  );
};