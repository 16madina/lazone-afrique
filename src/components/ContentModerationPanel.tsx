import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ContentReport {
  id: string;
  reporter_id: string;
  reported_listing_id: string | null;
  reported_user_id: string | null;
  report_type: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reporter_profile?: {
    full_name: string;
    email: string;
  };
  listing?: {
    title: string;
  };
  reported_profile?: {
    full_name: string;
    email: string;
  };
}

export const ContentModerationPanel = () => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved'>('pending');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch related profiles manually
      if (data) {
        const reportsWithProfiles = await Promise.all(
          data.map(async (report) => {
            let reporterProfile = null;
            let reportedProfile = null;
            let listing = null;

            if (report.reporter_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('user_id', report.reporter_id)
                .single();
              reporterProfile = profile;
            }

            if (report.reported_user_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('user_id', report.reported_user_id)
                .single();
              reportedProfile = profile;
            }

            if (report.reported_listing_id) {
              const { data: listingData } = await supabase
                .from('listings')
                .select('title')
                .eq('id', report.reported_listing_id)
                .single();
              listing = listingData;
            }

            return {
              ...report,
              reporter_profile: reporterProfile,
              reported_profile: reportedProfile,
              listing: listing
            };
          })
        );
        
        setReports(reportsWithProfiles as any);
      }
    } catch (error: any) {
      console.error('Erreur chargement signalements:', error);
      toast.error('Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({
          status,
          admin_notes: adminNotes,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          resolved_by: status === 'resolved' ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Signalement ${status === 'resolved' ? 'résolu' : 'mis à jour'}`);
      fetchReports();
      setSelectedReport(null);
      setAdminNotes('');
    } catch (error: any) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteReportedContent = async (report: ContentReport) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;

    try {
      if (report.reported_listing_id) {
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', report.reported_listing_id);

        if (error) throw error;
      }

      await updateReportStatus(report.id, 'resolved');
      toast.success('Contenu supprimé avec succès');
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const banUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banned: true })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Utilisateur banni avec succès');
      fetchReports();
    } catch (error: any) {
      console.error('Erreur ban:', error);
      toast.error('Erreur lors du bannissement');
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      inappropriate_content: 'Contenu inapproprié',
      spam: 'Spam',
      fraud: 'Fraude',
      harassment: 'Harcèlement',
      other: 'Autre'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'destructive', icon: AlertTriangle, label: 'En attente' },
      reviewing: { variant: 'default', icon: Eye, label: 'En cours' },
      resolved: { variant: 'default', icon: CheckCircle, label: 'Résolu' },
      rejected: { variant: 'secondary', icon: XCircle, label: 'Rejeté' }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Modération de contenu</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les signalements et maintenez la qualité de la plateforme
          </p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {pendingCount} en attente
        </Badge>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Engagement de modération
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Tous les signalements sont examinés et traités sous 24 heures. 
                Les contenus violant nos conditions sont supprimés immédiatement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Tous ({reports.length})</TabsTrigger>
          <TabsTrigger value="pending">
            En attente ({reports.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="reviewing">
            En cours ({reports.filter(r => r.status === 'reviewing').length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Résolus ({reports.filter(r => r.status === 'resolved').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                Chargement...
              </CardContent>
            </Card>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun signalement
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {getReportTypeLabel(report.report_type)}
                        </CardTitle>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Signalé {formatDistanceToNow(new Date(report.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Signalé par</p>
                      <p className="text-sm">
                        {report.reporter_profile?.full_name} ({report.reporter_profile?.email})
                      </p>
                    </div>
                    {report.reported_listing_id && report.listing && (
                      <div>
                        <p className="text-sm font-medium mb-1">Annonce signalée</p>
                        <p className="text-sm">{report.listing.title}</p>
                      </div>
                    )}
                    {report.reported_user_id && report.reported_profile && (
                      <div>
                        <p className="text-sm font-medium mb-1">Utilisateur signalé</p>
                        <p className="text-sm">
                          {report.reported_profile.full_name} ({report.reported_profile.email})
                        </p>
                      </div>
                    )}
                  </div>

                  {report.description && (
                    <div>
                      <p className="text-sm font-medium mb-1">Description</p>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  )}

                  {selectedReport?.id === report.id && (
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <Label>Notes administrateur</Label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Ajoutez des notes sur votre décision..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateReportStatus(report.id, 'reviewing')}
                          variant="outline"
                        >
                          Marquer en cours
                        </Button>
                        <Button
                          onClick={() => updateReportStatus(report.id, 'resolved')}
                          variant="default"
                        >
                          Résoudre
                        </Button>
                        <Button
                          onClick={() => updateReportStatus(report.id, 'rejected')}
                          variant="secondary"
                        >
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  )}

                  {report.status !== 'resolved' && (
                    <div className="flex gap-2 flex-wrap">
                      {selectedReport?.id !== report.id && (
                        <Button
                          onClick={() => {
                            setSelectedReport(report);
                            setAdminNotes(report.admin_notes || '');
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Examiner
                        </Button>
                      )}
                      {report.reported_listing_id && (
                        <Button
                          onClick={() => deleteReportedContent(report)}
                          variant="destructive"
                          size="sm"
                        >
                          Supprimer l'annonce
                        </Button>
                      )}
                      {report.reported_user_id && (
                        <Button
                          onClick={() => banUser(report.reported_user_id!)}
                          variant="destructive"
                          size="sm"
                        >
                          Bannir l'utilisateur
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};