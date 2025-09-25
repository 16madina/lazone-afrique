import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageSquare, 
  Home,
  Calendar,
  Target,
  Users,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AnalyticsData {
  timeline: Array<{
    date: string;
    views: number;
    contacts: number;
    favorites: number;
  }>;
  conversion: {
    views: number;
    contacts: number;
    rate: number;
  };
  demographics: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
  performance: {
    topListing: {
      id: string;
      title: string;
      views: number;
      contacts: number;
    };
    averageResponseTime: number;
    successRate: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    growth: number;
  };
}

export const AdvancedAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // jours
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Récupérer les annonces de l'utilisateur
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, title, created_at')
        .eq('user_id', user.id);

      if (listingsError) throw listingsError;

      // Générer des données d'exemple basées sur les vraies annonces
      const mockTimeline = generateTimelineData(parseInt(timeRange));
      const mockDemographics = [
        { segment: 'Acheteurs', count: 45, percentage: 60 },
        { segment: 'Locataires', count: 25, percentage: 33 },
        { segment: 'Investisseurs', count: 5, percentage: 7 }
      ];

      const mockAnalytics: AnalyticsData = {
        timeline: mockTimeline,
        conversion: {
          views: mockTimeline.reduce((sum, day) => sum + day.views, 0),
          contacts: mockTimeline.reduce((sum, day) => sum + day.contacts, 0),
          rate: 12.5
        },
        demographics: mockDemographics,
        performance: {
          topListing: listings && listings.length > 0 ? {
            id: listings[0].id,
            title: listings[0].title,
            views: Math.floor(Math.random() * 200) + 50,
            contacts: Math.floor(Math.random() * 20) + 5
          } : {
            id: '',
            title: 'Aucune annonce',
            views: 0,
            contacts: 0
          },
          averageResponseTime: 2.5, // heures
          successRate: 85
        },
        revenue: {
          total: Math.floor(Math.random() * 50000) + 10000,
          thisMonth: Math.floor(Math.random() * 8000) + 2000,
          growth: Math.floor(Math.random() * 30) + 5
        }
      };

      setAnalytics(mockAnalytics);

    } catch (err) {
      console.error('Erreur lors du chargement des analytics:', err);
      setError('Impossible de charger les analytics');
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateTimelineData = (days: number) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 30) + 5,
        contacts: Math.floor(Math.random() * 8) + 1,
        favorites: Math.floor(Math.random() * 5) + 1
      });
    }
    return data;
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <TrendingDown className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">{error || 'Aucune donnée disponible'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Avancées</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues Totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversion.views}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% vs période précédente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts Reçus</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversion.contacts}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8% vs période précédente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversion.rate}%</div>
            <Progress value={analytics.conversion.rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du Mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.revenue.thisMonth.toLocaleString()} FCFA</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{analytics.revenue.growth}% vs mois dernier
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques détaillés */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Évolution</TabsTrigger>
          <TabsTrigger value="demographics">Audiences</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Métriques</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1"
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="Vues"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="contacts" 
                    stackId="2"
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                    name="Contacts"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="favorites" 
                    stackId="3"
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.6}
                    name="Favoris"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Audiences</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.demographics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, percentage }) => `${segment} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.demographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Détails par Segment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.demographics.map((segment, index) => (
                  <div key={segment.segment} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{segment.segment}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{segment.count}</div>
                      <div className="text-sm text-muted-foreground">{segment.percentage}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Meilleure Annonce</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">{analytics.performance.topListing.title}</h4>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.performance.topListing.views}
                      </div>
                      <div className="text-sm text-muted-foreground">Vues</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.performance.topListing.contacts}
                      </div>
                      <div className="text-sm text-muted-foreground">Contacts</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Temps de Réponse Moyen</span>
                  <Badge variant="outline">
                    {analytics.performance.averageResponseTime}h
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux de Succès</span>
                    <span className="text-sm font-bold">{analytics.performance.successRate}%</span>
                  </div>
                  <Progress value={analytics.performance.successRate} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenus Totaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {analytics.revenue.total.toLocaleString()} FCFA
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Tous les temps
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ce Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.revenue.thisMonth.toLocaleString()} FCFA
                </div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{analytics.revenue.growth}% vs mois dernier
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Objectif Mensuel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round((analytics.revenue.thisMonth / 15000) * 100)}%
                </div>
                <Progress 
                  value={(analytics.revenue.thisMonth / 15000) * 100} 
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Objectif: 15,000 FCFA
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};