import React, { useEffect, useState } from "react";
import { Stack, LinearProgress, Alert, Box } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { collection, query, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";

import HeaderSection from "./HeaderSection";
import StatsSection from "./StatsSection";
import RequestsSection from "./RequestsSection";
import RequestDialog from "./RequestDialog";
import { AdminContainer } from "./styles";

const ModernAdminDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const adminEmail = "mizuka886@gmail.com";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "premiumRequests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setRequests(list);
      setStats({
        totalRequests: list.length,
        pendingRequests: list.filter((r) => r.status === "pending").length,
        approvedRequests: list.filter((r) => r.status === "approved").length,
        rejectedRequests: list.filter((r) => r.status === "rejected").length,
      });
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email !== adminEmail) {
      navigate("/");
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const handleAction = async (action, requestId, uid) => {
    setActionLoading(true);
    try {
      if (action === "approve") {
        await updateDoc(doc(db, "premiumRequests", requestId), { status: "approved" });
        await updateDoc(doc(db, "users", uid), { isPremium: true, credits: 300 });
      } else if (action === "reject") {
        await updateDoc(doc(db, "premiumRequests", requestId), { status: "rejected" });
      } else if (action === "terminate") {
        await updateDoc(doc(db, "users", uid), { isPremium: false, credits: 0 });
        await updateDoc(doc(db, "premiumRequests", requestId), { status: "rejected" });
      }
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (user?.email !== adminEmail) return null;

  return (
    <AdminContainer maxWidth="lg">
      <Stack spacing={4}>
        <HeaderSection onBack={() => navigate("/dashboard")} />
        <StatsSection stats={stats} />
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <LinearProgress sx={{ mb: 2 }} />
          </Box>
        ) : requests.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No premium requests found.
          </Alert>
        ) : (
          <RequestsSection
            requests={requests}
            setSelectedRequest={setSelectedRequest}
            handleAction={handleAction}
            actionLoading={actionLoading}
          />
        )}
        <RequestDialog
          selectedRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          handleAction={handleAction}
          actionLoading={actionLoading}
        />
      </Stack>
    </AdminContainer>
  );
};

export default ModernAdminDashboard;
