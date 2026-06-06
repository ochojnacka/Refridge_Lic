import { useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';
import { apiClient, API_BASE_URL } from '../api/client';

export function useInventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Zwróć uwagę na poprawne wywołanie przez apiClient, a nie API_BASE_URL
      const response = await apiClient.getInventoryItems();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setItems(response.data);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const addItem = async (name: string, quantity: number, unit: string, costPrice: number, category: string) => {
    setError(null);
    try {
      const response = await apiClient.addInventoryItem(name, quantity, unit, costPrice, category.toUpperCase());
      if (response.error) {
        setError(response.error);
        return false;
      }
      await fetchInventory(); // Automatyczne odświeżenie po dodaniu
      return true;
    } catch (err) {
      setError('Failed to add item. Check your connection.');
      return false;
    }
  };

  const deleteItem = async (itemId: string) => {
    setError(null);
    try {
      const response = await apiClient.deleteInventoryItem(itemId);
      if (response.error) {
        setError(response.error);
        return false;
      }
      await fetchInventory(); // Automatyczne odświeżenie po usunięciu
      return true;
    } catch (err) {
      setError('Failed to delete item. Check your connection.');
      return false;
    }
  };

  // Obsługa WebSockets zintegrowana wewnątrz hooka!
  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on('waste:logged', () => {
      fetchInventory();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchInventory]);

  return {
    items,
    loading,
    refreshing,
    error,
    fetchInventory,
    addItem,
    deleteItem,
    setError // Udostępniamy do ew. czyszczenia błędu w UI
  };
}