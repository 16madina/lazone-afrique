import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Smartphone } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const { isRegistered, sendTestNotification } = usePushNotifications();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label>Notifications mobiles</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications même quand l'app est fermée
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isRegistered} disabled />
              {isRegistered && (
                <span className="text-xs text-green-600 font-medium">Actif</span>
              )}
            </div>
          </div>

          {isRegistered && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Les notifications push sont configurées ! Testez le système :
              </p>
              <Button 
                onClick={sendTestNotification}
                size="sm"
                className="w-full"
              >
                Envoyer une notification test
              </Button>
            </div>
          )}

          {!isRegistered && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-700">
                📱 Les notifications push fonctionnent uniquement sur mobile (iOS/Android). 
                Sur web, vous recevrez des notifications dans le navigateur.
              </p>
            </div>
          )}
        </div>

          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Types de notifications activées</h4>
            
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>📨 Nouveaux messages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>🤝 Demandes de contact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>💰 Sponsoring (approbation/paiement)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>🏠 Mises à jour d'annonces</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>⏰ Rappels importants</span>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;