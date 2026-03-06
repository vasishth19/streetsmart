// ─── hooks/useAuth.ts ─────────────────────────────────────────────
// JWT authentication hook

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export interface User {
  id:    number;
  name:  string;
  email: string;
}

interface AuthState {
  user:    User | null;
  token:   string | null;
  loading: boolean;
}

interface AuthActions {
  login:   (email: string, password: string) => Promise<void>;
  signup:  (name: string, email: string, password: string) => Promise<void>;
  logout:  () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token helpers (memory-only, no localStorage)
let _token: string | null = null;
let _user:  User  | null  = null;

export function getToken() { return _token; }
export function getUser()  { return _user;  }

export function useAuth(): AuthState & AuthActions {
  const [user,    setUser]    = useState<User | null>(_user);
  const [token,   setToken]   = useState<string | null>(_token);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({ username: email, password }),
      });

      if (!res.ok) {
        // Demo mode: accept demo@streetsmart.city / demo123
        if (email === 'demo@streetsmart.city' && password === 'demo123') {
          const demoUser = { id: 1, name: 'Demo User', email };
          _token = 'demo-token-xxx';
          _user  = demoUser;
          setToken(_token);
          setUser(demoUser);
          return;
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Invalid credentials');
      }

      const data = await res.json();
      _token = data.access_token;

      // Fetch user profile
      const profileRes = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${_token}` },
      });
      const profile: User = await profileRes.json();
      _user = profile;
      setToken(_token);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Signup failed');
      }

      // Auto-login after signup
      await login(email, password);
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    _token = null;
    _user  = null;
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, loading, login, signup, logout };
}
