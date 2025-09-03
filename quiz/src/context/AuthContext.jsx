// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // ✅ new

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Get admin claim from Firebase token
        const tokenResult = await firebaseUser.getIdTokenResult();
        setIsAdmin(tokenResult.claims.admin === true); // ✅ detect admin

        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();

          // Reset credits daily for non-premium
          const now = Date.now();
          const lastReset = data.lastReset || 0;
          const oneDay = 24 * 60 * 60 * 1000;

          if (!tokenResult.claims.admin) { // admins don’t reset credits
            if (now - lastReset >= oneDay && !data.isPremium) {
              await updateDoc(userRef, { credits: 5, lastReset: now });
              setCredits(5);
            } else {
              setCredits(data.credits || 0);
            }
          } else {
            // Admins always have 3000 credits
            setCredits(3000);
          }

          setIsPremium(data.isPremium || false);
        } else {
          // First-time user → initialize
          const newUser = {
            credits: tokenResult.claims.admin ? 3000 : 5,
            lastReset: Date.now(),
            isPremium: false,
            requestedPremium: false,
          };
          await setDoc(userRef, newUser);
          setCredits(newUser.credits);
          setIsPremium(newUser.isPremium);
        }
      } else {
        setUser(null);
        setCredits(0);
        setIsPremium(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login with Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
  };

  // Deduct 1 credit
  const useCredit = async () => {
    if (!user || isPremium || isAdmin) return true; // premium/admin unlimited
    if (credits <= 0) return false;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { credits: credits - 1 });
    setCredits((c) => c - 1);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        isPremium,
        isAdmin, // ✅ expose admin status
        loginWithGoogle,
        logout,
        useCredit,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
