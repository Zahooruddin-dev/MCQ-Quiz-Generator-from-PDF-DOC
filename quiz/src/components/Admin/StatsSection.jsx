import React from "react";
import { Stack } from "@mui/material";
import StatsCard from "./StatsCard";
import { Users, Clock, Crown, XCircle } from "lucide-react";

const StatsSection = ({ stats, isMobile = false, isTablet = false }) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={{ xs: 1.5, sm: 2, md: 3 }}
    sx={{
      '& > *': {
        minWidth: { xs: '100%', sm: 0 },
      },
    }}
  >
    <StatsCard icon={<Users size={isMobile ? 20 : 24} />} value={stats.totalRequests} label="Total Requests" color="primary" />
    <StatsCard icon={<Clock size={isMobile ? 20 : 24} />} value={stats.pendingRequests} label="Pending" color="warning" />
    <StatsCard icon={<Crown size={isMobile ? 20 : 24} />} value={stats.approvedRequests} label="Approved" color="success" />
    <StatsCard icon={<XCircle size={isMobile ? 20 : 24} />} value={stats.rejectedRequests} label="Rejected" color="error" />
  </Stack>
);

export default StatsSection;
