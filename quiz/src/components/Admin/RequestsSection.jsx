import React from "react";
import { Card, CardContent, Typography, Stack } from "@mui/material";
import RequestCard from "./RequestCard";

const RequestsSection = ({ requests, setSelectedRequest, handleAction, actionLoading }) => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent sx={{ p: 4 }}>
      <Typography
       variant={"h6"}
       sx={{ fontWeight: 700, mb: { xs: 2, sm: 2.5, md: 3 } }}
     >
       Premium Requests
     </Typography>
     <Stack spacing={{ xs: 1.25, sm: 1.75, md: 2 }}>
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            setSelectedRequest={setSelectedRequest}
            handleAction={handleAction}
            actionLoading={actionLoading}
          />
        ))}
      </Stack>
    </CardContent>
  </Card>
);

export default RequestsSection;
