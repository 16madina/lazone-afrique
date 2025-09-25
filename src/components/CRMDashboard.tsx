import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar, 
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Target
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'nouveau' | 'contacte' | 'interesse' | 'negocie' | 'converti' | 'perdu';
  source: 'site_web' | 'referral' | 'social_media' | 'publicite' | 'autre';
  propertyInterest?: string;
  budget?: number;
  notes: string;
  lastContact?: string;
  createdAt: string;
  assignedTo?: string;
  priority: 'basse' | 'moyenne' | 'haute';
}

interface Activity {
  id: string;
  leadId: string;
  type: 'appel' | 'email' | 'visite' | 'meeting' | 'note';
  description: string;
  date: string;
  userId: string;
}

interface CRMStats {
  totalLeads: number;
  newLeads: number;
  conversionRate: number;
  avgResponseTime: number;
  monthlyRevenue: number;
}

export const CRMDashboard = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<CRMStats>({
    totalLeads: 0,
    newLeads: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLeadDialog, setNewLeadDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCRMData();
    }
  }, [user]);

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      // Simuler des données CRM pour l'exemple
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'Marie Kouassi',
          email: 'marie.kouassi@email.com',
          phone: '+225 07 12 34 56 78',
          status: 'interesse',
          source: 'site_web',
          propertyInterest: 'Appartement 3 pièces Cocody',
          budget: 25000000,
          notes: 'Recherche appartement pour sa famille. Budget flexible.',
          lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'haute'
        },
        {
          id: '2',
          name: 'Jean-Baptiste Traoré',
          email: 'jb.traore@email.com',
          phone: '+225 05 98 76 54 32',
          status: 'nouveau',
          source: 'referral',
          propertyInterest: 'Villa 4 chambres Riviera',
          budget: 45000000,
          notes: 'Contact récent via recommendation.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'moyenne'
        },
        {
          id: '3',
          name: 'Aminata Diallo',
          email: 'aminata.diallo@email.com',
          status: 'negocie',
          source: 'publicite',
          propertyInterest: 'Terrain 500m² Bingerville',
          budget: 15000000,
          notes: 'En négociation pour le terrain. Très motivée.',
          lastContact: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'haute'
        }
      ];

      const mockActivities: Activity[] = [
        {
          id: '1',
          leadId: '1',
          type: 'appel',
          description: 'Appel de suivi - Intéressée par la visite',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          userId: user?.id || ''
        },
        {
          id: '2',
          leadId: '3',
          type: 'meeting',
          description: 'RDV sur site pour visiter le terrain',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          userId: user?.id || ''
        }
      ];

      const mockStats: CRMStats = {
        totalLeads: mockLeads.length,
        newLeads: mockLeads.filter(l => l.status === 'nouveau').length,
        conversionRate: 15.5,
        avgResponseTime: 2.3,
        monthlyRevenue: 125000000
      };

      setLeads(mockLeads);
      setActivities(mockActivities);
      setStats(mockStats);

    } catch (error) {
      console.error('Erreur lors du chargement des données CRM:', error);
      toast.error('Erreur lors du chargement des données CRM');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'nouveau': return 'bg-blue-500';
      case 'contacte': return 'bg-yellow-500';
      case 'interesse': return 'bg-green-500';
      case 'negocie': return 'bg-orange-500';
      case 'converti': return 'bg-emerald-500';
      case 'perdu': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Lead['status']) => {
    switch (status) {
      case 'nouveau': return 'Nouveau';
      case 'contacte': return 'Contacté';
      case 'interesse': return 'Intéressé';
      case 'negocie': return 'En négociation';
      case 'converti': return 'Converti';
      case 'perdu': return 'Perdu';
      default: return status;
    }
  };

  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'haute': return 'text-red-600 bg-red-50';
      case 'moyenne': return 'text-yellow-600 bg-yellow-50';
      case 'basse': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CRM Dashboard</h2>
        <Dialog open={newLeadDialog} onOpenChange={setNewLeadDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Nouveau Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nom complet" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Téléphone (optionnel)" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site_web">Site Web</SelectItem>
                  <SelectItem value="referral">Recommandation</SelectItem>
                  <SelectItem value="social_media">Réseaux Sociaux</SelectItem>
                  <SelectItem value="publicite">Publicité</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Budget estimé (FCFA)" type="number" />
              <Textarea placeholder="Notes initiales" rows={3} />
              <div className="flex gap-2">
                <Button onClick={() => setNewLeadDialog(false)}>
                  Ajouter
                </Button>
                <Button variant="outline" onClick={() => setNewLeadDialog(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques CRM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">+12% ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLeads}</div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <Progress value={stats.conversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Réponse</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">Moyenne</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Mensuel</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.monthlyRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-green-600">+25% vs mois dernier</p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          {/* Filtres */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="nouveau">Nouveau</SelectItem>
                <SelectItem value="contacte">Contacté</SelectItem>
                <SelectItem value="interesse">Intéressé</SelectItem>
                <SelectItem value="negocie">En négociation</SelectItem>
                <SelectItem value="converti">Converti</SelectItem>
                <SelectItem value="perdu">Perdu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des leads */}
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{lead.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(lead.priority)}`}
                          >
                            {lead.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                        
                        {lead.propertyInterest && (
                          <p className="text-sm mt-1">
                            <strong>Intérêt:</strong> {lead.propertyInterest}
                          </p>
                        )}
                        
                        {lead.lastContact && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Dernier contact: {formatDistanceToNow(new Date(lead.lastContact), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.status)}`} />
                        <span className="text-sm font-medium">
                          {getStatusLabel(lead.status)}
                        </span>
                      </div>
                      
                      {lead.budget && (
                        <Badge variant="outline">
                          {(lead.budget / 1000000).toFixed(1)}M FCFA
                        </Badge>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="w-4 h-4 mr-2" />
                            Appeler
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Envoyer email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Ajouter note
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activités Récentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity) => {
                const lead = leads.find(l => l.id === activity.leadId);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {activity.type === 'appel' && <Phone className="w-4 h-4" />}
                      {activity.type === 'email' && <Mail className="w-4 h-4" />}
                      {activity.type === 'meeting' && <Calendar className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead?.name} • {formatDistanceToNow(new Date(activity.date), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion par Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Site Web</span>
                    <Badge>18%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Recommandations</span>
                    <Badge>25%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Publicité</span>
                    <Badge>12%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Réseaux Sociaux</span>
                    <Badge>8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Objectifs Mensuels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Nouveaux Leads</span>
                    <span>12/20</span>
                  </div>
                  <Progress value={60} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Conversions</span>
                    <span>3/5</span>
                  </div>
                  <Progress value={60} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>CA Objectif</span>
                    <span>125M/150M FCFA</span>
                  </div>
                  <Progress value={83} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog détail lead */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du Lead - {selectedLead.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p>{selectedLead.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <p>{selectedLead.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <Badge className={getStatusColor(selectedLead.status)}>
                    {getStatusLabel(selectedLead.status)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Budget</label>
                  <p>{selectedLead.budget ? `${selectedLead.budget.toLocaleString()} FCFA` : 'Non renseigné'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Propriété d'intérêt</label>
                <p>{selectedLead.propertyInterest || 'Non spécifiée'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <p>{selectedLead.notes || 'Aucune note'}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};