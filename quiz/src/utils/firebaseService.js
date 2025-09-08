// firebaseService.js
import {
	getFirestore,
	doc,
	setDoc,
	getDoc,
	updateDoc,
	increment,
	collection,
	addDoc,
	query,
	orderBy,
	limit,
	getDocs,
	deleteDoc,
	getCountFromServer,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

export async function saveQuizResults(quizData) {
	try {
		const auth = getAuth();
		const user = auth.currentUser;

		if (!user) {
			console.error('No user authenticated');
			return;
		}

		// Add metadata to quiz data
		const quizWithMetadata = {
			...quizData,
			userId: user.uid,
			completedAt: new Date(),
		};

		// Add to quizzes collection
		const quizRef = doc(collection(db, 'quizzes'));
		await setDoc(quizRef, quizWithMetadata);

		// Update user stats
		await updateUserStats(user.uid, quizData);

		console.log('Quiz results saved successfully');
	} catch (error) {
		console.error('Error saving quiz results:', error);
	}
}

export async function updateUserStats(userId, quizData) {
	try {
		const userRef = doc(db, 'users', userId);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			// Create new user stats document
			await setDoc(userRef, {
				quizzesTaken: 1,
				totalScore: quizData.score,
				totalTime: quizData.timeTaken,
				avgScore: quizData.score,
				streak: quizData.score >= 70 ? 1 : 0,
				bestScore: quizData.score,
				lastActive: new Date(),
				topicsStudied: quizData.topic ? [quizData.topic] : [],
				completionRate: 100, // Since they completed 1 out of 1 quiz
			});
		} else {
			// Update existing user stats
			const currentData = userSnap.data();
			const newQuizzesTaken = (currentData.quizzesTaken || 0) + 1;
			const newTotalScore = (currentData.totalScore || 0) + quizData.score;
			const newTotalTime = (currentData.totalTime || 0) + quizData.timeTaken;
			const newAvgScore = newTotalScore / newQuizzesTaken;

			// Update streak
			let newStreak = currentData.streak || 0;
			if (quizData.score >= 70) {
				newStreak += 1;
			} else {
				newStreak = 0;
			}

			// Update best score
			const newBestScore = Math.max(
				currentData.bestScore || 0,
				quizData.score
			);

			// Update topics studied
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
				completionRate: 100, // Simplified for now
			});
		}
	} catch (error) {
		console.error('Error updating user stats:', error);
	}
}

export async function getDashboardData() {
	try {
		const auth = getAuth();
		const user = auth.currentUser;
		if (!user) throw new Error('No authenticated user');
		const userRef = doc(db, 'users', user.uid);
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) {
			return {
				quizzesTaken: 0,
				avgScore: 0,
				totalTime: 0,
				streak: 0,
				recentQuizzes: [],
			};
		}
		return userSnap.data();
	} catch (error) {
		console.error('❌ Failed to fetch dashboard data:', error);
		return null;
	}
}

export async function saveChatMessage(message, isUserMessage = true) {
	try {
		const auth = getAuth();
		const user = auth.currentUser;

		if (!user) {
			console.error('No user authenticated');
			return;
		}

		// Get user's chat collection reference
		const userChatsRef = collection(db, 'users', user.uid, 'chats');

		// Add the new message
		await addDoc(userChatsRef, {
			message: message,
			isUserMessage: isUserMessage,
			timestamp: new Date(),
		});

		// Get total chat count
		const chatCount = await getChatCount(user.uid);

		// If more than 100 messages, delete the oldest ones
		if (chatCount > 100) {
			await trimChatHistory(user.uid, chatCount - 100);
		}

		console.log('Chat message saved successfully');
	} catch (error) {
		console.error('Error saving chat message:', error);
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

		const deletePromises = [];
		snapshot.forEach((doc) => {
			deletePromises.push(deleteDoc(doc.ref));
		});

		await Promise.all(deletePromises);
		console.log(`Trimmed ${countToDelete} old chat messages`);
	} catch (error) {
		console.error('Error trimming chat history:', error);
	}
}