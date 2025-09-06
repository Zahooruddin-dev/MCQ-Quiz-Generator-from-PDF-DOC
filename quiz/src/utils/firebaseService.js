// firebaseService.js
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  getCountFromServer,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();

export async function saveQuizResults(quizData) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const quizRef = doc(collection(db, "quizzes"));
  await setDoc(quizRef, {
    ...quizData,
    userId: user.uid,
    completedAt: new Date(),
  });
}

// (add updateUserStats, getDashboardData, saveChatMessage... same as before but isolated here)
