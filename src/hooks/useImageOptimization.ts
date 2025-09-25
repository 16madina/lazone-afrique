import { useState, useCallback } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export const useImageOptimization = () => {
  const [loading, setLoading] = useState(false);

  const optimizeImage = useCallback(async (
    file: File, 
    options: ImageOptimizationOptions = {}
  ): Promise<File> => {
    const {
      quality = 0.8,
      maxWidth = 1200,
      maxHeight = 800,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('Erreur lors de l\'optimisation'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Erreur de chargement'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const compressImages = useCallback(async (files: File[]): Promise<File[]> => {
    setLoading(true);
    try {
      return await Promise.all(files.map(file => optimizeImage(file)));
    } finally {
      setLoading(false);
    }
  }, [optimizeImage]);

  return { optimizeImage, compressImages, loading };
};