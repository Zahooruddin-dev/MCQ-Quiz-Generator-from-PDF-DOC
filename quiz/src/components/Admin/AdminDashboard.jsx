// src/components/Admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "premiumRequests"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRequests(data);
    });

    return unsubscribe;
  }, []);

  const handleApproval = async (request, approved) => {
    try {
      // Update request status
      await updateDoc(doc(db, "premiumRequests", request.id), {
        status: approved ? "approved" : "denied",
      });

      // If approved → update user record
      if (approved) {
        await updateDoc(doc(db, "users", request.uid), {
          isPremium: true,
        });
      }
    } catch (err) {
      console.error("Error updating request:", err);
      alert("Failed to update request.");
    }
  };

  return (
    <motion.div
      className="admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>Admin Dashboard</h2>
      {requests.length === 0 ? (
        <p>No premium requests yet.</p>
      ) : (
        <ul className="request-list">
          {requests.map((req) => (
            <li key={req.id} className="request-card">
              <p><strong>Name:</strong> {req.name}</p>
              <p><strong>Email:</strong> {req.email}</p>
              <p><strong>Status:</strong> {req.status}</p>
              <div className="actions">
                {req.status === "pending" && (
                  <>
                    <button
                      className="btn small-btn approve"
                      onClick={() => handleApproval(req, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn small-btn deny"
                      onClick={() => handleApproval(req, false)}
                    >
                      Deny
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
