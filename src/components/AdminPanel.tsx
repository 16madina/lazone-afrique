import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  Home, 
  Mail, 
  MessageSquare, 
  Ban, 
  CheckCircle, 
  Trash2,
  Eye
} from 'lucide-react';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  user_type: string;
  banned: boolean;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  city: string;
  price: number;
  user_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive'
      });
    }
  };

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les annonces',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchListings();
  }, []);

  const performAdminAction = async (action: string, targetUserId?: string, targetListingId?: string, data?: any) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action,
          targetUserId,
          targetListingId,
          ...data
        }
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Action effectuée avec succès'
      });

      // Refresh data
      await fetchUsers();
      await fetchListings();
    } catch (error: any) {
      console.error('Admin action error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, banned: boolean) => {
    await performAdminAction(banned ? 'ban_user' : 'unban_user', userId);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      await performAdminAction('delete_listing', undefined, listingId);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedUser || !emailForm.subject || !emailForm.message) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive'
      });
      return;
    }

    await performAdminAction('send_email', selectedUser.user_id, undefined, {
      subject: emailForm.subject,
      message: emailForm.message
    });

    setEmailForm({ subject: '', message: '' });
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Panneau d'administration</h2>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="listings">Annonces</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.user_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{user.full_name}</h4>
                        <Badge variant={user.banned ? 'destructive' : 'secondary'}>
                          {user.banned ? 'Banni' : 'Actif'}
                        </Badge>
                        <Badge variant="outline">{user.user_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Envoyer un email à {user.full_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="subject">Sujet</Label>
                              <Input
                                id="subject"
                                value={emailForm.subject}
                                onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                                placeholder="Sujet de l'email"
                              />
                            </div>
                            <div>
                              <Label htmlFor="message">Message</Label>
                              <Textarea
                                id="message"
                                value={emailForm.message}
                                onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                                placeholder="Votre message..."
                                rows={4}
                              />
                            </div>
                            <Button onClick={handleSendEmail} disabled={loading}>
                              Envoyer l'email
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant={user.banned ? "default" : "destructive"}
                        size="sm"
                        onClick={() => handleBanUser(user.user_id, !user.banned)}
                        disabled={loading}
                      >
                        {user.banned ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Débannir
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Bannir
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Listings Management */}
        <TabsContent value="listings" className="space-y-4">
          <div className="grid gap-4">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{listing.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {listing.city} • {listing.price.toLocaleString('fr-FR')} FCFA
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Par {listing.profiles?.full_name} • {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/listing/${listing.id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteListing(listing.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Admin Actions Log */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des actions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                L'historique des actions administratives sera affiché ici.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;