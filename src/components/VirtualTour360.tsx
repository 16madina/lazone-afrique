import React, { useState, useRef, useEffect } from 'react';
import { Camera, Play, Pause, RotateCcw, Maximize, Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface VirtualTour360Props {
  listingId: string;
  isOwner?: boolean;
  className?: string;
}

interface TourData {
  id: string;
  title: string;
  description?: string;
  tour_type: string;
  tour_data: any;
  is_active: boolean;
}

export const VirtualTour360 = ({ listingId, isOwner = false, className }: VirtualTour360Props) => {
  const { user } = useAuth();
  const [tours, setTours] = useState<TourData[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPanorama, setCurrentPanorama] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const panoramaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Form states
  const [tourTitle, setTourTitle] = useState('');
  const [tourDescription, setTourDescription] = useState('');
  const [tourType, setTourType] = useState<'360_photos' | 'video_tour'>('360_photos');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    loadVirtualTours();
  }, [listingId]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadVirtualTours = async () => {
    try {
      const { data, error } = await supabase
        .from('virtual_tours')
        .select('*')
        .eq('listing_id', listingId)
        .eq('is_active', true);

      if (error) throw error;
      setTours(data || []);
      
      if (data && data.length > 0) {
        setSelectedTour(data[0]);
      }
    } catch (error) {
      console.error('Error loading virtual tours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return [];
    
    const uploadedUrls: string[] = [];
    setUploadProgress(0);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      try {
        const { data, error } = await supabase.storage
          .from('property-photos')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('property-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Erreur lors du téléchargement de ${file.name}`);
      }
    }
    
    return uploadedUrls;
  };

  const handleCreateTour = async () => {
    if (!tourTitle.trim() || selectedFiles.length === 0) {
      toast.error('Veuillez remplir le titre et sélectionner des fichiers');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls = await handleFileUpload(selectedFiles);
      
      if (uploadedUrls.length === 0) {
        throw new Error('Aucun fichier téléchargé avec succès');
      }

      const tourData = {
        [tourType === '360_photos' ? 'panorama_urls' : 'photos']: uploadedUrls
      };

      const { data, error } = await supabase
        .from('virtual_tours')
        .insert({
          listing_id: listingId,
          title: tourTitle,
          description: tourDescription.trim() || null,
          tour_type: tourType,
          tour_data: tourData
        });

      if (error) throw error;

      toast.success('Visite virtuelle créée avec succès!');
      setShowCreateDialog(false);
      resetForm();
      loadVirtualTours();
    } catch (error) {
      console.error('Error creating virtual tour:', error);
      toast.error('Erreur lors de la création de la visite virtuelle');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTourTitle('');
    setTourDescription('');
    setTourType('360_photos');
    setSelectedFiles([]);
  };

  const startAutoPlay = () => {
    if (!selectedTour?.tour_data.panorama_urls) return;
    
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentPanorama(prev => 
        (prev + 1) % (selectedTour.tour_data.panorama_urls?.length || 1)
      );
    }, 3000);
  };

  const stopAutoPlay = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTour = () => {
    setCurrentPanorama(0);
    stopAutoPlay();
  };

  const getCurrentPanoramaUrl = () => {
    if (!selectedTour?.tour_data.panorama_urls) return null;
    return selectedTour.tour_data.panorama_urls[currentPanorama];
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement des visites virtuelles...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Visites Virtuelles 360°
          </CardTitle>
          {isOwner && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Créer une visite
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer une visite virtuelle 360°</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Titre</label>
                    <Input
                      value={tourTitle}
                      onChange={(e) => setTourTitle(e.target.value)}
                      placeholder="Ex: Visite complète de la villa"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description (optionnelle)</label>
                    <Textarea
                      value={tourDescription}
                      onChange={(e) => setTourDescription(e.target.value)}
                      placeholder="Décrivez votre visite virtuelle..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Photos 360° / Panoramiques</label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Sélectionnez plusieurs photos panoramiques ou 360° de votre propriété
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium">{selectedFiles.length} fichier(s) sélectionné(s)</p>
                      <div className="text-xs text-muted-foreground">
                        {selectedFiles.map((file, index) => (
                          <div key={index}>{file.name}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Téléchargement en cours...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleCreateTour} 
                      disabled={isUploading || !tourTitle.trim() || selectedFiles.length === 0}
                      className="flex-1"
                    >
                      {isUploading ? 'Création...' : 'Créer la visite'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {tours.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isOwner ? 'Aucune visite virtuelle créée' : 'Aucune visite virtuelle disponible'}
            </p>
            {isOwner && (
              <p className="text-sm text-muted-foreground mt-2">
                Créez une visite virtuelle 360° pour permettre aux visiteurs d'explorer votre propriété
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tour Selection */}
            {tours.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {tours.map((tour) => (
                  <Badge
                    key={tour.id}
                    variant={selectedTour?.id === tour.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTour(tour);
                      setCurrentPanorama(0);
                      stopAutoPlay();
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {tour.title}
                  </Badge>
                ))}
              </div>
            )}

            {selectedTour && (
              <div className="space-y-4">
                {/* Panorama Viewer */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {getCurrentPanoramaUrl() ? (
                    <img
                      src={getCurrentPanoramaUrl()!}
                      alt={`Panorama ${currentPanorama + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <Camera className="h-12 w-12 opacity-50" />
                    </div>
                  )}

                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetTour}
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    
                    {selectedTour.tour_data.panorama_urls && selectedTour.tour_data.panorama_urls.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={isPlaying ? stopAutoPlay : startAutoPlay}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl h-[80vh]">
                        <div className="h-full">
                          <img
                            src={getCurrentPanoramaUrl()!}
                            alt="Panorama plein écran"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Panorama Navigation */}
                  {selectedTour.tour_data.panorama_urls && selectedTour.tour_data.panorama_urls.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                      <div className="text-white text-xs">
                        {currentPanorama + 1} / {selectedTour.tour_data.panorama_urls.length}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tour Info */}
                <div>
                  <h3 className="font-semibold">{selectedTour.title}</h3>
                  {selectedTour.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedTour.description}</p>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {selectedTour.tour_data.panorama_urls && selectedTour.tour_data.panorama_urls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedTour.tour_data.panorama_urls.map((url, index) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 w-20 h-12 rounded cursor-pointer overflow-hidden border-2 transition-colors ${
                          currentPanorama === index ? 'border-primary' : 'border-transparent hover:border-primary/50'
                        }`}
                        onClick={() => setCurrentPanorama(index)}
                      >
                        <img
                          src={url}
                          alt={`Miniature ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VirtualTour360;