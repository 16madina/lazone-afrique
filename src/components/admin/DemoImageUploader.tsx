import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadStatus {
  name: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

export const DemoImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<ImageUploadStatus[]>([]);

  const demoImages = [
    { filename: 'villa-cocody-luxury.jpg', path: '/demo-images/villa-cocody-luxury.jpg' },
    { filename: 'duplex-marcory.jpg', path: '/demo-images/duplex-marcory.jpg' },
    { filename: 'terrain-bingerville.jpg', path: '/demo-images/terrain-bingerville.jpg' },
    { filename: 'villa-riviera-piscine.jpg', path: '/demo-images/villa-riviera-piscine.jpg' },
    { filename: 'appartement-plateau-standing.jpg', path: '/demo-images/appartement-plateau-standing.jpg' },
  ];

  const uploadImageToSupabase = async (filename: string, localPath: string) => {
    try {
      // Fetch l'image depuis le dossier public
      const response = await fetch(localPath);
      if (!response.ok) {
        throw new Error(`Image non trouvée: ${localPath}`);
      }

      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });

      // Upload vers Supabase Storage dans le dossier demo/
      const { data, error } = await supabase.storage
        .from('property-photos')
        .upload(`demo/${filename}`, file, {
          upsert: true,
          contentType: blob.type
        });

      if (error) {
        throw error;
      }

      // Vérifier que l'URL publique est accessible
      const { data: { publicUrl } } = supabase.storage
        .from('property-photos')
        .getPublicUrl(`demo/${filename}`);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error(`Erreur upload ${filename}:`, error);
      return { success: false, error: error.message };
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    
    // Initialiser les statuts
    const initialStatuses = demoImages.map(img => ({
      name: img.filename,
      status: 'pending' as const
    }));
    setUploadStatuses(initialStatuses);

    let successCount = 0;
    let errorCount = 0;

    // Upload chaque image
    for (let i = 0; i < demoImages.length; i++) {
      const { filename, path } = demoImages[i];
      
      // Mettre à jour le statut en "uploading"
      setUploadStatuses(prev => 
        prev.map((status, idx) => 
          idx === i ? { ...status, status: 'uploading' as const } : status
        )
      );

      const result = await uploadImageToSupabase(filename, path);

      if (result.success) {
        successCount++;
        setUploadStatuses(prev => 
          prev.map((status, idx) => 
            idx === i 
              ? { ...status, status: 'success' as const, message: result.url } 
              : status
          )
        );
      } else {
        errorCount++;
        setUploadStatuses(prev => 
          prev.map((status, idx) => 
            idx === i 
              ? { ...status, status: 'error' as const, message: result.error } 
              : status
          )
        );
      }
    }

    setUploading(false);

    // Afficher le résultat
    if (errorCount === 0) {
      toast.success(`✅ ${successCount} images uploadées avec succès dans Supabase Storage!`);
    } else {
      toast.warning(`⚠️ ${successCount} réussies, ${errorCount} échouées`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Uploader les Images Démo vers Supabase
        </CardTitle>
        <CardDescription>
          Cliquez sur le bouton pour uploader automatiquement toutes les images démo vers le bucket Supabase Storage "property-photos/demo/"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleUploadAll} 
          disabled={uploading}
          size="lg"
          className="w-full"
        >
          {uploading ? 'Upload en cours...' : 'Uploader toutes les images'}
        </Button>

        {uploadStatuses.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="font-semibold text-sm">Statut de l'upload:</h3>
            {uploadStatuses.map((status, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <span className="text-sm font-mono">{status.name}</span>
                <div className="flex items-center gap-2">
                  {status.status === 'pending' && (
                    <span className="text-xs text-muted-foreground">En attente...</span>
                  )}
                  {status.status === 'uploading' && (
                    <span className="text-xs text-primary animate-pulse">Upload...</span>
                  )}
                  {status.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {status.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {uploadStatuses.length > 0 && uploadStatuses.every(s => s.status === 'success') && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ Toutes les images ont été uploadées avec succès! Les annonces démo devraient maintenant afficher les images correctement.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
