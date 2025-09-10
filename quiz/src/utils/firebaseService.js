// firebaseService.js - Safe optimized version
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
	deleteDoc,
	getCountFromServer,
	writeBatch,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';

// Simple in-memory cache for dashboard data
const cache = {
	data: new Map(),
	set(key, value) {
		this.data.set(key, {
			value,
			timestamp: Date.now()
		});
	},
	get(key, maxAge = 300000) { // 5 minutes default
		const item = this.data.get(key);
		if (item && Date.now() - item.timestamp < maxAge) {
			return item.value;
		}
		this.data.delete(key);
		return null;
	},
	clear() {
		this.data.clear();
	}
};

// Batch operations for better performance
export async function saveQuizResults(quizData) {
	try {
		const auth = getAuth();
		const user = auth.currentUser;

		if (!user) {
			console.error('No user authenticated');
			return;
		}

		// Use batch for atomic operations
		const batch = writeBatch(db);

		// Add quiz data with metadata
		const quizWithMetadata = {
			...quizData,
			userId: user.uid,
			completedAt: new Date(),
		};

		const quizRef = doc(collection(db, 'quizzes'));
		batch.set(quizRef, quizWithMetadata);

		// Get current user stats for batch update
		const userRef = doc(db, 'users', user.uid);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			// Create new user stats document
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
			// Update existing user stats
			const currentData = userSnap.data();
			const newQuizzesTaken = (currentData.quizzesTaken || 0) + 1;
			const newTotalScore = (currentData.totalScore || 0) + quizData.score;
			const newTotalTime = (currentData.totalTime || 0) + quizData.timeTaken;
			const newAvgScore = newTotalScore / newQuizzesTaken;

			let newStreak = currentData.streak || 0;
			if (quizData.score >= 70) {
				newStreak += 1;
			} else {
				newStreak = 0;
			}

			const newBestScore = Math.max(currentData.bestScore || 0, quizData.score);
			const topicsStudied = new Set(currentData.topicsStudied || []);
			if (quizData.topic) {
				topicsStudied.add(quizData.topic);
			}

			batch.update(userRef, {
				quizzesTaken: newQuizzesTaken,
				totalScore: newTotalScore,
				totalTime: newTotalTime,
				avgScore: newAvgScore,
				streak: newStreak,
				bestScore: newBestScore,
				lastActive: new Date(),
				topicsStudied: Array.from(topicsStudied),
				completionRate: 100,
			});
		}

		// Commit all operations atomically
		await batch.commit();

		// Clear cache since data changed
		cache.clear();

		console.log('Quiz results saved successfully with batch operation');
	} catch (error) {
		console.error('Error saving quiz results:', error);
	}
}

// Keep original function for compatibility but make it use the optimized saveQuizResults
export async function updateUserStats(userId, quizData) {
	try {
		const userRef = doc(db, 'users', userId);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			await setDoc(userRef, {
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
			const currentData = userSnap.data();
			const newQuizzesTaken = (currentData.quizzesTaken || 0) + 1;
			const newTotalScore = (currentData.totalScore || 0) + quizData.score;
			const newTotalTime = (currentData.totalTime || 0) + quizData.timeTaken;
			const newAvgScore = newTotalScore / newQuizzesTaken;

			let newStreak = currentData.streak || 0;
			if (quizData.score >= 70) {
				newStreak += 1;
			} else {
				newStreak = 0;
			}

			const newBestScore = Math.max(currentData.bestScore || 0, quizData.score);
			const topicsStudied = new Set(currentData.topicsStudied || []);
			if (quizData.topic) {
				topicsStudied.add(quizData.topic);
			}

			await updateDoc(userRef, {
				quizzesTaken: newQuizzesTaken,
				totalScore: newTotalScore,
				totalTime: newTotalTime,
				avgScore: newAvgScore,
				streak: newStreak,
				bestScore: newBestScore,
				lastActive: new Date(),
				topicsStudied: Array.from(topicsStudied),
				completionRate: 100,
			});
		}

		// Clear cache since data changed
		cache.clear();
	} catch (error) {
		console.error('Error updating user stats:', error);
	}
}

// Cached dashboard data
export async function getDashboardData() {
	try {
		const auth = getAuth();
		const user = auth.currentUser;
		if (!user) throw new Error('No authenticated user');

		// Check cache first
		const cacheKey = `dashboard-${user.uid}`;
		const cached = cache.get(cacheKey);
		if (cached) {
			console.log('✅ Dashboard data from cache');
			return cached;
		}

		const userRef = doc(db, 'users', user.uid);
		const userSnap = await getDoc(userRef);
		
		const result = userSnap.exists() ? userSnap.data() : {
			quizzesTaken: 0,
			avgScore: 0,
			totalTime: 0,
			streak: 0,
			recentQuizzes: [],
		};

		// Cache the result
		cache.set(cacheKey, result);
		console.log('✅ Dashboard data from Firestore (cached)');
		
		return result;
	} catch (error) {
		console.error('❌ Failed to fetch dashboard data:', error);
		return null;
	}
}

// Optimized chat message saving
export async function saveChatMessage(message, isUserMessage = true) {
	try {
		const auth = getAuth();
		const user = auth.currentUser;

		if (!user) {
			console.error('No user authenticated');
			return;
		}

		const userChatsRef = collection(db, 'users', user.uid, 'chats');

		// Add the new message
		await addDoc(userChatsRef, {
			message: message,
			isUserMessage: isUserMessage,
			timestamp: new Date(),
		});

		// Async cleanup (don't block the main operation)
		setTimeout(() => {
			cleanupOldMessages(user.uid);
		}, 1000);

		console.log('Chat message saved successfully');
	} catch (error) {
		console.error('Error saving chat message:', error);
	}
}

// Async cleanup function
async function cleanupOldMessages(userId) {
	try {
		const chatCount = await getChatCount(userId);
		if (chatCount > 100) {
			await trimChatHistory(userId, chatCount - 100);
		}
	} catch (error) {
		console.error('Error in chat cleanup:', error);
	}
}

async function getChatCount(userId) {
	try {
		const userChatsRef = collection(db, 'users', userId, 'chats');
		const snapshot = await getCountFromServer(userChatsRef);
		return snapshot.data().count;
	} catch (error) {
		console.error('Error getting chat count:', error);
		return 0;
	}
}

async function trimChatHistory(userId, countToDelete) {
	try {
		const userChatsRef = collection(db, 'users', userId, 'chats');
		const q = query(
			userChatsRef,
			orderBy('timestamp', 'asc'),
			limit(countToDelete)
		);
		const snapshot = await getDocs(q);

		// Use batch for efficient deletes
		const batch = writeBatch(db);
		let operationCount = 0;
		
		snapshot.forEach((docSnapshot) => {
			if (operationCount < 500) { // Firestore batch limit
				batch.delete(docSnapshot.ref);
				operationCount++;
			}
		});

		if (operationCount > 0) {
			await batch.commit();
			console.log(`Trimmed ${operationCount} old chat messages`);
		}
	} catch (error) {
		console.error('Error trimming chat history:', error);
	}
}

let cachedApiKey = null;

export async function getGlobalApiKey() {
  if (cachedApiKey) return cachedApiKey;

  try {
    const settingsRef = doc(db, 'settings', 'apiKey');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      // Get the key from the 'value' field
      cachedApiKey = settingsSnap.data().value;
      return cachedApiKey;
    }
    return null;
  } catch (error) {
    console.error('Error fetching global API key:', error);
    return null;
  }
}

export async function debugCheckApiKey() {
  try {
    const settingsRef = doc(db, 'settings', 'apiKey');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      console.log('API Key found:', {
        exists: true,
        hasKey: !!data.value,
        keyPrefix: data.value?.substring(0, 4)
      });
      return data.value;  // Use 'value' field
    }
    return null;
  } catch (error) {
    console.error('Error checking API key:', error);
    return null;
  }
}