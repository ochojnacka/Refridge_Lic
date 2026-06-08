import { useState } from 'react';
import { apiClient } from '../api/client';

export function useLogin() {
  // Domyślne wartości ułatwiające logowanie dla recenzentów pracy
  const [email, setEmail] = useState('menedzer@bistro.pl');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    if (!email || !password) {
      setError('Email i hasło są wymagane.');
      return false; // Zwracamy false w przypadku niepowodzenia
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(email, password);

      if (response.error) {
        setError(response.error);
        return false;
      }

      return true; // Zwracamy true, jeśli logowanie się powiodło
    } catch (err) {
      setError('Błąd sieci. Proszę spróbować ponownie.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    login,
  };
}