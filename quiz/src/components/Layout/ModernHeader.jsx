import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Stack,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  User,
  Settings,
  LogOut,
  Crown,
  Coins,
  Menu as MenuIcon,
  Brain,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  color: theme.palette.text.primary,
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.shape.borderRadius,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
}));

const UserSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  border: '1px solid',
  borderColor: theme.palette.primary.light + '30',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

const ModernHeader = ({ onProfileClick, onApiConfigClick, showApiConfig }) => {
  const navigate = useNavigate();
  const { user, logout, credits, isPremium } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const ADMIN_EMAIL = "mizuka886@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    onProfileClick?.();
    handleMenuClose();
  };

  const handleApiConfigClick = () => {
    onApiConfigClick?.();
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <StyledAppBar position="sticky" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        {/* Logo Section */}
        <LogoSection sx={{ flexGrow: 1 }} onClick={handleLogoClick}>
          <LogoIcon>
            <Brain size={24} />
          </LogoIcon>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
              }}
            >
              QuizAI
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              AI-Powered Quiz Generator
            </Typography>
          </Box>
        </LogoSection>

        {/* User Section */}
        <UserSection>
          {/* Credits/Premium Badge */}
          <StyledChip
            icon={isPremium ? <Crown size={16} /> : <Coins size={16} />}
            label={isPremium ? 'Premium' : `${credits} Credits`}
            size="small"
            sx={{
              display: { xs: 'none', sm: 'flex' },
              background: isPremium
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : undefined,
              color: isPremium ? '#1E293B' : undefined,
              fontWeight: isPremium ? 700 : 600,
            }}
          />

          {/* User Avatar and Menu */}
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                isPremium ? (
                  <Crown size={12} color="#FFD700" />
                ) : isAdmin ? (
                  <Settings size={12} color="#6366F1" />
                ) : null
              }
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {getUserInitials(user?.displayName)}
              </Avatar>
            </Badge>
          </IconButton>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 280,
                borderRadius: 2,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* User Info Header */}
            <Box sx={{ px: 2, py: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    fontWeight: 600,
                  }}
                >
                  {getUserInitials(user?.displayName)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user?.displayName || 'User'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {user?.email}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip
                      icon={isPremium ? <Crown size={14} /> : <Coins size={14} />}
                      label={isPremium ? 'Premium' : `${credits} Credits`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        background: isPremium
                          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                          : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    {isAdmin && (
                      <Chip
                        label="Admin"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Menu Items */}
            <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <User size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Profile"
                secondary="View and edit profile"
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>

            {isAdmin && (
              <MenuItem onClick={handleApiConfigClick} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <Settings size={20} />
                </ListItemIcon>
                <ListItemText
                  primary="API Configuration"
                  secondary="Configure AI settings"
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </MenuItem>
            )}

            <MenuItem sx={{ py: 1.5 }}>
              <ListItemIcon>
                <BarChart3 size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Analytics"
                secondary="View your quiz stats"
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
              <ListItemIcon>
                <LogOut size={20} color="currentColor" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                secondary="Sign out of your account"
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
          </Menu>
        </UserSection>
      </Toolbar>
    </StyledAppBar>
  );
};

export default ModernHeader;