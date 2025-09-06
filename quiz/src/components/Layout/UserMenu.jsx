import React from 'react';
import {
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Typography,
  Stack,
  Chip,
  Box,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { User, Settings, LogOut, Crown, Coins, BarChart3 } from 'lucide-react';

const UserMenu = ({
  anchorEl,
  handleMenuClose,
  user,
  isPremium,
  credits,
  isAdmin,
  getUserInitials,
  onProfileClick,
  onApiConfigClick,
  onLogout,
}) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleMenuClose}
    PaperProps={{
      sx: {
        mt: 1,
        minWidth: 280,
        borderRadius: 2,
        boxShadow:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
            background:
              'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
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
                  background:
                    'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
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

    <MenuItem onClick={onProfileClick} sx={{ py: 1.5 }}>
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
      <MenuItem onClick={onApiConfigClick} sx={{ py: 1.5 }}>
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

    <MenuItem onClick={onLogout} sx={{ py: 1.5, color: 'error.main' }}>
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
);

export default UserMenu;
