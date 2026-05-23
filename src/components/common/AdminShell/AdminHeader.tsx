import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, } from '@mui/material';
import { Menu } from 'lucide-react';
// import { UserButton } from '@clerk/clerk-react';
import { AdminAvatar } from './AdminAvatar';
import { NotificationBell } from '@/features/notifications/NotificationBell';
const drawerWidth = 260;

interface AdminHeaderProps {
  onDrawerToggle: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onDrawerToggle }) => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e7e5e4', // border-stone-200
        color: '#1c1a17'
      }}
    >
      <Toolbar>
        {/* Nút Hamburger cho Mobile */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <Menu size={24} />
        </IconButton>

        {/* Tiêu đề trang (có thể linh động dựa vào Router sau này) */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '18px' }}>
          Hệ thống Quản trị
        </Typography>

        {/* Cụm công cụ bên phải */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton> */}
          <NotificationBell />

          {/* Component có sẵn của Clerk để quản lý tài khoản */}
          <AdminAvatar />
        </Box>
      </Toolbar>
    </AppBar>
  );
};