import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ListingConfig {
  id: string;
  user_type: 'proprietaire' | 'demarcheur' | 'agence';
  free_listings_per_month: number;
  price_per_extra_listing: number;
  unlimited_monthly_price: number;
  currency: string;
  is_active: boolean;
}

interface SubscriptionStats {
  user_type: string;
  total_users: number;
  free_users: number;
  unlimited_users: number;
  total_revenue: number;
}

export const ListingLimitsAdmin: React.FC = () => {
  const [configs, setConfigs] = useState<ListingConfig[]>([]);
  const [stats, setStats] = useState<SubscriptionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('listing_limits_config')
        .select('*')
        .order('user_type');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
      // Statistiques des abonnements par type d'utilisateur
      const { data: subscriptionData, error } = await supabase
        .from('profiles')
        .select(`
          user_type,
          user_subscriptions!inner(subscription_type, is_active)
        `);

      if (error) throw error;

      // Transformer les données en statistiques
      const statsMap: Record<string, SubscriptionStats> = {};
      
      subscriptionData?.forEach((profile: any) => {
        const userType = profile.user_type;
        if (!statsMap[userType]) {
          statsMap[userType] = {
            user_type: userType,
            total_users: 0,
            free_users: 0,
            unlimited_users: 0,
            total_revenue: 0
          };
        }
        
        statsMap[userType].total_users++;
        
        profile.user_subscriptions.forEach((sub: any) => {
          if (sub.is_active) {
            if (sub.subscription_type === 'free') {
              statsMap[userType].free_users++;
            } else if (sub.subscription_type === 'unlimited_monthly') {
              statsMap[userType].unlimited_users++;
            }
          }
        });
      });

      setStats(Object.values(statsMap));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateConfig = async (configId: string, updates: Partial<ListingConfig>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('listing_limits_config')
        .update(updates)
        .eq('id', configId);

      if (error) throw error;

      setConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, ...updates } : config
      ));

      toast({
        title: "Configuration mise à jour",
        description: "Les paramètres ont été sauvegardés avec succès"
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'proprietaire': return 'Propriétaires';
      case 'demarcheur': return 'Démarcheurs';
      case 'agence': return 'Agences immobilières';
      default: return userType;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchConfigs(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.user_type}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                {getUserTypeLabel(stat.user_type)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total utilisateurs</span>
                <Badge variant="outline">{stat.total_users}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Comptes gratuits</span>
                <Badge variant="secondary">{stat.free_users}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Abonnés illimités</span>
                <Badge variant="default">{stat.unlimited_users}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration des limites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration des limites d'annonces
          </CardTitle>
          <CardDescription>
            Gérez les limites et tarifs pour chaque type d'utilisateur
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {configs.map((config, index) => (
            <div key={config.id}>
              {index > 0 && <Separator className="my-6" />}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {getUserTypeLabel(config.user_type)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${config.id}`} className="text-sm">
                      Actif
                    </Label>
                    <Switch
                      id={`active-${config.id}`}
                      checked={config.is_active}
                      onCheckedChange={(checked) => 
                        updateConfig(config.id, { is_active: checked })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`free-${config.id}`}>
                      Annonces gratuites par mois
                    </Label>
                    <Input
                      id={`free-${config.id}`}
                      type="number"
                      min="0"
                      value={config.free_listings_per_month}
                      onChange={(e) => 
                        setConfigs(prev => prev.map(c => 
                          c.id === config.id 
                            ? { ...c, free_listings_per_month: parseInt(e.target.value) || 0 }
                            : c
                        ))
                      }
                      onBlur={() => 
                        updateConfig(config.id, { 
                          free_listings_per_month: config.free_listings_per_month 
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${config.id}`}>
                      Prix par annonce supplémentaire ({config.currency})
                    </Label>
                    <Input
                      id={`price-${config.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.price_per_extra_listing}
                      onChange={(e) => 
                        setConfigs(prev => prev.map(c => 
                          c.id === config.id 
                            ? { ...c, price_per_extra_listing: parseFloat(e.target.value) || 0 }
                            : c
                        ))
                      }
                      onBlur={() => 
                        updateConfig(config.id, { 
                          price_per_extra_listing: config.price_per_extra_listing 
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`unlimited-${config.id}`}>
                      Abonnement illimité mensuel ({config.currency})
                    </Label>
                    <Input
                      id={`unlimited-${config.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.unlimited_monthly_price}
                      onChange={(e) => 
                        setConfigs(prev => prev.map(c => 
                          c.id === config.id 
                            ? { ...c, unlimited_monthly_price: parseFloat(e.target.value) || 0 }
                            : c
                        ))
                      }
                      onBlur={() => 
                        updateConfig(config.id, { 
                          unlimited_monthly_price: config.unlimited_monthly_price 
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => fetchConfigs()}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Actualiser'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};