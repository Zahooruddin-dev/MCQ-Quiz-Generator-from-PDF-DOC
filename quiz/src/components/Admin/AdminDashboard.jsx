// src/components/Admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { db, auth } from '../../firebaseConfig';
import {
	collection,
	query,
	orderBy,
	getDocs,
	updateDoc,
	doc,
} from 'firebase/firestore';
import './AdminDashboard.css';

const AdminDashboard = () => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);

	// Fetch all premium requests (force token refresh to ensure admin claims are applied)
	const fetchRequests = async () => {
		setLoading(true);
		try {
			// Force ID token refresh so Firestore sees updated admin claim
			if (auth.currentUser) {
				await auth.currentUser.getIdToken(true);
			}

			const q = query(
				collection(db, 'premiumRequests'),
				orderBy('createdAt', 'desc')
			);
			const snap = await getDocs(q);

			const list = snap.docs.map((docSnap) => ({
				id: docSnap.id,
				...docSnap.data(),
			}));

			setRequests(list);
		} catch (err) {
			console.error('Error fetching requests:', err);
			alert(
				'⚠️ Failed to fetch requests. Make sure you are logged in as admin.'
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRequests();
	}, []);

	// Approve request
	const approveRequest = async (id, uid) => {
		try {
			await updateDoc(doc(db, 'premiumRequests', id), {
				status: 'approved',
			});

			await updateDoc(doc(db, 'users', uid), {
				isPremium: true,
			});

			alert('✅ User upgraded to Premium!');
			fetchRequests(); // refresh list
		} catch (err) {
			console.error('Error approving request:', err);
			alert('⚠️ Failed to approve request.');
		}
	};

	// Reject request
	const rejectRequest = async (id) => {
		try {
			await updateDoc(doc(db, 'premiumRequests', id), {
				status: 'rejected',
			});

			alert('❌ Request rejected.');
			fetchRequests(); // refresh list
		} catch (err) {
			console.error('Error rejecting request:', err);
			alert('⚠️ Failed to reject request.');
		}
	};

	return (
		<div className='admin-dashboard'>
			<h2>Admin Dashboard</h2>

			{loading ? (
				<p>Loading requests...</p>
			) : requests.length === 0 ? (
				<p>No premium requests found.</p>
			) : (
				<table>
					<thead>
						<tr>
							<th>Email</th>
							<th>Name</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{requests.map((req) => (
							<tr key={req.id}>
								<td>{req.email}</td>
								<td>{req.name}</td>
								<td>{req.status}</td>
								<td>
									{req.status === 'pending' ? (
										<>
											<button
												className='btn approve-btn'
												onClick={() => approveRequest(req.id, req.uid)}
											>
												Approve
											</button>
											<button
												className='btn reject-btn'
												onClick={() => rejectRequest(req.id)}
											>
												Reject
											</button>
										</>
									) : (
										<em>{req.status}</em>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default AdminDashboard;
