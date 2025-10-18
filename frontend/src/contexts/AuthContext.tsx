import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthState, User } from '../types/auth';
import { authApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAuthState(prev => ({ ...prev, isLoading: false, token: null, user: null }));
      return;
    }

    try {
      const user = await authApi.getCurrentUser();
      setAuthState({
        user,
        token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem('access_token');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        error: 'Authentication failed',
      });
    }
  };

  const login = async (token: string) => {
    try {
      const response = await authApi.googleLogin(token);
      localStorage.setItem('access_token', response.access_token);
      
      const user = await authApi.getCurrentUser();
      setAuthState({
        user,
        token: response.access_token,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.response?.data?.detail || 'Login failed',
        isLoading: false,
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthContext.Provider value={{ ...authState, login, logout, checkAuth }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};