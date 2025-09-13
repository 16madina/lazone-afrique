import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

const AdminSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin(!error && !!data);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const makeAdmin = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_roles')
        .insert({ user_id: user.id });

      if (error) {
        throw error;
      }

      setIsAdmin(true);
      toast({
        title: 'Succès',
        description: 'Vous êtes maintenant administrateur'
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-600">
            <Shield className="w-5 h-5" />
            <span>Vous êtes administrateur</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accès administrateur</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Cliquez ici pour obtenir les privilèges d'administrateur et accéder au panneau d'administration.
        </p>
        <Button onClick={makeAdmin} disabled={loading}>
          {loading ? 'En cours...' : 'Devenir administrateur'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;