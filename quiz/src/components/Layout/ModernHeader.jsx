import React, { useState } from 'react';
import { Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StyledAppBar } from './styles';
import LogoSection from './LogoSection';
import UserSection from './UserSection';
import UserMenu from './UserMenu';

const ModernHeader = ({ onProfileClick, onApiConfigClick }) => {
  const navigate = useNavigate();
  const { user, logout, credits, isPremium } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const ADMIN_EMAIL = 'mizuka886@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <StyledAppBar position="sticky" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        <LogoSection onClick={handleLogoClick} />
        <UserSection
          isPremium={isPremium}
          credits={credits}
          isAdmin={isAdmin}
          user={user}
          handleMenuOpen={handleMenuOpen}
          getUserInitials={getUserInitials}
        />
        <UserMenu
          anchorEl={anchorEl}
          handleMenuClose={handleMenuClose}
          user={user}
          isPremium={isPremium}
          credits={credits}
          isAdmin={isAdmin}
          getUserInitials={getUserInitials}
          onProfileClick={handleProfileClick}
          onApiConfigClick={handleApiConfigClick}
          
          onLogout={handleLogout}
        />
      </Toolbar>
    </StyledAppBar>
  );
};

export default ModernHeader;
