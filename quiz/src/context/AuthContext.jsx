import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          // 🔹 Check admin claim
          const tokenResult = await firebaseUser.getIdTokenResult();
          const isAdminClaim = tokenResult.claims.admin === true;
          setIsAdmin(isAdminClaim);

          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            const data = snap.data();

            if (isAdminClaim) {
              setCredits(3000);
              setIsPremium(true); // treat admins as premium
            } else {
              await handleCreditReset(userRef, data);
            }

            setIsPremium(data.isPremium || false);
          } else {
            // 🔹 First-time user → initialize in Firestore
            const newUser = {
              displayName: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              credits: isAdminClaim ? 3000 : 5,
              lastReset: Date.now(),
              isPremium: false,
              requestedPremium: false,
              createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newUser);
            setCredits(newUser.credits);
            setIsPremium(newUser.isPremium);
          }
        } else {
          // 🔹 No user logged in
          setUser(null);
          setCredits(0);
          setIsPremium(false);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Auth state error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // 🔹 Reset credits daily for non-premium
  const handleCreditReset = async (userRef, data) => {
    const now = Date.now();
    const lastReset = data.lastReset || 0;
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - lastReset >= oneDay && !data.isPremium) {
      await updateDoc(userRef, { credits: 5, lastReset: now });
      setCredits(5);
    } else {
      setCredits(data.credits || 0);
    }
  };

  // 🔹 Google login
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // 🔹 Logout
  const logout = async () => {
    await signOut(auth);
  };

  // 🔹 Deduct 1 credit
  const useCredit = async () => {
    if (!user || isPremium || isAdmin) return true; // premium/admin unlimited
    if (credits <= 0) return false;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { credits: credits - 1 });
    setCredits((c) => c - 1);
    console.log(`💳 Credit deducted. Remaining: ${credits - 1}`);
    return true;
  };

  // 🔹 Refund 1 credit (for failed API calls)
  const refundCredit = async () => {
    if (!user || isPremium || isAdmin) return; // premium/admin don't need refunds
    
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { credits: credits + 1 });
    setCredits((c) => c + 1);
    console.log(`💰 Credit refunded due to API failure. Remaining: ${credits + 1}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        isPremium,
        isAdmin,
        loading,
        loginWithGoogle,
        logout,
        useCredit,
        refundCredit,
        // Expose setters in case components need manual updates
        setCredits,
        setIsPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};