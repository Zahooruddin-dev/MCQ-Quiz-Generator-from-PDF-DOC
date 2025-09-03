// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfFSHZCK1xELA5tRT2ULndpmQsRH1jgSI",
  authDomain: "quiz-gen-9e9f8.firebaseapp.com",
  projectId: "quiz-gen-9e9f8",
  storageBucket: "quiz-gen-9e9f8.appspot.com",
  messagingSenderId: "909967640983",
  appId: "1:909967640983:web:18041848ae8561ccf49cd2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Firestore (with long polling to fix 400 Listen errors)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
