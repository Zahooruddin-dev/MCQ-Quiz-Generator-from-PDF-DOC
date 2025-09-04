// src/components/Auth/AuthForm.jsx
import { useState } from "react";
import "./auth.css";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// 🔹 Firebase error mapping
const getFriendlyError = (code) => {
  const errors = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/missing-password": "Please enter your password.",
  };
  return errors[code] || "Something went wrong. Please try again.";
};

const AuthForm = () => {
  const { loginWithGoogle } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Handle signup
  const handleSignup = async () => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with username
    await updateProfile(userCred.user, { displayName: username });

    // Save user record in Firestore
    await setDoc(doc(db, "users", userCred.user.uid), {
      displayName: username,
      email: email,
      credits: 5,
      createdAt: serverTimestamp(),
    });

    setSuccessMsg("Account created successfully!");
  };

  // 🔹 Handle login
  const handleLogin = async () => {
    await signInWithEmailAndPassword(auth, email, password);
    setSuccessMsg("Logged in successfully!");
  };

  // 🔹 Wrapper for form submit
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isSignup) {
        await handleSignup();
      } else {
        await handleLogin();
      }
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Forgot password
  const handleForgotPassword = async () => {
    if (!email) return setError("Please enter your email first.");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Password reset email sent.");
    } catch (err) {
      setError(getFriendlyError(err.code));
    }
  };

  return (
    <div className="auth-card">
      <h2>{isSignup ? "Create Account" : "Login"}</h2>

      {error && <div className="auth-error">{error}</div>}
      {successMsg && <div className="auth-success">{successMsg}</div>}

      <form onSubmit={handleAuth}>
        {isSignup && (
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn auth-btn" disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      {!isSignup && (
        <p className="forgot-link" onClick={handleForgotPassword}>
          Forgot Password?
        </p>
      )}

      <div className="auth-divider">OR</div>

      <button
        type="button"
        className="btn google-btn"
        onClick={loginWithGoogle}
        disabled={loading}
      >
        Continue with Google
      </button>

      <p className="toggle-auth">
        {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
        <span onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Login" : "Sign Up"}
        </span>
      </p>
    </div>
  );
};

export default AuthForm;
