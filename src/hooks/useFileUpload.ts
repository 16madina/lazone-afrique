import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, bucket: string, path?: string) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = path || `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { url: publicUrl, path: fileName };
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};