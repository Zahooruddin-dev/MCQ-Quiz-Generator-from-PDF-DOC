import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
const AdminDashboard = ({ onClose }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const adminEmail = "mizuka886@gmail.com";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "premiumRequests"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setRequests(list);
    } catch (err) {
      console.error("Error fetching requests:", err);
      alert("⚠️ Failed to fetch requests. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email !== adminEmail) {
      alert("⚠️ You are not an admin.");
      return;
    }
    fetchRequests();
  }, [user]);

  const approveRequest = async (id, uid) => {
    try {
      await updateDoc(doc(db, "premiumRequests", id), { status: "approved" });
      await updateDoc(doc(db, "users", uid), { isPremium: true, credits: 300 });
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("⚠️ Failed to approve request.");
    }
  };

  const rejectRequest = async (id) => {
    try {
      await updateDoc(doc(db, "premiumRequests", id), { status: "rejected" });
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("⚠️ Failed to reject request.");
    }
  };

  const terminatePremium = async (uid) => {
    try {
      await updateDoc(doc(db, "users", uid), { isPremium: false, credits: 0 });
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("⚠️ Failed to terminate premium.");
    }
  };
const navigate  = useNavigate();

  return (
    <div className="admin-dashboard card">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <button className="btn close-btn" onClick={ () => navigate("/")}>
          ❌ 
        </button>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No premium requests found.</p>
      ) : (
        <table className="table">
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
                <td>
                  <span
                    className={`status-badge ${
                      req.status === "pending"
                        ? "pending"
                        : req.status === "approved"
                        ? "approved"
                        : "rejected"
                    }`}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </td>
                <td className="actions-cell">
                  {req.status === "pending" && (
                    <>
                      <button
                        className="btn btn-secondary small"
                        onClick={() => approveRequest(req.id, req.uid)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-secondary small"
                        onClick={() => rejectRequest(req.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {req.status === "approved" && (
                    <button
                      className="btn btn-secondary small"
                      onClick={() => terminatePremium(req.uid)}
                    >
                      Terminate
                    </button>
                  )}
                  {req.status === "rejected" && <em>Rejected</em>}
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
