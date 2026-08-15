/**
 * App-wide context — farmer profile, active multi-user session, weather, online status.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { farmApi, weatherApi } from '../api/client';
import { userStore } from '../utils/userStore';

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [profile, setProfile]                 = useState(null);
  const [activeUser, setActiveUser]           = useState(() => userStore.getActiveUser());
  const [weather, setWeather]                 = useState(null);
  const [online, setOnline]                   = useState(true);
  const [loading, setLoading]                 = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('agritech_auth') === 'true');

  // Track connectivity
  useEffect(() => {
    const up   = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online',  up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentActive = userStore.getActiveUser();
    setActiveUser(currentActive);
    try {
      const p = await farmApi.getProfile();
      setProfile(p);
    } catch { /* offline */ }
  }, []);

  const refreshWeather = useCallback(async () => {
    const currentActive = userStore.getActiveUser();
    const city = currentActive?.location ? currentActive.location.split(',')[0].trim() : 'Anand';
    try {
      const w = await weatherApi.get(city);
      setWeather(w);
    } catch { /* offline */ }
  }, []);

  const login = useCallback(async (userObjOrId = null) => {
    if (typeof userObjOrId === 'string') {
      userStore.setActiveUser(userObjOrId);
    } else if (userObjOrId && typeof userObjOrId === 'object') {
      userStore.saveUser(userObjOrId);
    }
    const current = userStore.getActiveUser();
    setActiveUser(current);
    localStorage.setItem('agritech_auth', 'true');
    setIsAuthenticated(true);
    await refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(() => {
    userStore.logout();
    setActiveUser(null);
    setIsAuthenticated(false);
    setProfile(null);
  }, []);

  useEffect(() => {
    Promise.all([refreshProfile(), refreshWeather()])
      .finally(() => setLoading(false));
  }, [refreshProfile, refreshWeather]);

  return (
    <AppCtx.Provider value={{
      profile,
      activeUser,
      weather,
      online,
      loading,
      isAuthenticated,
      login,
      logout,
      refreshProfile,
      refreshWeather
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
