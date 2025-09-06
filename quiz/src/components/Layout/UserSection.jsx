import React from 'react';
import { IconButton, Avatar, Badge } from '@mui/material';
import { Crown, Settings } from 'lucide-react';
import { StyledChip, UserSectionBox } from './styles';

const UserSection = ({
  isPremium,
  credits,
  isAdmin,
  user,
  handleMenuOpen,
  getUserInitials,
}) => (
  <UserSectionBox>
    <StyledChip
      icon={isPremium ? <Crown size={16} /> : <Settings size={16} />}
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
  </UserSectionBox>
);

export default UserSection;
