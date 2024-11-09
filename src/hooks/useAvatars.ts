import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAvatars, setLoading, setError } from '@/store/slices/avatarSlice';
import { useToast } from '@/hooks/useToast';

export function useAvatars() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { avatars, isLoading, error } = useAppSelector((state) => state.avatar);
  
  // Use refs to track request state
  const lastETagRef = useRef<string | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAvatars = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    const FETCH_COOLDOWN = 5000; // 5 seconds cooldown
    
    // Return if already loading
    if (isLoading) return;
    
    // Return if cache is still valid and not forcing refresh
    if (!force && 
        avatars.length > 0 && 
        now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
      return;
    }

    try {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      dispatch(setLoading(true));

      const headers: HeadersInit = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };

      // Add If-None-Match header if we have an ETag
      if (lastETagRef.current && !force) {
        headers['If-None-Match'] = lastETagRef.current;
      }

      const response = await fetch('/api/avatars', {
        headers,
        signal: abortControllerRef.current.signal
      });

      // If we get a 304 Not Modified, use cached data
      if (response.status === 304) {
        dispatch(setLoading(false));
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch avatars');
      }

      // Store the new ETag
      const newETag = response.headers.get('ETag');
      if (newETag) {
        lastETagRef.current = newETag;
      }
      
      const data = await response.json();
      dispatch(setAvatars(data));
      lastFetchTimeRef.current = now;
    } catch (error) {
      // Only dispatch error if it's not an abort error
      if (error instanceof Error && error.name !== 'AbortError') {
        dispatch(setError(error.message));
        showToast('Failed to load avatars', 'error');
      }
    } finally {
      dispatch(setLoading(false));
      abortControllerRef.current = null;
    }
  }, [dispatch, isLoading, avatars.length, showToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      lastETagRef.current = null;
      lastFetchTimeRef.current = 0;
    };
  }, []);

  return {
    avatars,
    isLoading,
    error,
    fetchAvatars
  };
}
