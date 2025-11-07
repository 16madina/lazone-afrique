import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ReportType = 'inappropriate_content' | 'spam' | 'fraud' | 'harassment' | 'other';

export const useContentReports = () => {
  const [loading, setLoading] = useState(false);

  const reportListing = async (
    listingId: string,
    reportType: ReportType,
    description?: string
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: user.id,
          reported_listing_id: listingId,
          report_type: reportType,
          description: description
        });

      if (error) throw error;

      toast.success('Signalement envoyé avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur signalement:', error);
      toast.error('Erreur lors du signalement');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reportUser = async (
    userId: string,
    reportType: ReportType,
    description?: string
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: userId,
          report_type: reportType,
          description: description
        });

      if (error) throw error;

      toast.success('Utilisateur signalé avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur signalement:', error);
      toast.error('Erreur lors du signalement');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { reportListing, reportUser, loading };
};