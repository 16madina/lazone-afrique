import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Crown, Calendar, AlertCircle, Zap } from 'lucide-react';
import { useListingLimits } from '@/hooks/useListingLimits';

interface ListingLimitsStatusProps {
  onUpgrade?: () => void;
  onPayPerListing?: () => void;
}

export const ListingLimitsStatus: React.FC<ListingLimitsStatusProps> = ({
  onUpgrade,
  onPayPerListing
}) => {
  const { 
    usage, 
    config, 
    subscription, 
    canCreateListing,
    loading, 
    error,
    getUserTypeLabel,
    getSubscriptionTypeLabel 
  } = useListingLimits();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage || !config) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Données de limite non disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasUnlimitedSubscription = subscription?.subscription_type === 'unlimited_monthly';
  const progressValue = config.free_listings_per_month > 0 
    ? (usage.free_listings_used / config.free_listings_per_month) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Mes annonces ce mois-ci</CardTitle>
            <CardDescription>
              Compte {getUserTypeLabel(config.user_type || '')}
            </CardDescription>
          </div>
          {hasUnlimitedSubscription && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Illimité
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasUnlimitedSubscription && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Annonces gratuites</span>
              <span className="font-medium">
                {usage.free_listings_used}/{config.free_listings_per_month}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {usage.free_listings_remaining} annonce(s) gratuite(s) restante(s)
            </div>
          </div>
        )}

        {usage.paid_listings_used > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span>Annonces payantes</span>
            <span className="font-medium">{usage.paid_listings_used}</span>
          </div>
        )}

        {subscription && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                Abonnement : {getSubscriptionTypeLabel(subscription.subscription_type)}
              </span>
            </div>
            {subscription.expires_at && (
              <div className="text-xs text-muted-foreground">
                Expire le : {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        )}

        {!canCreateListing && !hasUnlimitedSubscription && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Limite atteinte</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPayPerListing}
                className="flex items-center gap-2"
              >
                <span>{config.price_per_extra_listing} {config.currency}</span>
                <span className="text-xs">par annonce</span>
              </Button>
              
              <Button
                size="sm"
                onClick={onUpgrade}
                className="flex items-center gap-2"
              >
                <Zap className="w-3 h-3" />
                <span>{config.unlimited_monthly_price} {config.currency}/mois</span>
              </Button>
            </div>
          </div>
        )}

        {canCreateListing && !hasUnlimitedSubscription && usage.free_listings_remaining === 0 && (
          <div className="text-sm text-muted-foreground">
            Vous pouvez toujours créer des annonces payantes
          </div>
        )}

        {hasUnlimitedSubscription && (
          <div className="flex items-center gap-2 text-green-600">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">
              Annonces illimitées jusqu'au {subscription?.expires_at 
                ? new Date(subscription.expires_at).toLocaleDateString('fr-FR')
                : 'renouvelé automatiquement'
              }
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};