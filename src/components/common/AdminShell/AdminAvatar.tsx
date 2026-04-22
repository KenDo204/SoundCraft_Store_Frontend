import React, { useState } from 'react';
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Divider,
  Tooltip
} from '@mui/material';
import { Settings, LogOut, User as UserIcon, Home } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const AdminAvatar: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // State quản lý việc đóng/mở Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    try {
      // 1. Đăng xuất khỏi Clerk (nếu đang dùng)
      if (isSignedIn) {
        await signOut();
      }
      // 2. Gọi logoutThunk từ Redux (đã bao gồm xóa localStorage & xóa session server)
      await logout();

      toast.success("Đăng xuất thành công");
      // 3. Quay về trang chủ
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  // Skeleton loading nếu Clerk chưa tải xong
  if (!isLoaded) {
    return <Avatar sx={{ width: 36, height: 36, bgcolor: '#e7e5e4' }} />;
  }

  // Lấy tên để hiển thị (hoặc email nếu chưa set tên)
  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Admin';

  return (
    <>
      <Tooltip title="Tài khoản">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            src={user?.imageUrl}
            alt={displayName}
            sx={{ width: 36, height: 36, border: '2px solid #f5f4ef' }}
          />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.1))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1.5,
              },
              // Mũi tên nhỏ chỉ lên Avatar
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1c1a17' }}>
            {displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#78716c' }}>
            {user?.primaryEmailAddress?.emailAddress}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={() => navigate('/admin/profile')}
        >
          <ListItemIcon><UserIcon size={18} /></ListItemIcon>
          Hồ sơ của tôi
        </MenuItem>

        <MenuItem onClick={() => navigate('/')}>
          <ListItemIcon><Home size={18} /></ListItemIcon>
          Về trang cửa hàng
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon><Settings size={18} /></ListItemIcon>
          Cài đặt hệ thống
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleSignOut} sx={{ color: '#dc2626' }}>
          <ListItemIcon><LogOut size={18} color="#dc2626" /></ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </>
  );
};