export const getFriendlyError = (code) => {
  const errors = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/missing-password": "Please enter your password.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
  };
  return errors[code] || "Something went wrong. Please try again.";
};
