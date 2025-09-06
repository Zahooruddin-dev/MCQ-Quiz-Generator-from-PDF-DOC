import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Shield,
  Users,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Settings,
  BarChart3,
  UserCheck,
  UserX,
  Trash2,
  Eye,
} from 'lucide-react';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const AdminContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  borderRadius: theme.shape.borderRadius * 3,
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  transition: 'all 0.3s ease',
  animation: `${slideIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const RequestCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'pending' && {
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: 'white',
  }),
  ...(status === 'approved' && {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
  }),
  ...(status === 'rejected' && {
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    color: 'white',
  }),
}));

const ModernAdminDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const adminEmail = "mizuka886@gmail.com";

  const fetchRequests = async () => {
    setLoading(true);
    try {
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
      
      // Calculate stats
      const stats = {
        totalRequests: list.length,
        pendingRequests: list.filter(r => r.status === 'pending').length,
        approvedRequests: list.filter(r => r.status === 'approved').length,
        rejectedRequests: list.filter(r => r.status === 'rejected').length,
      };
      setStats(stats);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email !== adminEmail) {
      navigate('/');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const handleAction = async (action, requestId, uid) => {
    setActionLoading(true);
    try {
      if (action === 'approve') {
        await updateDoc(doc(db, 'premiumRequests', requestId), { status: 'approved' });
        await updateDoc(doc(db, 'users', uid), { isPremium: true, credits: 300 });
      } else if (action === 'reject') {
        await updateDoc(doc(db, 'premiumRequests', requestId), { status: 'rejected' });
      } else if (action === 'terminate') {
        await updateDoc(doc(db, 'users', uid), { isPremium: false, credits: 0 });
        await updateDoc(doc(db, 'premiumRequests', requestId), { status: 'rejected' });
      }
      
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (user?.email !== adminEmail) {
    return null;
  }

  return (
    <AdminContainer maxWidth="lg">
      <Stack spacing={4}>
        {/* Header */}
        <HeaderCard>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={3} alignItems="center">
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Shield size={28} />
                </Box>
                
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    Admin Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Manage premium requests and user accounts
                  </Typography>
                </Box>
              </Stack>
              
              <Button
                variant="outlined"
                startIcon={<ArrowLeft size={16} />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Back to App
              </Button>
            </Stack>
          </CardContent>
        </HeaderCard>

        {/* Stats */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <StatsCard sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Users size={24} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                {stats.totalRequests}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Total Requests
              </Typography>
            </CardContent>
          </StatsCard>

          <StatsCard sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Clock size={24} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mb: 0.5 }}>
                {stats.pendingRequests}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Pending
              </Typography>
            </CardContent>
          </StatsCard>

          <StatsCard sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Crown size={24} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mb: 0.5 }}>
                {stats.approvedRequests}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Approved
              </Typography>
            </CardContent>
          </StatsCard>

          <StatsCard sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <XCircle size={24} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', mb: 0.5 }}>
                {stats.rejectedRequests}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Rejected
              </Typography>
            </CardContent>
          </StatsCard>
        </Stack>

        {/* Requests Table */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Premium Requests
            </Typography>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Loading requests...
                </Typography>
              </Box>
            ) : requests.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No premium requests found.
              </Alert>
            ) : (
              <Stack spacing={2}>
                {requests.map((request) => (
                  <RequestCard key={request.id}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={3} alignItems="center" sx={{ flex: 1 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                              fontWeight: 600,
                            }}
                          >
                            {request.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {request.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              {request.email}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Requested: {formatDate(request.createdAt)}
                            </Typography>
                          </Box>
                          
                          <StatusChip
                            icon={getStatusIcon(request.status)}
                            label={request.status?.toUpperCase() || 'UNKNOWN'}
                            status={request.status}
                            size="small"
                          />
                        </Stack>
                        
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => setSelectedRequest(request)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Eye size={16} />
                          </IconButton>
                          
                          {request.status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleAction('approve', request.id, request.uid)}
                                disabled={actionLoading}
                                sx={{ color: 'success.main' }}
                              >
                                <UserCheck size={16} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleAction('reject', request.id, request.uid)}
                                disabled={actionLoading}
                                sx={{ color: 'error.main' }}
                              >
                                <UserX size={16} />
                              </IconButton>
                            </>
                          )}
                          
                          {request.status === 'approved' && (
                            <IconButton
                              size="small"
                              onClick={() => handleAction('terminate', request.id, request.uid)}
                              disabled={actionLoading}
                              sx={{ color: 'error.main' }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </RequestCard>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Request Details Dialog */}
        <Dialog
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          maxWidth="sm"
          fullWidth
        >
          {selectedRequest && (
            <>
              <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      fontWeight: 600,
                    }}
                  >
                    {selectedRequest.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedRequest.name || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Premium Request Details
                    </Typography>
                  </Box>
                </Stack>
              </DialogTitle>
              
              <DialogContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Email Address
                    </Typography>
                    <Typography variant="body1">{selectedRequest.email}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Request Date
                    </Typography>
                    <Typography variant="body1">{formatDate(selectedRequest.createdAt)}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Current Status
                    </Typography>
                    <StatusChip
                      icon={getStatusIcon(selectedRequest.status)}
                      label={selectedRequest.status?.toUpperCase() || 'UNKNOWN'}
                      status={selectedRequest.status}
                      size="small"
                    />
                  </Box>
                </Stack>
              </DialogContent>
              
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
                
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleAction('reject', selectedRequest.id, selectedRequest.uid)}
                      disabled={actionLoading}
                      startIcon={<UserX size={16} />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleAction('approve', selectedRequest.id, selectedRequest.uid)}
                      disabled={actionLoading}
                      startIcon={<UserCheck size={16} />}
                    >
                      Approve
                    </Button>
                  </>
                )}
                
                {selectedRequest.status === 'approved' && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleAction('terminate', selectedRequest.id, selectedRequest.uid)}
                    disabled={actionLoading}
                    startIcon={<Trash2 size={16} />}
                  >
                    Terminate Premium
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Stack>
    </AdminContainer>
  );
};

export default ModernAdminDashboard;