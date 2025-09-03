// src/components/UserInfo/UserInfo.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import './UserInfo.css';
import { useNavigate } from 'react-router-dom';

const UserInfo = ({ user, onClose, isAdmin }) => {
	const { credits, isPremium } = useAuth();
	const [requestSent, setRequestSent] = useState(false);
	const navigate = useNavigate(); // ⬅️ hook for navigation

	if (!user) return null;

	const lastLogin = user.metadata?.lastSignInTime
		? new Date(user.metadata.lastSignInTime).toLocaleString()
		: 'Unknown';

	const handleRequestPremium = async () => {
		try {
			const requestRef = doc(db, 'premiumRequests', user.uid); // one doc per user
			const existing = await getDoc(requestRef);

			if (existing.exists()) {
				alert('You already have a pending request.');
				setRequestSent(true);
				return;
			}

			await setDoc(requestRef, {
				uid: user.uid,
				email: user.email,
				name: user.displayName || 'N/A',
				createdAt: serverTimestamp(),
				status: 'pending',
			});

			setRequestSent(true);
		} catch (err) {
			console.error('Error requesting premium:', err);
			alert('Failed to send request. Try again later.');
		}
	};

	return (
		<AnimatePresence>
			<motion.div
				className='user-info-overlay'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					className='user-info-card'
					initial={{ y: '-20%', opacity: 0 }}
					animate={{ y: '0%', opacity: 1 }}
					exit={{ y: '-20%', opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h3>User Info</h3>
					<p>
						<strong>Name:</strong> {user.displayName || 'N/A'}
					</p>
					<p>
						<strong>Email:</strong> {user.email}
					</p>
					<p>
						<strong>Status:</strong>{' '}
						{isPremium ? '🌟 Premium User' : 'Free User'}
					</p>
					<p>
						<strong>Credits:</strong> {isPremium ? '∞' : credits}
					</p>
					<p>
						<strong>Last Login:</strong> {lastLogin}
					</p>

					{/* 🔹 Request Premium button */}
					{!isPremium && !requestSent && (
						<button className='btn small-btn' onClick={handleRequestPremium}>
							Request Premium Upgrade
						</button>
					)}

					{/* 🔹 Confirmation */}
					{!isPremium && requestSent && (
						<p className='success-msg'>
							✅ Request sent! Waiting for admin approval.
						</p>
					)}

					{/* 🔹 Admin-only button */}
					{isAdmin && (
						<button
							className='btn small-btn admin-btn'
							onClick={() => navigate('/admin')}
						>
							Go to Admin Dashboard
						</button>
					)}

					<button className='btn small-btn' onClick={onClose}>
						Close
					</button>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default UserInfo;
