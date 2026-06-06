import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export function useAccount() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = (apiClient as any).token;
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Decode JWT to get user info (payload is the 2nd part)
      const parts = token.split('.');
      if (parts.length === 3) {
        // Dekodowanie Base64Url (standard dla JWT) do zwykłego Base64
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        setUserInfo(decoded);
      } else {
        throw new Error('Invalid token format');
      }
    } catch (err) {
      console.error('Error loading user info:', err);
      setError('Failed to load user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const logout = async () => {
    try {
      await apiClient.clearToken();
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  return {
    userInfo,
    loading,
    error,
    logout,
    retry: loadUserInfo
  };
}