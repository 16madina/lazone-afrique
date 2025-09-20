import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserStats } from '@/hooks/useUserStats';

interface UserRatingDialogProps {
  targetUserId: string;
  targetUserName: string;
  listingId?: string;
  listingTitle?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const UserRatingDialog = ({ 
  targetUserId, 
  targetUserName, 
  listingId,
  listingTitle,
  children,
  disabled = false
}: UserRatingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { submitRating } = useUserStats();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une note",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    const success = await submitRating(targetUserId, rating, comment, listingId);
    
    if (success) {
      toast({
        title: "Succès",
        description: "Votre évaluation a été soumise avec succès",
      });
      setOpen(false);
      setRating(0);
      setComment('');
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre évaluation",
        variant: "destructive",
      });
    }
    
    setSubmitting(false);
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const getRatingText = (value: number) => {
    switch (value) {
      case 1: return "Très mauvais";
      case 2: return "Mauvais";
      case 3: return "Moyen";
      case 4: return "Bon";
      case 5: return "Excellent";
      default: return "Sélectionnez une note";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Évaluer {targetUserName}</DialogTitle>
          <DialogDescription>
            {listingTitle ? 
              `Donnez votre avis sur votre expérience avec ${targetUserName} concernant "${listingTitle}"` :
              `Donnez votre avis sur votre expérience avec ${targetUserName}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Note</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStarClick(value)}
                  onMouseEnter={() => handleStarHover(value)}
                  onMouseLeave={handleStarLeave}
                  className="p-1 rounded transition-colors hover:bg-muted"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      value <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {getRatingText(hoveredRating || rating)}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              placeholder="Partagez votre expérience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={rating === 0 || submitting}
            >
              {submitting ? "Envoi..." : "Soumettre"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};