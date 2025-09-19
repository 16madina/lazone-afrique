import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UploadedMedia {
  id: string;
  url: string;
  type: 'photo' | 'video';
  file: File;
}

export const useMediaUpload = () => {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedMedia[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedMedia | null>(null);
  const [uploading, setUploading] = useState(false);

  // Function to load existing media from URLs
  const loadExistingMedia = useCallback((photos: string[], video?: string) => {
    // Load existing photos
    if (photos && photos.length > 0) {
      const existingPhotos: UploadedMedia[] = photos.map((url, index) => ({
        id: `existing-photo-${index}`,
        url,
        type: 'photo' as const,
        file: new File([], `existing-photo-${index}.jpg`, { type: 'image/jpeg' })
      }));
      setUploadedPhotos(existingPhotos);
    }

    // Load existing video
    if (video) {
      const existingVideo: UploadedMedia = {
        id: 'existing-video',
        url: video,
        type: 'video' as const,
        file: new File([], 'existing-video.mp4', { type: 'video/mp4' })
      };
      setUploadedVideo(existingVideo);
    }
  }, []);

  // Function to clear all media
  const clearAllMedia = useCallback(() => {
    setUploadedPhotos([]);
    setUploadedVideo(null);
  }, []);

  const uploadPhoto = async (file: File): Promise<void> => {
    if (uploadedPhotos.length >= 20) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez ajouter que 20 photos maximum.",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner une image valide.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Fichier trop volumineux",
        description: "Les photos doivent faire moins de 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour télécharger des fichiers.",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('property-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('property-photos')
        .getPublicUrl(fileName);

      const newPhoto: UploadedMedia = {
        id: fileName,
        url: publicUrl,
        type: 'photo',
        file
      };

      setUploadedPhotos(prev => [...prev, newPhoto]);
      
      toast({
        title: "Photo ajoutée",
        description: "Votre photo a été téléchargée avec succès."
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger la photo. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadVideo = async (file: File): Promise<void> => {
    if (uploadedVideo) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez ajouter qu'une seule vidéo.",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner une vidéo valide.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
      toast({
        title: "Fichier trop volumineux",
        description: "Les vidéos doivent faire moins de 50MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour télécharger des fichiers.",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_video.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('property-videos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('property-videos')
        .getPublicUrl(fileName);

      const newVideo: UploadedMedia = {
        id: fileName,
        url: publicUrl,
        type: 'video',
        file
      };

      setUploadedVideo(newVideo);
      
      toast({
        title: "Vidéo ajoutée",
        description: "Votre vidéo a été téléchargée avec succès."
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger la vidéo. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (photoId: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from('property-photos')
        .remove([photoId]);

      if (error) throw error;

      setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
      
      toast({
        title: "Photo supprimée",
        description: "La photo a été supprimée avec succès."
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo.",
        variant: "destructive"
      });
    }
  };

  const removeVideo = async (): Promise<void> => {
    if (!uploadedVideo) return;

    try {
      const { error } = await supabase.storage
        .from('property-videos')
        .remove([uploadedVideo.id]);

      if (error) throw error;

      setUploadedVideo(null);
      
      toast({
        title: "Vidéo supprimée",
        description: "La vidéo a été supprimée avec succès."
      });
    } catch (error) {
      console.error('Error removing video:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vidéo.",
        variant: "destructive"
      });
    }
  };

  return {
    uploadedPhotos,
    uploadedVideo,
    uploading,
    uploadPhoto,
    uploadVideo,
    removePhoto,
    removeVideo,
    loadExistingMedia,
    clearAllMedia,
    setUploadedPhotos,
    setUploadedVideo
  };
};