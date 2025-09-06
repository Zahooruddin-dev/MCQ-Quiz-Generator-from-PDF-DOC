import React from "react";
import { Chip } from "@mui/material";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const StatusChip = ({ status }) => {
  let config = { label: "UNKNOWN", color: "default", icon: null };

  if (status === "pending") {
    config = { label: "PENDING", color: "warning", icon: <Clock size={16} /> };
  } else if (status === "approved") {
    config = { label: "APPROVED", color: "success", icon: <CheckCircle size={16} /> };
  } else if (status === "rejected") {
    config = { label: "REJECTED", color: "error", icon: <XCircle size={16} /> };
  }

  return <Chip icon={config.icon} label={config.label} color={config.color} size="small" />;
};

export default StatusChip;
