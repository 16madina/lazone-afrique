import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Video, MapPin, Check, X, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import useAppointments from '@/hooks/useAppointments';
import { useAuth } from '@/contexts/AuthContext';

interface AppointmentManagerProps {
  className?: string;
}

export const AppointmentManager = ({ className }: AppointmentManagerProps) => {
  const { user } = useAuth();
  const {
    appointments,
    isLoading,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    getAppointmentsByStatus,
    getUpcomingAppointments,
    getPastAppointments
  } = useAppointments();

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getVisitTypeIcon = (type: string) => {
    switch (type) {
      case 'physical': return MapPin;
      case 'virtual': return Eye;
      case 'video_call': return Video;
      default: return MapPin;
    }
  };

  const getVisitTypeLabel = (type: string) => {
    switch (type) {
      case 'physical': return 'Visite physique';
      case 'virtual': return 'Visite virtuelle';
      case 'video_call': return 'Appel vidéo';
      default: return type;
    }
  };

  const isOwner = (appointment: any) => {
    return appointment.owner_user_id === user?.id;
  };

  const getOtherUserProfile = (appointment: any) => {
    return isOwner(appointment) ? appointment.visitor_profile : appointment.owner_profile;
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => {
    const Icon = getVisitTypeIcon(appointment.visit_type);
    const otherUser = getOtherUserProfile(appointment);
    const isAppointmentOwner = isOwner(appointment);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{appointment.listing?.title}</h3>
                <p className="text-xs text-muted-foreground">{appointment.listing?.city}</p>
              </div>
              <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>

            {/* Date and Type */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(appointment.requested_date), 'PPP à p', { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">{getVisitTypeLabel(appointment.visit_type)}</span>
              </div>
            </div>

            {/* Other User Info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback>
                  {otherUser?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isAppointmentOwner ? 'Visiteur' : 'Propriétaire'}: {otherUser?.full_name || 'Utilisateur'}
                </p>
                {otherUser?.phone && (
                  <p className="text-xs text-muted-foreground">{otherUser.phone}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="bg-muted/50 p-2 rounded text-xs">
                <strong>Message:</strong> {appointment.notes}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Détails du rendez-vous</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">{appointment.listing?.title}</h4>
                      <p className="text-muted-foreground">{appointment.listing?.city}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Date:</strong><br />
                        {format(new Date(appointment.requested_date), 'PPP à p', { locale: fr })}
                      </div>
                      <div>
                        <strong>Type:</strong><br />
                        {getVisitTypeLabel(appointment.visit_type)}
                      </div>
                    </div>

                    <div>
                      <strong>{isAppointmentOwner ? 'Visiteur' : 'Propriétaire'}:</strong><br />
                      {otherUser?.full_name || 'Utilisateur'}
                      {otherUser?.phone && <><br />Tél: {otherUser.phone}</>}
                    </div>

                    {appointment.notes && (
                      <div>
                        <strong>Message:</strong><br />
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Action buttons based on status and role */}
              {appointment.status === 'pending' && isAppointmentOwner && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => confirmAppointment(appointment.id)}
                    className="flex-1"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Confirmer
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => cancelAppointment(appointment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}

              {appointment.status === 'pending' && !isAppointmentOwner && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => cancelAppointment(appointment.id)}
                  className="flex-1"
                >
                  <X className="h-3 w-3 mr-1" />
                  Annuler
                </Button>
              )}

              {appointment.status === 'confirmed' && (
                <>
                  <Button 
                    size="sm"
                    onClick={() => completeAppointment(appointment.id)}
                    className="flex-1"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Terminé
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => cancelAppointment(appointment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement des rendez-vous...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();
  const pendingAppointments = getAppointmentsByStatus('pending');
  const confirmedAppointments = getAppointmentsByStatus('confirmed');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Gestion des Rendez-vous
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">À venir ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="pending">En attente ({pendingAppointments.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmés ({confirmedAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Passés ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun rendez-vous à venir</p>
              </div>
            ) : (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune demande en attente</p>
              </div>
            ) : (
              pendingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-3 mt-4">
            {confirmedAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun rendez-vous confirmé</p>
              </div>
            ) : (
              confirmedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-3 mt-4">
            {pastAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun rendez-vous passé</p>
              </div>
            ) : (
              pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AppointmentManager;
