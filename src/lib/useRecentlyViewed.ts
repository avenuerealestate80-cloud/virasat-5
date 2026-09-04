import { useState, useEffect, useCallback } from 'react';
import { supabase, type Property } from './supabase';

const STORAGE_KEY = 'virasat_recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setRecentIds(ids);
      }
    } catch {
      // ignore
    }
  }, []);

  const trackView = useCallback((propertyId: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== propertyId);
      const next = [propertyId, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    async function loadProperties() {
      if (recentIds.length === 0) {
        setProperties([]);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('properties')
        .select('*')
        .in('id', recentIds);
      if (data) {
        const sorted = recentIds
          .map((id) => (data as Property[]).find((p) => p.id === id))
          .filter((p): p is Property => p !== undefined);
        setProperties(sorted);
      }
      setLoading(false);
    }
    loadProperties();
  }, [recentIds]);

  return { recentProperties: properties, trackView, clearRecent, loading };
}
