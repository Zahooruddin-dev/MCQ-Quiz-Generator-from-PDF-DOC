// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfFSHZCK1xELA5tRT2ULndpmQsRH1jgSI",
  authDomain: "quiz-gen-9e9f8.firebaseapp.com",
  projectId: "quiz-gen-9e9f8",
  storageBucket: "quiz-gen-9e9f8.appspot.com", 
  messagingSenderId: "909967640983",
  appId: "1:909967640983:web:18041848ae8561ccf49cd2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
