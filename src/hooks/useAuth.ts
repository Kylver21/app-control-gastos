import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!activo) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion);
      setCargando(false);
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    setError('');
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message);
      return false;
    }
    return true;
  }

  async function registro(email: string, password: string) {
    setError('');
    const { error: registroError } = await supabase.auth.signUp({ email, password });
    if (registroError) {
      setError(registroError.message);
      return false;
    }
    return true;
  }

  async function logout() {
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) setError(logoutError.message);
  }

  return { session, cargando, error, login, registro, logout };
}
