// src/hooks/useToast.js
import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const toast = useCallback((msg, type = 'success') => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, msg, type }].slice(-4));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  return { toasts, toast };
}
