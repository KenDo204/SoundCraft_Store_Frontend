// Notifications page with user activities
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead } from '@/store/slices/notification.slice';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Bell,
  ShoppingBag,
  Ticket,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { Button, Pagination, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const typeConfig: Record<string, { icon: any, color: string, bg: string, label: string }> = {
  ORDER: { icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Đơn hàng' },
  PROMOTION: { icon: Ticket, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Khuyến mãi' },
  SYSTEM: { icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Hệ thống' },
  PRE_ORDER: { icon: Clock, color: 'text-green-600', bg: 'bg-green-50', label: 'Hàng đã về' },
  INFO: { icon: Bell, color: 'text-stone-600', bg: 'bg-stone-50', label: 'Thông tin' },
};

export const NotificationsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, pagination, isLoading, unreadCount } = useAppSelector((state) => state.notifications);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchNotifications({ page: page - 1, size: 10 }));
  }, [dispatch, page]);

  const handlePageChange = (_: any, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
              <Bell className="text-orange-600" size={32} />
              THÔNG BÁO CỦA BẠN
            </h1>
            <p className="text-stone-500 font-medium mt-1">
              Bạn có {unreadCount} thông báo chưa đọc
            </p>
          </div>

          <div className="flex gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                onClick={handleMarkAllRead}
                startIcon={<CheckCircle2 size={18} />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  color: '#0f172a',
                  borderColor: '#e7e5e4',
                  '&:hover': { borderColor: '#0f172a', bgcolor: '#f5f5f4' }
                }}
              >
                Đánh dấu đã đọc tất cả
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 overflow-hidden divide-y divide-stone-100">
          {isLoading && list.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <CircularProgress sx={{ color: '#ea580c' }} />
              <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Đang tải thông báo...</span>
            </div>
          ) : list.length > 0 ? (
            <>
              {list.map((item) => {
                const config = typeConfig[item.type] || typeConfig.INFO;
                const Icon = config.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => !item.is_read && handleMarkRead(item.id)}
                    className={`p-6 flex gap-5 transition-all cursor-pointer relative group ${!item.is_read ? 'bg-orange-50/10' : 'hover:bg-stone-50 opacity-80'}`}
                  >
                    {!item.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.5)]" />}

                    <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shrink-0 shadow-sm border border-stone-100`}>
                      <Icon size={28} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg leading-tight line-clamp-1 ${!item.is_read ? 'text-stone-900' : 'text-stone-500'}`}>
                            {item.title}
                          </span>
                          <Chip
                            label={config.label}
                            size="small"
                            sx={{ height: '20px', fontSize: '10px', fontWeight: 'bold', bgcolor: config.bg, color: config.color.replace('text-', '') }}
                          />
                        </div>
                        <span className="text-xs font-bold text-stone-400 whitespace-nowrap">
                          {item.created_at && !isNaN(new Date(item.created_at).getTime())
                            ? format(new Date(item.created_at), 'HH:mm, dd/MM/yyyy', { locale: vi })
                            : '---'}
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed mb-1 ${!item.is_read ? 'text-stone-700 font-medium' : 'text-stone-500'}`}>
                        {item.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination.meta.totalPages > 1 && (
                <div className="p-8 flex justify-center bg-[#fcfbf9]">
                  <Pagination
                    count={pagination.meta.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root': { fontWeight: 'bold', borderRadius: '8px' },
                      '& .Mui-selected': { bgcolor: '#1c1917 !important', color: 'white' }
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 border border-stone-100 text-stone-200">
                <Inbox size={40} />
              </div>
              <h3 className="text-xl font-bold text-stone-700 mb-2">Hộp thư trống</h3>
              <p className="text-stone-400 max-w-xs">Bạn chưa có bất kỳ thông báo nào. Các cập nhật quan trọng sẽ hiển thị ở đây.</p>
              <Button
                onClick={() => navigate('/')}
                variant="contained"
                sx={{ mt: 4, bgcolor: '#1c1917', borderRadius: '12px', fontWeight: 'bold', px: 4 }}
              >
                Quay về Trang chủ
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
