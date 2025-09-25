import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  id: string;
  listing_id: string;
  visitor_user_id: string;
  owner_user_id: string;
  requested_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  visit_type: 'physical' | 'virtual' | 'video_call';
  notes?: string;
  created_at: string;
  updated_at: string;
  listing?: {
    title: string;
    city: string;
    photos?: string[];
  };
  visitor_profile?: {
    full_name: string;
    avatar_url?: string;
    phone?: string;
  };
  owner_profile?: {
    full_name: string;
    avatar_url?: string;
    phone?: string;
  };
}

export const useAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          listings:listing_id (
            title,
            city,
            photos
          )
        `)
        .or(`visitor_user_id.eq.${user.id},owner_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profile information for each appointment
      const appointmentsWithProfiles = await Promise.all(
        (data || []).map(async (appointment) => {
          const isVisitor = appointment.visitor_user_id === user.id;
          const otherUserId = isVisitor ? appointment.owner_user_id : appointment.visitor_user_id;
          
          const { data: profileData } = await supabase.rpc('get_public_profile_safe', {
            profile_user_id: otherUserId
          });

          return {
            ...appointment,
            visitor_profile: isVisitor ? null : profileData,
            owner_profile: isVisitor ? profileData : null
          };
        })
      );

      setAppointments(appointmentsWithProfiles);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status } : apt
        )
      );

      const statusMessages = {
        confirmed: 'Rendez-vous confirmé',
        cancelled: 'Rendez-vous annulé',
        completed: 'Rendez-vous marqué comme terminé'
      };

      toast.success(statusMessages[status] || 'Statut mis à jour');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'cancelled');
  };

  const confirmAppointment = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'confirmed');
  };

  const completeAppointment = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'completed');
  };

  const getAppointmentsByStatus = (status: Appointment['status']) => {
    return appointments.filter(apt => apt.status === status);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.requested_date);
      return appointmentDate > now && (apt.status === 'pending' || apt.status === 'confirmed');
    });
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.requested_date);
      return appointmentDate < now || apt.status === 'completed';
    });
  };

  useEffect(() => {
    loadAppointments();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `visitor_user_id=eq.${user?.id}`,
        },
        () => {
          loadAppointments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `owner_user_id=eq.${user?.id}`,
        },
        () => {
          loadAppointments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    appointments,
    isLoading,
    loadAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    confirmAppointment,
    completeAppointment,
    getAppointmentsByStatus,
    getUpcomingAppointments,
    getPastAppointments
  };
};

export default useAppointments;