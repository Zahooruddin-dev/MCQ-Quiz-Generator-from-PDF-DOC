// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  // 👀 Watch for login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // 🔹 Load credits from Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setCredits(snap.data().credits);
        } else {
          // First time user → give free credits (e.g. 5)
          await setDoc(userRef, { credits: 5 });
          setCredits(5);
        }
      } else {
        setUser(null);
        setCredits(0);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Google Login
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
  };

  // Deduct credit (when quiz is generated)
  const useCredit = async () => {
    if (!user) return false;
    if (credits <= 0) return false;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { credits: credits - 1 });
    setCredits((c) => c - 1);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, credits, loginWithGoogle, logout, useCredit, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
