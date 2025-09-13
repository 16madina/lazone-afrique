import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, bucket: string, path?: string) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = path || `${Date.now()}-${Math.random()}.${fileExt}`;
      
      console.log('Uploading file to bucket:', bucket, 'path:', fileName);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Upload data:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);
      return { url: publicUrl, path: fileName };
    } catch (error: any) {
      console.error('Upload file error:', error);
      throw new Error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};