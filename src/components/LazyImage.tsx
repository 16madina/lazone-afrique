import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Generate a tiny blurred placeholder
const createBlurPlaceholder = (width: number = 40, height: number = 30) => {
  return `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3e%3cfilter id='b' color-interpolation-filters='sRGB'%3e%3cfeGaussianBlur stdDeviation='20'/%3e%3c/filter%3e%3crect width='${width}' height='${height}' fill='%23e5e7eb' filter='url(%23b)'/%3e%3c/svg%3e`;
};

export const LazyImage = ({ 
  src, 
  alt, 
  className, 
  placeholder = createBlurPlaceholder(),
  onLoad,
  onError 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.01,
        rootMargin: '100px' // Load images 100px before they enter viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && src !== currentSrc) {
      // Preload the actual image
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      
      img.onerror = () => {
        setHasError(true);
        onError?.();
      };
    }
  }, [isInView, src, currentSrc, onLoad, onError]);

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-muted", className)}>
      {/* Blur-up placeholder effect */}
      <img
        src={hasError ? placeholder : currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-500 ease-out",
          !isLoaded && isInView ? "blur-sm scale-110" : "blur-0 scale-100",
          isLoaded ? "opacity-100" : "opacity-90"
        )}
        loading="lazy"
      />
      
      {/* Loading shimmer overlay */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
      )}
    </div>
  );
};