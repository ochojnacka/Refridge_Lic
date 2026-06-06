import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api/client';

export function useMenuSuggestions(limit: number = 5) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>('');

  const fetchSuggestions = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await apiClient.getMenuSuggestions(limit);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setSuggestions(response.data.suggestions || []);
        setDate(response.data.date || new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('Error loading suggestions:', err);
      setError('Failed to load menu suggestions. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [limit]);

  // Automatyczne pobranie danych przy pierwszym załadowaniu
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    loading,
    refreshing,
    error,
    date,
    fetchSuggestions,
  };
}