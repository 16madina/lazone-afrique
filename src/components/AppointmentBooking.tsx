import React, { useState } from 'react';
import { Calendar, Clock, User, MessageSquare, Phone, Video, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AppointmentBookingProps {
  listingId: string;
  ownerId: string;
  listingTitle: string;
  className?: string;
}

interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
}

export const AppointmentBooking = ({ listingId, ownerId, listingTitle, className }: AppointmentBookingProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [visitType, setVisitType] = useState<'physical' | 'virtual' | 'video_call'>('physical');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots: TimeSlot[] = [
    { hour: 9, minute: 0, label: '09:00' },
    { hour: 10, minute: 0, label: '10:00' },
    { hour: 11, minute: 0, label: '11:00' },
    { hour: 14, minute: 0, label: '14:00' },
    { hour: 15, minute: 0, label: '15:00' },
    { hour: 16, minute: 0, label: '16:00' },
    { hour: 17, minute: 0, label: '17:00' },
  ];

  const visitTypes = [
    { value: 'physical', label: 'Visite physique', icon: MapPin, description: 'Visite sur place' },
    { value: 'virtual', label: 'Visite virtuelle', icon: Video, description: 'Visite en ligne' },
    { value: 'video_call', label: 'Appel vidéo', icon: Phone, description: 'Entretien vidéo' },
  ];

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour demander un rendez-vous');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Veuillez sélectionner une date et une heure');
      return;
    }

    setIsLoading(true);
    try {
      const [hour, minute] = selectedTime.split(':').map(Number);
      const requestedDateTime = new Date(selectedDate);
      requestedDateTime.setHours(hour, minute, 0, 0);

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          listing_id: listingId,
          visitor_user_id: user.id,
          owner_user_id: ownerId,
          requested_date: requestedDateTime.toISOString(),
          visit_type: visitType,
          notes: notes.trim() || null
        });

      if (error) throw error;

      toast.success('Demande de rendez-vous envoyée avec succès!');
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    setVisitType('physical');
    setNotes('');
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getVisitTypeIcon = (type: string) => {
    const visitType = visitTypes.find(vt => vt.value === type);
    return visitType ? visitType.icon : MapPin;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <Calendar className="h-4 w-4 mr-2" />
          Demander une visite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pb-safe">
        <DialogHeader>
          <DialogTitle>Réserver une visite</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pb-4">
          {/* Property Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{listingTitle}</h3>
                  <p className="text-sm text-muted-foreground">Propriété à visiter</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visit Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Type de visite</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {visitTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      visitType === type.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setVisitType(type.value as any)}
                  >
                    <CardContent className="pt-4">
                      <div className="text-center space-y-2">
                        <div className="flex justify-center">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <h4 className="font-medium text-sm">{type.label}</h4>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Date souhaitée</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Heure souhaitée</label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une heure" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.label} value={slot.label}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {slot.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Message (optionnel)</label>
            <Textarea
              placeholder="Ajoutez des informations supplémentaires sur votre demande..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedDate && selectedTime && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">Résumé de votre demande</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(selectedDate, 'PPP', { locale: fr })} à {selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {React.createElement(getVisitTypeIcon(visitType), { className: "h-4 w-4 text-muted-foreground" })}
                    <span>{visitTypes.find(vt => vt.value === visitType)?.label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !selectedDate || !selectedTime} className="flex-1">
              {isLoading ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBooking;