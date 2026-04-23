import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Divider,
  Box,
  Typography
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Tags, 
  ListTree, 
  ShoppingBag, 
  Users, 
  Ticket,
  BookOpen
} from 'lucide-react';

const drawerWidth = 260;

interface AdminDrawerProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
  { text: 'Quản lý Banner', icon: <ImageIcon size={20} />, path: '/admin/banners' },
  { text: 'Thương hiệu', icon: <Tags size={20} />, path: '/admin/brands' },
  { text: 'Danh mục', icon: <ListTree size={20} />, path: '/admin/categories' },
  { text: 'Sản phẩm', icon: <ShoppingBag size={20} />, path: '/admin/products' },
  { text: 'Đơn hàng', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
  { text: 'Bài viết', icon: <BookOpen size={20} />, path: '/admin/blogs' },
  { text: 'Mã giảm giá', icon: <Ticket size={20} />, path: '/admin/coupons' },
  { text: 'Khách hàng', icon: <Users size={20} />, path: '/admin/customers' },
];

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ mobileOpen, onClose }) => {
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1c1a17', color: '#f5f4ef' }}>
      {/* Logo Area */}
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
          SOUND CRAFT <span style={{ color: '#a68c46' }}>PRO</span>
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      {/* Navigation Links */}
      <List sx={{ flexGrow: 1, px: 2, pt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {MENU_ITEMS.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === '/admin'}
              onClick={onClose}
              sx={{
                borderRadius: '8px',
                color: '#a8a29e', // text-stone-400
                '&.active': {
                  bgcolor: '#a68c46', // theme-gold
                  color: '#ffffff',
                  '& .MuiListItemIcon-root': { color: '#ffffff' }
                },
                '&:hover:not(.active)': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: '#f5f4ef'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              
              {/* SỬA LỖI Ở ĐÂY: Truyền ReactNode vào primary thay vì dùng primaryTypographyProps */}
              <ListItemText 
                primary={
                  <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                    {item.text}
                  </Typography>
                } 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }} 
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};