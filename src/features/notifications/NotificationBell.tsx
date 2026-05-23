import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUnreadCount, fetchNotifications, markAsRead, markAllAsRead } from '@/store/slices/notification.slice';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { unreadCount, list, isLoading } = useAppSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const navigateBasedOnRole = () => {
    const role = user?.role;
    // Determine target URL based on role. Admin-like roles get admin page.
    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'OWNER', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_OWNER'];
    const target = adminRoles.includes(role ?? '') ? '/admin/notification' : '/notification';
    navigate(target);
  };

  useEffect(() => {
    if (isAuthenticated){
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, isAuthenticated]);

  const handleOpenDropdown = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      dispatch(fetchNotifications({ page: 0, size: 10 }));
    }
  };

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'ORDER': return 'bg-blue-50';
      case 'PROMOTION': return 'bg-red-50';
      case 'PRE_ORDER': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenDropdown} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative p-2 rounded-full"
          onClick={navigateBasedOnRole}
        >
          <Bell size={20} className="text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex justify-between items-center px-4 py-2">
          <DropdownMenuLabel className="font-bold text-lg p-0">Thông báo</DropdownMenuLabel>
          <Button variant="link" size="sm" onClick={handleMarkAllAsRead} className="text-blue-600 p-0 h-auto">
            Đánh dấu đã đọc tất cả
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
          ) : list.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Không có thông báo nào</div>
          ) : (
            list.map((item) => (
              <DropdownMenuItem 
                key={item.id} 
                className={`p-3 cursor-pointer flex flex-col items-start focus:bg-gray-100 ${!item.is_read ? getBackgroundColor(item.type) : 'bg-white opacity-70'}`}
                onClick={() => handleMarkAsRead(item.id)}
              >
                <div className="flex justify-between w-full mb-1">
                  <span className={`text-sm ${!item.is_read ? 'font-bold text-black' : 'font-normal text-gray-700'}`}>{item.title}</span>
                  <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className={`text-xs ${!item.is_read ? 'text-gray-800' : 'text-gray-500'} line-clamp-2`}>{item.content}</p>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
           <Button 
            variant="ghost" 
            className="text-orange-600 font-bold text-sm w-full"
            onClick={() => {
              setIsOpen(false);
              navigateBasedOnRole();
            }}
           >
              Xem tất cả thông báo
           </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
