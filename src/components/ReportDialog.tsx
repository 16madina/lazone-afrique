import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle } from 'lucide-react';
import { useContentReports, ReportType } from '@/hooks/useContentReports';

interface ReportDialogProps {
  type: 'listing' | 'user';
  targetId: string;
  trigger?: React.ReactNode;
}

export const ReportDialog = ({ type, targetId, trigger }: ReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('inappropriate_content');
  const [description, setDescription] = useState('');
  const { reportListing, reportUser, loading } = useContentReports();

  const reportTypes = [
    { value: 'inappropriate_content', label: 'Contenu inapproprié' },
    { value: 'spam', label: 'Spam' },
    { value: 'fraud', label: 'Fraude / Arnaque' },
    { value: 'harassment', label: 'Harcèlement' },
    { value: 'other', label: 'Autre' },
  ];

  const handleSubmit = async () => {
    const success = type === 'listing' 
      ? await reportListing(targetId, reportType, description)
      : await reportUser(targetId, reportType, description);

    if (success) {
      setOpen(false);
      setDescription('');
      setReportType('inappropriate_content');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Signaler
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler {type === 'listing' ? 'une annonce' : 'un utilisateur'}</DialogTitle>
          <DialogDescription>
            Aidez-nous à maintenir une communauté sûre en signalant les contenus inappropriés.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type de problème</Label>
            <RadioGroup value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              {reportTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le problème..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le signalement'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};