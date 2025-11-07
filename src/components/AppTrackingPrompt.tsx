import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Capacitor } from '@capacitor/core';

export const AppTrackingPrompt = () => {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Vérifier si on est sur iOS natif
    if (Capacitor.getPlatform() === 'ios') {
      const hasAsked = localStorage.getItem('tracking_permission_asked');
      if (!hasAsked) {
        // Attendre un peu avant d'afficher le prompt
        setTimeout(() => {
          setShowDialog(true);
        }, 2000);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('tracking_permission_asked', 'true');
    localStorage.setItem('tracking_permission', 'granted');
    setShowDialog(false);
    // Dans une vraie implémentation iOS, on appellerait ATTrackingManager ici
  };

  const handleDecline = () => {
    localStorage.setItem('tracking_permission_asked', 'true');
    localStorage.setItem('tracking_permission', 'denied');
    setShowDialog(false);
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Autoriser le suivi ?</DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p>
              LaZone Afrique souhaite accéder aux données de suivi pour :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Améliorer votre expérience utilisateur</li>
              <li>Personnaliser le contenu affiché</li>
              <li>Mesurer l'efficacité de nos services</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Vous pouvez modifier ce choix à tout moment dans les paramètres de votre appareil.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-2">
          <Button onClick={handleAccept}>
            Autoriser
          </Button>
          <Button variant="outline" onClick={handleDecline}>
            Demander à l'app de ne pas effectuer de suivi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};