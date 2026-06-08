import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../api/client';

export function useAccount() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null); // NOWY STAN
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserInfoAndEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = (apiClient as any).token;
      
      if (!token) {
        setLoading(false);
        return;
      }

      const parts = token.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        setUserInfo(decoded);

        // Pobieramy równolegle pracowników (dla Menedżera) oraz dane restauracji (dla każdego)
        const promises: Promise<any>[] = [apiClient.getRestaurant()];
        if (decoded.role === 'Menedzer' || decoded.role === 'Administrator') {
          promises.push(apiClient.getEmployees());
        }

        const [restResponse, empResponse] = await Promise.all(promises);

        if (restResponse?.data) {
          setRestaurantInfo(restResponse.data);
        }
        if (empResponse?.data) {
          setEmployees(empResponse.data as any[]);
        }
      } else {
        throw new Error('Nieprawidłowy token JWT');
      }
    } catch (err) {
      console.error('Błąd ładowania danych konta:', err);
      setError('Nie udało się załadować profilu. Proszę spróbować ponownie.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserInfoAndEmployees();
  }, [loadUserInfoAndEmployees]);

  const addEmployee = async (email: string, password: string, name: string, role: string) => {
    setError(null);
    const response = await apiClient.createEmployee(email, password, name, role);
    if (response.error) {
      setError(response.error);
      return false;
    }
    await loadUserInfoAndEmployees();
    return true;
  };

  const updateProfile = async (name: string, email: string) => {
    setError(null);
    const response = await apiClient.updateProfile(name, email);
    if (response.error) {
      setError(response.error);
      return false;
    }
    if (response.data?.token) {
      await apiClient.setToken(response.data.token);
      await loadUserInfoAndEmployees();
    }
    return true;
  };

  const updateRestaurant = async (name: string, city: string, seats: number, avgCoversPerDay: number, description: string) => {
    setError(null);
    const response = await apiClient.updateRestaurant({ name, city, seats, avgCoversPerDay, description });
    if (response.error) {
      setError(response.error);
      return false;
    }
    await loadUserInfoAndEmployees();
    return true;
  };

  const deleteEmployee = async (id: string) => {
    setError(null);
    const response = await apiClient.deleteEmployee(id);
    if (response.error) {
      setError(response.error);
      return false;
    }
    await loadUserInfoAndEmployees();
    return true;
  };

  const logout = async () => {
    try {
      await apiClient.clearToken();
    } catch (err) {
      console.error('Błąd podczas wylogowywania:', err);
      throw err;
    }
  };

  return {
    userInfo,
    restaurantInfo, // Zwracamy zaktualizowany obiekt restauracji
    employees,
    loading,
    error,
    logout,
    addEmployee,
    updateProfile,
    updateRestaurant,
    deleteEmployee,
    retry: loadUserInfoAndEmployees
  };
}