import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SponsorButtonProps {
  listingId: string;
  userId?: string;
}

const SponsorButton = ({ listingId, userId }: SponsorButtonProps) => {
  const navigate = useNavigate();
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsoredUntil, setSponsoredUntil] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    checkSponsorshipStatus();
  }, [listingId]);

  const checkSponsorshipStatus = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('is_sponsored, sponsored_until')
      .eq('id', listingId)
      .single();

    if (data && !error) {
      const sponsored = data.is_sponsored && data.sponsored_until && new Date(data.sponsored_until) > new Date();
      setIsSponsored(sponsored);
      setSponsoredUntil(data.sponsored_until);
    }
  };

  // Only show to the owner of the listing
  if (!user || user.id !== userId) {
    return null;
  }

  if (isSponsored && sponsoredUntil) {
    const expiryDate = new Date(sponsoredUntil);
    const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="flex flex-col gap-2">
        <Button variant="secondary" disabled className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          Sponsorisée ({daysLeft}j restants)
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate(`/sponsorship/${listingId}`)}>
          <Zap className="h-4 w-4" />
          Prolonger le boost
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="default" 
      className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
      onClick={() => navigate(`/sponsorship/${listingId}`)}
    >
      <Zap className="h-4 w-4" />
      Booster cette annonce
    </Button>
  );
};

export default SponsorButton;