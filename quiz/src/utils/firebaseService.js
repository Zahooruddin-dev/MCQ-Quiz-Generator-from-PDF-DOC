// firebaseService.js - Full enhanced version
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  writeBatch,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';

// --- Cache Utility ---
const cache = {
  data: new Map(),
  set(key, value) {
    this.data.set(key, { value, timestamp: Date.now() });
  },
  get(key, maxAge = 300000) {
    const item = this.data.get(key);
    if (item && Date.now() - item.timestamp < maxAge) return item.value;
    this.data.delete(key);
    return null;
  },
  clear() {
    this.data.clear();
  },
};

// --- Quiz & User Stats ---
export async function saveQuizResults(quizData) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const batch = writeBatch(db);

    const quizRef = doc(collection(db, 'quizzes'));
    batch.set(quizRef, { ...quizData, userId: user.uid, completedAt: new Date() });

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      batch.set(userRef, {
        quizzesTaken: 1,
        totalScore: quizData.score,
        totalTime: quizData.timeTaken,
        avgScore: quizData.score,
        streak: quizData.score >= 70 ? 1 : 0,
        bestScore: quizData.score,
        lastActive: new Date(),
        topicsStudied: quizData.topic ? [quizData.topic] : [],
        completionRate: 100,
      });
    } else {
      const data = userSnap.data();
      const quizzesTaken = (data.quizzesTaken || 0) + 1;
      const totalScore = (data.totalScore || 0) + quizData.score;
      const totalTime = (data.totalTime || 0) + quizData.timeTaken;
      const avgScore = totalScore / quizzesTaken;
      const streak = quizData.score >= 70 ? ((data.streak || 0) + 1) : 0;
      const bestScore = Math.max(data.bestScore || 0, quizData.score);
      const topics = new Set(data.topicsStudied || []);
      if (quizData.topic) topics.add(quizData.topic);

      batch.update(userRef, {
        quizzesTaken,
        totalScore,
        totalTime,
        avgScore,
        streak,
        bestScore,
        lastActive: new Date(),
        topicsStudied: Array.from(topics),
        completionRate: 100,
      });
    }

    await batch.commit();
    cache.clear();
    console.log('✅ Quiz results saved');
  } catch (err) {
    console.error('❌ saveQuizResults error:', err);
  }
}

export async function getDashboardData() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const cacheKey = `dashboard-${user.uid}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const userSnap = await getDoc(doc(db, 'users', user.uid));
    const result = userSnap.exists() ? userSnap.data() : {
      quizzesTaken: 0,
      avgScore: 0,
      totalTime: 0,
      streak: 0,
      recentQuizzes: [],
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('❌ getDashboardData error:', err);
    return null;
  }
}

// --- Chat Messages ---
export async function saveChatMessage(message, isUserMessage = true) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const chatRef = collection(db, 'users', user.uid, 'chats');
    await addDoc(chatRef, { message, isUserMessage, timestamp: new Date() });

    setTimeout(() => cleanupOldMessages(user.uid), 1000);
  } catch (err) {
    console.error('❌ saveChatMessage error:', err);
  }
}

async function cleanupOldMessages(userId) {
  try {
    const count = await getChatCount(userId);
    if (count > 100) await trimChatHistory(userId, count - 100);
  } catch (err) {
    console.error('❌ cleanupOldMessages error:', err);
  }
}

async function getChatCount(userId) {
  try {
    const ref = collection(db, 'users', userId, 'chats');
    const snap = await getCountFromServer(ref);
    return snap.data().count;
  } catch {
    return 0;
  }
}

async function trimChatHistory(userId, countToDelete) {
  try {
    const ref = collection(db, 'users', userId, 'chats');
    const q = query(ref, orderBy('timestamp', 'asc'), limit(countToDelete));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    let ops = 0;
    snap.forEach(d => { if (ops++ < 500) batch.delete(d.ref); });
    if (ops > 0) await batch.commit();
  } catch (err) {
    console.error('❌ trimChatHistory error:', err);
  }
}

// --- API Key & Base URL Management ---
let cachedApiConfig = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function getApiConfig() {
  const now = Date.now();
  if (cachedApiConfig && now - lastFetchTime < CACHE_DURATION) return cachedApiConfig;

  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'apiConfig'));
    if (settingsSnap.exists()) {
      cachedApiConfig = settingsSnap.data();
      lastFetchTime = now;
      return cachedApiConfig;
    }
    return { apiKey: null, baseUrl: null };
  } catch (err) {
    console.error('❌ getApiConfig error:', err);
    return { apiKey: null, baseUrl: null };
  }
}

export async function refreshApiConfig() {
  cachedApiConfig = null;
  lastFetchTime = 0;
  return getApiConfig();
}

export async function setApiConfig({ apiKey, baseUrl }) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    await setDoc(doc(db, 'settings', 'apiConfig'), {
      apiKey,
      baseUrl,
      updatedBy: user.uid,
      updatedAt: new Date(),
    });
    cachedApiConfig = null;
    return true;
  } catch (err) {
    console.error('❌ setApiConfig error:', err);
    throw err;
  }
}
