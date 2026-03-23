// src/hooks/useLogin.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function useLogin() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError('No se pudo iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleLogin };
}
