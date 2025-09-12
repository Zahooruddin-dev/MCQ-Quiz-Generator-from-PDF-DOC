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
  const [userDataLoading, setUserDataLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Set user immediately for faster UI response
          setUser(firebaseUser);
          setLoading(false); // Set loading false early so dashboard shows
          setUserDataLoading(true); // But show that user data is still loading

          // Load user data asynchronously without blocking UI
          const loadUserData = async () => {
            try {
              // Parallel execution for better performance
              const [tokenResult, userDoc] = await Promise.all([
                firebaseUser.getIdTokenResult(),
                getDoc(doc(db, "users", firebaseUser.uid))
              ]);

              const isAdminClaim = tokenResult.claims.admin === true;
              setIsAdmin(isAdminClaim);

              if (userDoc.exists()) {
                const data = userDoc.data();
                const userIsPremium = data.isPremium || isAdminClaim;
                
                // Set premium status immediately
                setIsPremium(userIsPremium);

                if (isAdminClaim) {
                  setCredits(3000);
                } else if (userIsPremium) {
                  // For premium users, set unlimited credits (show as high number)
                  setCredits(999);
                } else {
                  // Handle credit reset for non-premium users
                  await handleCreditReset(doc(db, "users", firebaseUser.uid), data);
                }
              } else {
                // First-time user → initialize in Firestore
                const newUser = {
                  displayName: firebaseUser.displayName || "",
                  email: firebaseUser.email || "",
                  credits: isAdminClaim ? 3000 : 5,
                  lastReset: Date.now(),
                  isPremium: false,
                  requestedPremium: false,
                  createdAt: serverTimestamp(),
                };
                await setDoc(doc(db, "users", firebaseUser.uid), newUser);
                setCredits(newUser.credits);
                setIsPremium(isAdminClaim);
              }
            } catch (error) {
              console.error('Error loading user data:', error);
              // Set fallback values so user can still use the app
              setCredits(5);
              setIsPremium(false);
              setIsAdmin(false);
            } finally {
              setUserDataLoading(false);
            }
          };

          // Load user data without blocking
          loadUserData();
        } else {
          // No user logged in
          setUser(null);
          setCredits(0);
          setIsPremium(false);
          setIsAdmin(false);
          setUserDataLoading(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth state error:", err);
        setLoading(false);
        setUserDataLoading(false);
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
        userDataLoading,
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