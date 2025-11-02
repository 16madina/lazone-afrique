import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AdminSponsorshipPanel from '@/components/AdminSponsorshipPanel';
import { 
  Shield, 
  Users, 
  Home, 
  Mail, 
  MessageSquare, 
  Ban, 
  CheckCircle, 
  Trash2,
  Eye,
  Star,
  DollarSign,
  Edit,
  Plus,
  Crown,
  Settings
} from 'lucide-react';
import { ListingLimitsAdmin } from './admin/ListingLimitsAdmin';

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
  is_sponsored: boolean;
  sponsored_until: string | null;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

interface SponsorshipPackage {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price_usd: number;
  features: string[];
  is_active: boolean;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [packages, setPackages] = useState<SponsorshipPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [packageForm, setPackageForm] = useState({
    id: '',
    name: '',
    description: '',
    duration_days: 7,
    price_usd: 15,
    features: [''],
    is_active: true
  });
  const [editingPackage, setEditingPackage] = useState<SponsorshipPackage | null>(null);
  const [sponsorForm, setSponsorForm] = useState({
    listingId: '',
    duration: 7
  });
  const { settings: siteSettings, loading: settingsLoading } = useSiteSettings();
  const [editableSettings, setEditableSettings] = useState({
    contact_email: '',
    contact_phone: '',
    contact_hours: ''
  });

  // Synchroniser les settings quand ils sont chargés
  useEffect(() => {
    if (siteSettings && !settingsLoading) {
      setEditableSettings(siteSettings);
    }
  }, [siteSettings, settingsLoading]);

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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set((data || []).map(listing => listing.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const profilesMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);

      const listingsWithProfiles = (data || []).map(listing => ({
        ...listing,
        profiles: profilesMap[listing.user_id] || { full_name: 'Utilisateur inconnu', email: 'Inconnu' }
      }));

      setListings(listingsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les annonces',
        variant: 'destructive'
      });
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsorship_packages')
        .select('*')
        .order('price_usd', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les packages',
        variant: 'destructive'
      });
    }
  };

  const fetchSiteSettings = async () => {
    // Plus besoin car on utilise le hook useSiteSettings
  };

  useEffect(() => {
    fetchUsers();
    fetchListings();
    fetchPackages();
  }, []);

  const performAdminAction = async (action: string, targetUserId?: string, targetListingId?: string, data?: any) => {
    setLoading(true);
    console.log('🔧 Exécution de l\'action admin:', { action, targetUserId, targetListingId, data });
    try {
      const { error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action,
          targetUserId,
          targetListingId,
          ...data
        }
      });

      if (error) {
        console.error('❌ Erreur de la fonction admin:', error);
        throw error;
      }

      console.log('✅ Action admin réussie:', action);
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
      throw error; // Re-throw pour que handleDeletePackage puisse le capturer
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

  const handleCreatePackage = async () => {
    if (!packageForm.name || !packageForm.duration_days || !packageForm.price_usd) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs requis',
        variant: 'destructive'
      });
      return;
    }

    await performAdminAction('create_package', undefined, undefined, {
      name: packageForm.name,
      description: packageForm.description,
      duration_days: packageForm.duration_days,
      price_usd: packageForm.price_usd,
      features: packageForm.features.filter(f => f.trim() !== '')
    });

    setPackageForm({
      id: '',
      name: '',
      description: '',
      duration_days: 7,
      price_usd: 15,
      features: [''],
      is_active: true
    });
    fetchPackages();
  };

  const handleUpdatePackage = async (packageId: string, updates: any) => {
    await performAdminAction('update_package', undefined, undefined, {
      packageId,
      ...updates
    });
    fetchPackages();
  };

  const handleDeletePackage = async (packageId: string, packageName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le package "${packageName}" ? Cette action est irréversible.`)) {
      console.log('🗑️ Tentative de suppression du package:', { packageId, packageName });
      try {
        await performAdminAction('delete_package', undefined, undefined, { packageId });
        console.log('✅ Package supprimé avec succès:', packageId);
        fetchPackages();
      } catch (error) {
        console.error('❌ Erreur lors de la suppression du package:', error);
      }
    }
  };

  const handleEditPackage = (pkg: SponsorshipPackage) => {
    setEditingPackage(pkg);
    setPackageForm({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description || '',
      duration_days: pkg.duration_days,
      price_usd: pkg.price_usd,
      features: pkg.features || [''],
      is_active: pkg.is_active
    });
  };

  const handleSavePackage = async () => {
    if (editingPackage) {
      // Mode édition
      await performAdminAction('update_package', undefined, undefined, {
        packageId: editingPackage.id,
        name: packageForm.name,
        description: packageForm.description,
        duration_days: packageForm.duration_days,
        price_usd: packageForm.price_usd,
        features: packageForm.features.filter(f => f.trim() !== '')
      });
      setEditingPackage(null);
    } else {
      // Mode création
      await handleCreatePackage();
    }
    
    // Reset form
    setPackageForm({
      id: '',
      name: '',
      description: '',
      duration_days: 7,
      price_usd: 15,
      features: [''],
      is_active: true
    });
    fetchPackages();
  };

  const cancelEdit = () => {
    setEditingPackage(null);
    setPackageForm({
      id: '',
      name: '',
      description: '',
      duration_days: 7,
      price_usd: 15,
      features: [''],
      is_active: true
    });
  };

  const handleFreeSponsor = async () => {
    if (!sponsorForm.listingId || !sponsorForm.duration) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une annonce et une durée',
        variant: 'destructive'
      });
      return;
    }

    await performAdminAction('free_sponsor', undefined, sponsorForm.listingId, {
      duration_days: sponsorForm.duration
    });

    setSponsorForm({ listingId: '', duration: 7 });
    fetchListings();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Panneau d'administration</h2>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="listings">Annonces</TabsTrigger>
          <TabsTrigger value="sponsorship">Sponsoring</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
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
                       <div className="flex items-center gap-2">
                         <p className="text-sm text-muted-foreground">
                           {listing.city} • {listing.price.toLocaleString('fr-FR')} FCFA
                         </p>
                         {listing.is_sponsored && listing.sponsored_until && new Date(listing.sponsored_until) > new Date() && (
                           <Badge variant="default" className="bg-gradient-primary">
                             <Crown className="w-3 h-3 mr-1" />
                             Sponsorisée jusqu'au {new Date(listing.sponsored_until).toLocaleDateString('fr-FR')}
                           </Badge>
                         )}
                       </div>
                       <p className="text-xs text-muted-foreground">
                         Par {listing.profiles?.full_name} • {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                       </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-gradient-to-r from-primary to-primary/80"
                          >
                            <Crown className="w-4 h-4 mr-1" />
                            Sponsoriser
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Sponsoriser gratuitement</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Annonce: <span className="font-medium">{listing.title}</span>
                              </p>
                            </div>
                            <div>
                              <Label htmlFor={`duration-${listing.id}`}>Durée du sponsoring (jours)</Label>
                              <Input
                                id={`duration-${listing.id}`}
                                type="number"
                                min="1"
                                max="365"
                                defaultValue="7"
                                onChange={(e) => setSponsorForm({listingId: listing.id, duration: parseInt(e.target.value) || 7})}
                              />
                            </div>
                            <Button 
                              onClick={async () => {
                                setSponsorForm({listingId: listing.id, duration: sponsorForm.duration || 7});
                                await handleFreeSponsor();
                              }} 
                              className="w-full"
                              disabled={loading}
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Confirmer le sponsoring gratuit
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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

        {/* Sponsorship Management */}
        <TabsContent value="sponsorship" className="space-y-6">
          <AdminSponsorshipPanel />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Package Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {editingPackage ? 'Modifier le package' : 'Gestion des packages'}
                </CardTitle>
                {editingPackage && (
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    Annuler l'édition
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Nom du package</Label>
                    <Input
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                      placeholder="Ex: Package Premium"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={packageForm.description}
                      onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                      placeholder="Description du package"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Durée (jours)</Label>
                      <Input
                        type="number"
                        value={packageForm.duration_days}
                        onChange={(e) => setPackageForm({...packageForm, duration_days: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Prix ($)</Label>
                      <Input
                        type="number"
                        value={packageForm.price_usd}
                        onChange={(e) => setPackageForm({...packageForm, price_usd: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Fonctionnalités (une par ligne)</Label>
                    <Textarea
                      value={packageForm.features.join('\n')}
                      onChange={(e) => setPackageForm({...packageForm, features: e.target.value.split('\n')})}
                      placeholder="Mise en avant de votre annonce&#10;Affichage prioritaire&#10;Badge Premium"
                      rows={3}
                    />
                  </div>
                </div>
                <Button onClick={handleSavePackage} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  {editingPackage ? 'Sauvegarder les modifications' : 'Créer le package'}
                </Button>

                <div className="space-y-2">
                  <h4 className="font-medium">Packages existants</h4>
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {pkg.duration_days}j • ${pkg.price_usd}
                        </div>
                        {pkg.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {pkg.description}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPackage(pkg)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant={pkg.is_active ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleUpdatePackage(pkg.id, { is_active: !pkg.is_active })}
                        >
                          {pkg.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Free Sponsorship */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Sponsoring gratuit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Annonce à sponsoriser</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={sponsorForm.listingId}
                      onChange={(e) => setSponsorForm({...sponsorForm, listingId: e.target.value})}
                    >
                      <option value="">Sélectionner une annonce</option>
                      {listings.map((listing) => (
                        <option key={listing.id} value={listing.id}>
                          {listing.title} - {listing.profiles?.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Durée (jours)</Label>
                    <Input
                      type="number"
                      value={sponsorForm.duration}
                      onChange={(e) => setSponsorForm({...sponsorForm, duration: parseInt(e.target.value) || 0})}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
                <Button onClick={handleFreeSponsor} className="w-full" disabled={loading}>
                  <Crown className="w-4 h-4 mr-2" />
                  Sponsoriser gratuitement
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Limits Management */}
        <TabsContent value="limits" className="space-y-4">
          <ListingLimitsAdmin />
        </TabsContent>

        {/* Site Settings Management */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres du Site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de contact</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={editableSettings.contact_email}
                  onChange={(e) => setEditableSettings({...editableSettings, contact_email: e.target.value})}
                  placeholder="support@lazone.app"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone de contact</Label>
                <Input
                  id="contact_phone"
                  value={editableSettings.contact_phone}
                  onChange={(e) => setEditableSettings({...editableSettings, contact_phone: e.target.value})}
                  placeholder="+225 07 00 00 00 00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_hours">Horaires de contact</Label>
                <Input
                  id="contact_hours"
                  value={editableSettings.contact_hours}
                  onChange={(e) => setEditableSettings({...editableSettings, contact_hours: e.target.value})}
                  placeholder="Du lundi au vendredi, 9h-18h"
                />
              </div>

              <Button 
                onClick={async () => {
                  try {
                    setLoading(true);
                    
                    // Mise à jour des paramètres
                    const updates = [
                      { setting_key: 'contact_email', setting_value: editableSettings.contact_email, updated_by: user?.id },
                      { setting_key: 'contact_phone', setting_value: editableSettings.contact_phone, updated_by: user?.id },
                      { setting_key: 'contact_hours', setting_value: editableSettings.contact_hours, updated_by: user?.id }
                    ];

                    for (const update of updates) {
                      const { error } = await supabase
                        .from('site_settings')
                        .update({ setting_value: update.setting_value, updated_by: update.updated_by })
                        .eq('setting_key', update.setting_key);
                      
                      if (error) throw error;
                    }

                    toast({
                      title: 'Succès',
                      description: 'Paramètres mis à jour avec succès'
                    });
                  } catch (error: any) {
                    console.error('Error updating settings:', error);
                    toast({
                      title: 'Erreur',
                      description: 'Impossible de mettre à jour les paramètres',
                      variant: 'destructive'
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres
              </Button>
            </CardContent>
          </Card>
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