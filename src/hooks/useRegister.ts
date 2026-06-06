import { useState } from 'react';
import { apiClient } from '../api/client';

export function useRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async () => {
    if (!email || !password || !name || !restaurantName) {
      setError('All business details are required.');
      return false;
    }

    if (password.length < 6) {
      setError('Secure password must be at least 6 characters.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.register(email, password, name, restaurantName);

      if (response.error) {
        setError(response.error);
        return false;
      }
      return true;
    } catch (err) {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    name, setName,
    restaurantName, setRestaurantName,
    loading,
    error,
    register
  };
}