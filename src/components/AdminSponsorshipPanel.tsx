import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Eye, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCountry } from "@/contexts/CountryContext";

interface SponsorshipRequest {
  id: string;
  amount_paid: number;
  payment_method: string;
  approval_status: string;
  admin_notes?: string;
  created_at: string;
  approval_date?: string;
  listing: {
    id: string;
    title: string;
    city: string;
    image?: string;
    photos?: string[];
  };
  user: {
    full_name?: string;
    email: string;
    phone?: string;
  };
  package: {
    name: string;
    duration_days: number;
    description: string;
  };
}

const AdminSponsorshipPanel = () => {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SponsorshipRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { formatPrice } = useCountry();

  useEffect(() => {
    fetchSponsorshipRequests();
  }, []);

  const fetchSponsorshipRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsorship_transactions')
        .select(`
          id,
          amount_paid,
          payment_method,
          approval_status,
          admin_notes,
          created_at,
          approval_date,
          listing_id,
          user_id,
          package_id,
          listings!listing_id (
            id,
            title,
            city,
            image,
            photos
          ),
          profiles!user_id (
            full_name,
            email,
            phone
          ),
          sponsorship_packages!package_id (
            name,
            duration_days,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sponsorship requests:', error);
        toast.error('Erreur lors du chargement des demandes');
        return;
      }

      const formattedRequests = (data || []).map(item => ({
        id: item.id,
        amount_paid: item.amount_paid,
        payment_method: item.payment_method,
        approval_status: item.approval_status,
        admin_notes: item.admin_notes,
        created_at: item.created_at,
        approval_date: item.approval_date,
        listing: Array.isArray(item.listings) ? item.listings[0] : item.listings,
        user: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
        package: Array.isArray(item.sponsorship_packages) ? item.sponsorship_packages[0] : item.sponsorship_packages,
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching sponsorship requests:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approve' | 'reject') => {
    setActionLoading(requestId);
    
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update transaction approval status
      const { error: updateError } = await supabase
        .from('sponsorship_transactions')
        .update({
          approval_status: action === 'approve' ? 'approved' : 'rejected',
          admin_notes: adminNotes,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approval_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, update the listing
      if (action === 'approve') {
        const sponsorUntil = new Date();
        sponsorUntil.setDate(sponsorUntil.getDate() + request.package.duration_days);

        const { error: listingError } = await supabase
          .from('listings')
          .update({
            is_sponsored: true,
            sponsored_until: sponsorUntil.toISOString(),
            sponsor_amount: request.amount_paid,
            sponsored_at: new Date().toISOString()
          })
          .eq('id', request.listing.id);

        if (listingError) throw listingError;
      }

      toast.success(`Demande ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès !`);
      setAdminNotes("");
      setSelectedRequest(null);
      fetchSponsorshipRequests(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Erreur lors de ${action === 'approve' ? 'l\'approbation' : 'le rejet'} de la demande`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getListingImage = (listing: any) => {
    if (listing?.photos && listing.photos.length > 0) {
      return listing.photos[0];
    }
    return listing?.image || '/placeholder.svg';
  };

  if (loading) {
    return <div className="p-6 text-center">Chargement des demandes de sponsoring...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Demandes de Sponsoring</h2>
        <Badge variant="secondary">
          {requests.filter(r => r.approval_status === 'pending').length} en attente
        </Badge>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={getListingImage(request.listing)}
                    alt={request.listing?.title || 'Annonce'}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <CardTitle className="text-lg">{request.listing?.title || 'Annonce inconnue'}</CardTitle>
                    <CardDescription>
                      {request.user?.full_name || request.user?.email} • {request.listing?.city}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(request.approval_status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Package</Label>
                  <p className="text-sm">{request.package?.name} - {request.package?.duration_days} jours</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Montant</Label>
                  <p className="text-sm font-bold">{formatPrice(request.amount_paid)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mode de paiement</Label>
                  <p className="text-sm">{request.payment_method}</p>
                </div>
              </div>

              {request.admin_notes && (
                <div className="mb-4 p-3 bg-muted rounded">
                  <Label className="text-sm font-medium">Notes admin</Label>
                  <p className="text-sm mt-1">{request.admin_notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Voir détails
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Détails de la demande de sponsoring</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Annonce</Label>
                            <p className="font-medium">{selectedRequest.listing?.title}</p>
                            <p className="text-sm text-muted-foreground">{selectedRequest.listing?.city}</p>
                          </div>
                          <div>
                            <Label>Utilisateur</Label>
                            <p className="font-medium">{selectedRequest.user?.full_name || selectedRequest.user?.email}</p>
                            {selectedRequest.user?.phone && (
                              <p className="text-sm text-muted-foreground">{selectedRequest.user.phone}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label>Package</Label>
                            <p className="font-medium">{selectedRequest.package?.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedRequest.package?.duration_days} jours</p>
                          </div>
                          <div>
                            <Label>Montant</Label>
                            <p className="font-medium">{formatPrice(selectedRequest.amount_paid)}</p>
                          </div>
                          <div>
                            <Label>Date de demande</Label>
                            <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>

                        {selectedRequest.approval_status === 'pending' && (
                          <div className="space-y-4 border-t pt-4">
                            <div>
                              <Label htmlFor="admin-notes">Notes administrateur (optionnel)</Label>
                              <Textarea
                                id="admin-notes"
                                placeholder="Ajouter des commentaires sur cette demande..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="mt-2"
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleApproval(selectedRequest.id, 'approve')}
                                disabled={actionLoading === selectedRequest.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approuver
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleApproval(selectedRequest.id, 'reject')}
                                disabled={actionLoading === selectedRequest.id}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeter
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {request.approval_status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setAdminNotes("");
                        // Trigger approval directly for quick action
                        handleApproval(request.id, 'approve');
                      }}
                      disabled={actionLoading === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setAdminNotes("");
                        handleApproval(request.id, 'reject');
                      }}
                      disabled={actionLoading === request.id}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {requests.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune demande de sponsoring pour le moment</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminSponsorshipPanel;