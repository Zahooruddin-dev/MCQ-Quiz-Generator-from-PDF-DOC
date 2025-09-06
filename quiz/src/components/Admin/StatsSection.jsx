import React from "react";
import { Stack } from "@mui/material";
import StatsCard from "./StatsCard";
import { Users, Clock, Crown, XCircle } from "lucide-react";

const StatsSection = ({ stats }) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
    <StatsCard icon={<Users size={24} />} value={stats.totalRequests} label="Total Requests" color="primary" />
    <StatsCard icon={<Clock size={24} />} value={stats.pendingRequests} label="Pending" color="warning" />
    <StatsCard icon={<Crown size={24} />} value={stats.approvedRequests} label="Approved" color="success" />
    <StatsCard icon={<XCircle size={24} />} value={stats.rejectedRequests} label="Rejected" color="error" />
  </Stack>
);

export default StatsSection;
