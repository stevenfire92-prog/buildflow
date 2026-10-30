import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getAccessToken } from '@/api/base44Client';
import { base44 } from '@/api/base44Client';
import { readSession, publicSettingsError, loginPath } from './auth-session';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const state = await readSession(base44, getAccessToken());
      setUser(state.user);
      setAuthError(state.error);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const checkAppState = useCallback(async () => {
    setIsLoadingPublicSettings(true);
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const settings = await base44.app.getPublicSettings();
      setAppPublicSettings(settings);
      await checkUserAuth();
    } catch (error) {
      setUser(null);
      setAppPublicSettings(null);
      setAuthError(publicSettingsError(error));
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [checkUserAuth]);

  useEffect(() => { checkAppState(); }, [checkAppState]);

  const logout = () => {
    setUser(null);
    setAuthError(null);
    base44.auth.logout(window.location.origin + '/');
  };

  const navigateToLogin = () => { window.location.assign(loginPath(window.location)); };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoadingAuth,
      isLoadingPublicSettings, authError, appPublicSettings, authChecked, logout,
      navigateToLogin, checkUserAuth, checkAppState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
