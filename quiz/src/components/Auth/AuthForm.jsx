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
import { doc, setDoc } from "firebase/firestore";

const AuthForm = () => {
  const { loginWithGoogle } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isSignup) {
        // 🔹 Signup
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: username });
        await setDoc(doc(db, "users", userCred.user.uid), { credits: 5 });
        setSuccessMsg("Account created successfully!");
      } else {
        // 🔹 Login
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMsg("Logged in successfully!");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Password reset email sent.");
    } catch (err) {
      setError(err.message);
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

      <button className="btn google-btn" onClick={loginWithGoogle}>
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
