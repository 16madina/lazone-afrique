import { useState, useEffect } from 'react';
import { Bell, X, Check, Mail, Home, Star, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'message' | 'listing' | 'rating' | 'admin' | 'system' | 'appointment_request' | 'appointment_update' | 'sponsorship';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}

export const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Récupérer les notifications admin si applicable
      const { data: adminNotifications } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      // Simuler d'autres types de notifications basées sur l'activité récente
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'message',
          title: 'Nouveau message',
          message: 'Vous avez reçu un nouveau message concernant votre annonce.',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2', 
          type: 'listing',
          title: 'Annonce vue',
          message: 'Votre annonce "Villa moderne" a été consultée 15 fois aujourd\'hui.',
          isRead: true,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'rating',
          title: 'Nouvel avis',
          message: 'Vous avez reçu un avis 5 étoiles de Marie Dupont.',
          isRead: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const allNotifications = [
        ...mockNotifications,
        ...(adminNotifications || []).map(admin => ({
          id: admin.id,
          type: 'admin' as const,
          title: admin.title,
          message: admin.message,
          isRead: admin.is_read,
          createdAt: admin.created_at,
          relatedId: admin.related_id
        }))
      ];

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    // Écouter les nouveaux messages
    const messagesChannel = supabase
      .channel('notifications-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=in.(SELECT conversation_id FROM conversation_participants WHERE user_id=eq.${user.id})`
      }, (payload) => {
        addNewNotification({
          id: `msg-${payload.new.id}`,
          type: 'message',
          title: 'Nouveau message',
          message: 'Vous avez reçu un nouveau message.',
          isRead: false,
          createdAt: payload.new.created_at
        });
      })
      .subscribe();

    // Écouter les nouvelles notifications admin
    const adminChannel = supabase
      .channel('notifications-admin')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_notifications'
      }, (payload) => {
        addNewNotification({
          id: `admin-${payload.new.id}`,
          type: 'admin',
          title: payload.new.title,
          message: payload.new.message,
          isRead: false,
          createdAt: payload.new.created_at
        });
      })
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
      adminChannel.unsubscribe();
    };
  };

  const addNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Toast notification
    toast.info(notification.title, {
      description: notification.message,
      action: {
        label: "Voir",
        onClick: () => setOpen(true)
      }
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Marquer comme lu en base si c'est une notification admin
      if (notificationId.startsWith('admin-')) {
        const adminId = notificationId.replace('admin-', '');
        await supabase
          .from('admin_notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', adminId);
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      // Marquer toutes les notifications admin comme lues
      await supabase
        .from('admin_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('is_read', false);
    } catch (error) {
      console.error('Erreur lors du marquage groupé:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'listing': return <Home className="w-4 h-4 text-green-500" />;
      case 'rating': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'appointment_request': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'appointment_update': return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'sponsorship': return <Star className="w-4 h-4 text-gold-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-0.5 -right-0.5 h-5 w-5 min-w-[20px] p-0 flex items-center justify-center text-[9px] font-bold rounded-full leading-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Tout marquer comme lu
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-full mt-6">
          <div className="space-y-3">
            {loading ? (
              // Skeleton loading
              [...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};