// firebaseService.js - Enhanced version with better API key management
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

// Enhanced API Key Management
let cachedApiKey = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getGlobalApiKey() {
	const now = Date.now();
	
	// Return cached key if still valid
	if (cachedApiKey && (now - lastFetchTime < CACHE_DURATION)) {
		return cachedApiKey;
	}

	try {
		const settingsRef = doc(db, 'settings', 'apiKey');
		const settingsSnap = await getDoc(settingsRef);
		
		if (settingsSnap.exists()) {
			const data = settingsSnap.data();
			cachedApiKey = data.value;
			lastFetchTime = now;
			
			if (!cachedApiKey) {
				console.error('API key exists in Firestore but is empty');
				return null;
			}
			
			console.log('✅ Global API key fetched successfully');
			return cachedApiKey;
		} else {
			console.error('❌ No API key document found in Firestore at settings/apiKey');
			return null;
		}
	} catch (error) {
		console.error('❌ Error fetching global API key:', error);
		return null;
	}
}

// Force refresh the API key (useful when key is updated)
export async function refreshGlobalApiKey() {
	cachedApiKey = null;
	lastFetchTime = 0;
	return await getGlobalApiKey();
}

// Admin function to set/update the global API key
export async function setGlobalApiKey(newApiKey) {
	try {
		const auth = getAuth();
		const user = auth.currentUser;
		
		if (!user) {
			throw new Error('User must be authenticated to set API key');
		}

		// You might want to add admin role checking here
		// const userDoc = await getDoc(doc(db, 'users', user.uid));
		// if (!userDoc.data()?.isAdmin) {
		//   throw new Error('Only admin users can set the global API key');
		// }

		const settingsRef = doc(db, 'settings', 'apiKey');
		await setDoc(settingsRef, {
			value: newApiKey,
			updatedBy: user.uid,
			updatedAt: new Date(),
		});

		// Clear cache to force refresh on next request
		cachedApiKey = null;
		lastFetchTime = 0;

		console.log('✅ Global API key updated successfully');
		return true;
	} catch (error) {
		console.error('❌ Error setting global API key:', error);
		throw error;
	}
}

// Check API key status (for admin/debugging)
export async function checkApiKeyStatus() {
	try {
		const settingsRef = doc(db, 'settings', 'apiKey');
		const settingsSnap = await getDoc(settingsRef);
		
		if (settingsSnap.exists()) {
			const data = settingsSnap.data();
			return {
				exists: true,
				hasKey: !!data.value,
				keyPrefix: data.value?.substring(0, 8) + '...',
				updatedBy: data.updatedBy,
				updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
				isValid: data.value?.length > 10, // Basic validation
			};
		}
		
		return {
			exists: false,
			hasKey: false,
			keyPrefix: null,
			updatedBy: null,
			updatedAt: null,
			isValid: false,
		};
	} catch (error) {
		console.error('Error checking API key status:', error);
		return {
			exists: false,
			hasKey: false,
			error: error.message,
		};
	}
}

// Legacy function for backward compatibility
export async function debugCheckApiKey() {
	const status = await checkApiKeyStatus();
	console.log('API Key Status:', status);
	return status.hasKey ? await getGlobalApiKey() : null;
}