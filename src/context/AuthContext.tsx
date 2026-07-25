import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthUser, EntrepreneurProfileData, StudentProfileData } from '../types';

type Profile = StudentProfileData | EntrepreneurProfileData | null;

interface RegisterStudentInput {
  role: 'STUDENT';
  email: string;
  password: string;
  fullName: string;
  university?: string;
  career?: string;
  semester?: string;
}

interface RegisterEntrepreneurInput {
  role: 'ENTREPRENEUR';
  email: string;
  password: string;
  businessName: string;
  category?: string;
  description?: string;
}

export type RegisterInput = RegisterStudentInput | RegisterEntrepreneurInput;

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function parseJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (!response.ok) {
        setUser(null);
        setProfile(null);
        return;
      }
      const data = await response.json();
      setUser(data.user);
      setProfile(data.profile ?? null);
    } catch {
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok) {
      const message = data.error || 'No se pudo iniciar sesión.';
      setError(message);
      throw new Error(message);
    }
    await refresh();
  }, [refresh]);

  const register = useCallback(async (input: RegisterInput) => {
    setError(null);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok) {
      const message = data.error || 'No se pudo crear la cuenta.';
      setError(message);
      throw new Error(message);
    }
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (data: Record<string, unknown>) => {
    setError(null);
    const response = await fetch('/api/profile/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await parseJsonSafely(response);
    if (!response.ok) {
      const message = json.error || 'No se pudo actualizar el perfil.';
      setError(message);
      throw new Error(message);
    }
    setProfile(json.profile ?? null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, login, register, logout, refresh, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
