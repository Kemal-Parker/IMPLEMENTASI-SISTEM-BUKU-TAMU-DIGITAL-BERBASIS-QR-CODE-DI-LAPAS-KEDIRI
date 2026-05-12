import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const AuthContext = createContext<{ 
  isAdmin: boolean; 
  login: (u: string, p: string) => Promise<boolean>; 
  logOut: () => void; 
}>({
  isAdmin: false,
  login: async () => false,
  logOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('lapas_admin') === 'true');

  useEffect(() => {
    // Only local state for admin, since firestore is configured to allow all
  }, [isAdmin]);

  const login = async (u: string, p: string) => {
    if (u === 'lapaskediri' && p === '1234') {
      setIsAdmin(true);
      localStorage.setItem('lapas_admin', 'true');
      return true;
    }
    return false;
  };

  const logOut = () => {
    setIsAdmin(false);
    localStorage.removeItem('lapas_admin');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
