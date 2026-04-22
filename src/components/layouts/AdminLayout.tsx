// File: src/components/layouts/AdminLayout.tsx
import React, { useState } from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

// Nếu dùng Cách B ở trên thì import thế này:
import { AdminHeader, AdminDrawer } from '../common/AdminShell';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f4ef' }}>
      <CssBaseline />

      <AdminHeader onDrawerToggle={handleDrawerToggle} />
      <AdminDrawer mobileOpen={mobileOpen} onClose={handleDrawerToggle} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - 260px)` }, overflowX: 'hidden' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;