import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  fetchData: (page: number) => Promise<T[]>;
  pageSize?: number;
}

export const useInfiniteScroll = <T>({ fetchData, pageSize = 10 }: UseInfiniteScrollProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newItems = await fetchData(page);
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, loading, hasMore, pageSize]);

  useEffect(() => {
    loadMore();
  }, []); // Load initial data

  const refresh = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
  }, []);

  return { items, loading, hasMore, loadMore, refresh };
};
