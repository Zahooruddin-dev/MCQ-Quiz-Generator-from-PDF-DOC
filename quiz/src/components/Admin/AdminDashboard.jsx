// src/components/Admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const snap = await getDocs(collection(db, "premiumRequests"));
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleUpdate = async (uid, status) => {
    try {
      await updateDoc(doc(db, "premiumRequests", uid), { status });
      if (status === "approved") {
        await updateDoc(doc(db, "users", uid), { isPremium: true });
      }
      alert(`Request ${status}`);
      setRequests((prev) =>
        prev.map((r) => (r.id === uid ? { ...r, status } : r))
      );
    } catch (err) {
      console.error("Error updating request:", err);
      alert("Failed to update request");
    }
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {requests.length === 0 ? (
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
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleUpdate(req.uid, "approved")}
                        className="btn small-btn"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdate(req.uid, "denied")}
                        className="btn small-btn"
                      >
                        Deny
                      </button>
                    </>
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
