import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  items: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

interface UseInfiniteScrollReturn<T> {
  displayedItems: T[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  reset: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  loadedItems: number;
}

export const useInfiniteScroll = <T>({ 
  items, 
  itemsPerPage = 12,
  initialPage = 1
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const previousItemsRef = useRef(items);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const loadedItems = Math.min(currentPage * itemsPerPage, items.length);
  const displayedItems = items.slice(0, loadedItems);
  const hasMore = loadedItems < items.length;

  // Reset to initial page when items array changes
  useEffect(() => {
    if (previousItemsRef.current !== items) {
      setCurrentPage(initialPage);
      previousItemsRef.current = items;
    }
  }, [items, initialPage]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true);
      
      // Simulate loading delay for smoother UX
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
      }, 300);
    }
  }, [hasMore, isLoading]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setIsLoading(false);
  }, [initialPage]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    reset,
    currentPage,
    totalPages,
    totalItems: items.length,
    loadedItems
  };
};

// Hook for automatic infinite scroll with intersection observer
export const useAutoInfiniteScroll = <T>(
  props: UseInfiniteScrollProps<T>
) => {
  const infiniteScroll = useInfiniteScroll(props);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && infiniteScroll.hasMore && !infiniteScroll.isLoading) {
          infiniteScroll.loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px' // Trigger load 200px before reaching the sentinel
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [infiniteScroll]);

  return {
    ...infiniteScroll,
    sentinelRef
  };
};
