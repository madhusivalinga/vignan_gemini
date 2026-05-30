"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Clear previous profile listener
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        // Use onSnapshot for real-time profile updates
        unsubscribeProfile = doc(db, "users", currentUser.uid)
          ? (function() {
              const profileRef = doc(db, "users", currentUser.uid);
              return onSnapshot(profileRef, (snapshot) => {
                if (snapshot.exists()) {
                  setUserProfile(snapshot.data());
                } else {
                  console.warn("User profile not found in Firestore.");
                  setUserProfile(null);
                }
                setLoading(false);
              }, (error) => {
                 console.error("Profile sync error:", error);
                 setLoading(false);
              });
            })()
          : null;
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
        {children}
    </AuthContext.Provider>
  );
};
