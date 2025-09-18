// userCreditService.js
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';


/**
 * Service to handle user credit and premium status checks.
 */
export class UserCreditService {
    /**
     * Checks if the current authenticated user has sufficient credits or is a premium user.
     * @returns {Promise<boolean>} Resolves to true if the user has access, otherwise throws an error.
     */
    async checkUserCredits() {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) throw new Error('User profile not found');

            const userData = userSnap.data();
            const isPremium = userData.isPremium || false;
            const credits = userData.credits || 0;
            const tokenResult = await user.getIdTokenResult();
            const isAdmin = tokenResult.claims.admin === true;

            if (isPremium || isAdmin) return true;
            if (credits <= 0) throw new Error('Insufficient credits.');

            return true;
        } catch (err) {
            console.error('❌ Credit check failed', err);
            throw err;
        }
    }
}