import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchAdminUsers, 
  updateAdminUserStatus, 
  deleteAdminUser 
} from '@/store/slices/customer.slice';
import { 
  TextField, 
  InputAdornment, 
  Button, 
  CircularProgress, 
  Switch, 
  IconButton, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  Filter, 
  DollarSign, 
  AlertTriangle,
  UserCheck,
  UserX,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import type { UserRole } from '@/types/user.type';

const THEME_COLOR = '#9f8a46';
const TEAL_COLOR = '#00927c';

const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_SUPER_ADMIN: 'Super Admin',
  ROLE_ADMIN: 'Admin',
  ROLE_OWNER: 'Owner',
  ROLE_MANAGER: 'Manager',
  ROLE_STAFF: 'Staff',
  ROLE_CUSTOMER: 'Khách hàng',
};

const ROLE_COLORS: Record<UserRole, string> = {
  ROLE_SUPER_ADMIN: 'bg-red-50 text-red-700 border-red-200',
  ROLE_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  ROLE_OWNER: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ROLE_MANAGER: 'bg-blue-50 text-blue-700 border-blue-200',
  ROLE_STAFF: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ROLE_CUSTOMER: 'bg-stone-50 text-stone-700 border-stone-200',
};

export const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Selectors
  const { list, meta, isLoading } = useAppSelector((state) => state.customers);
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserRole = currentUser?.role || 'ROLE_CUSTOMER';

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [minSpending, setMinSpending] = useState<string>('');
  const [maxSpending, setMaxSpending] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modals State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');

  // Fetch Users Function
  const loadUsers = (currentPage = page) => {
    const params: any = {
      page: currentPage,
      limit,
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (statusFilter !== 'ALL') {
      params.isActive = statusFilter;
    }

    if (minSpending.trim()) {
      params.minSpending = Number(minSpending);
    }

    if (maxSpending.trim()) {
      params.maxSpending = Number(maxSpending);
    }

    dispatch(fetchAdminUsers(params));
  };

  // Initial Fetch & Filters Change
  useEffect(() => {
    loadUsers();
  }, [dispatch, page, statusFilter, minSpending, maxSpending]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce(() => {
      setPage(1);
      loadUsers(1);
    }, 500),
    [searchTerm, statusFilter, minSpending, maxSpending]
  );

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchTerm]);

  // Handle Role Filter client-side since API query params doesn't list 'role' explicitly, 
  // but if the API supports it we could send it. In fe-user-management-api.md, the query parameters listed do not include 'role'.
  // We will perform client-side filtering on roles to make the UI flexible, or just display the matches.
  const filteredUsers = useMemo(() => {
    if (roleFilter === 'ALL') return list;
    return list.filter(user => user.user_role === roleFilter);
  }, [list, roleFilter]);

  // Role Hierarchy Check helper
  const canManageUser = (targetRole: UserRole): boolean => {
    if (currentUserRole === 'ROLE_SUPER_ADMIN') return true;
    if (currentUserRole === 'ROLE_ADMIN' || currentUserRole === 'ROLE_OWNER') {
      return targetRole !== 'ROLE_SUPER_ADMIN';
    }
    if (currentUserRole === 'ROLE_MANAGER') {
      return targetRole === 'ROLE_STAFF';
    }
    return false;
  };

  // Toggle active status
  const handleToggleStatus = async (id: number, currentStatus: boolean, targetRole: UserRole) => {
    if (!canManageUser(targetRole)) {
      toast.error('Bạn không có quyền thay đổi trạng thái của tài khoản này');
      return;
    }

    try {
      await dispatch(updateAdminUserStatus({ id, isActive: !currentStatus })).unwrap();
      toast.success(`Đã ${!currentStatus ? 'mở khóa' : 'khóa'} tài khoản thành công!`);
    } catch (err: any) {
      toast.error(err || 'Không thể cập nhật trạng thái tài khoản');
    }
  };

  // Delete User Handlers
  const handleDeleteClick = (id: number, name: string, targetRole: UserRole) => {
    if (!canManageUser(targetRole)) {
      toast.error('Bạn không có quyền xóa tài khoản này');
      return;
    }
    setSelectedUserId(id);
    setSelectedUserName(name);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUserId === null) return;
    try {
      await dispatch(deleteAdminUser(selectedUserId)).unwrap();
      toast.success('Xóa tài khoản thành công!');
      loadUsers();
    } catch (err: any) {
      toast.error(err || 'Không thể xóa tài khoản');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setMinSpending('');
    setMaxSpending('');
    setPage(1);
  };

  // const formatCurrency = (value: string | number) => {
  //   const num = Number(value) || 0;
  //   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  // };

  return (
    <div className="p-4 lg:p-8 bg-[#fcfbf9] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Quản lý Tài khoản</h1>
            <p className="text-sm text-stone-500 mt-1 font-medium">Danh sách các tài khoản khách hàng, nhân viên và quản trị viên trong hệ thống</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              onClick={() => navigate('/admin/customers/add')}
              variant="contained"
              startIcon={<Plus size={18} />}
              sx={{ 
                bgcolor: THEME_COLOR, 
                '&:hover': { bgcolor: '#87743b' }, 
                borderRadius: '12px', 
                px: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: 'none'
              }}
            >
              Thêm tài khoản
            </Button>
          </div>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Quick Search */}
            <div className="w-full md:flex-1">
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo họ tên, email hoặc số điện thoại..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} className="text-stone-400" />
                    </InputAdornment>
                  ),
                  sx: { bgcolor: 'white', borderRadius: '12px', '& fieldset': { borderColor: '#e5e7eb' } }
                }}
              />
            </div>

            {/* Actions Bar */}
            <div className="flex gap-3 w-full md:w-auto shrink-0 justify-end">
              <Button
                variant="outlined"
                startIcon={<Filter size={18} />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                sx={{
                  borderRadius: '12px',
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  textTransform: 'none',
                  fontWeight: 'semibold',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                }}
              >
                {showAdvancedFilters ? 'Ẩn bộ lọc' : 'Bộ lọc nâng cao'}
              </Button>
              {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' || minSpending || maxSpending) && (
                <Button
                  variant="text"
                  startIcon={<X size={16} />}
                  onClick={handleResetFilters}
                  sx={{
                    color: '#ef4444',
                    textTransform: 'none',
                    fontWeight: 'semibold',
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* ADVANCED FILTERS SECTION */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100 animate-fadeIn">
              {/* Role Filter */}
              <FormControl size="small" fullWidth>
                <InputLabel id="role-select-label">Vai trò</InputLabel>
                <Select
                  labelId="role-select-label"
                  value={roleFilter}
                  label="Vai trò"
                  onChange={(e) => setRoleFilter(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="ALL">Tất cả vai trò</MenuItem>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status Filter */}
              <FormControl size="small" fullWidth>
                <InputLabel id="status-select-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                  <MenuItem value="true">Đang hoạt động</MenuItem>
                  <MenuItem value="false">Đã bị khóa</MenuItem>
                </Select>
              </FormControl>

              {/* Spending From */}
              <TextField
                label="Chi tiêu từ (đ)"
                type="number"
                size="small"
                value={minSpending}
                onChange={(e) => setMinSpending(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DollarSign size={16} /></InputAdornment>,
                  sx: { borderRadius: '12px' }
                }}
              />

              {/* Spending To */}
              <TextField
                label="Chi tiêu đến (đ)"
                type="number"
                size="small"
                value={maxSpending}
                onChange={(e) => setMaxSpending(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DollarSign size={16} /></InputAdornment>,
                  sx: { borderRadius: '12px' }
                }}
              />
            </div>
          )}
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-200 text-stone-500 text-[11px] uppercase tracking-widest font-black">
                  <th className="px-6 py-5 w-20 text-center">STT</th>
                  <th className="px-6 py-5">Tài khoản</th>
                  <th className="px-6 py-5">Email & SĐT</th>
                  <th className="px-6 py-5 w-36">Vai trò</th>
                  <th className="px-6 py-5 w-32 text-center">Trạng thái</th>
                  <th className="px-6 py-5 w-32 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <CircularProgress size={32} sx={{ color: THEME_COLOR }} />
                      <p className="mt-3 text-stone-400 font-medium text-xs uppercase tracking-widest animate-pulse">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-stone-400">
                      <div className="flex flex-col items-center gap-2">
                        <User size={32} className="opacity-20 mb-2" />
                        <span className="font-semibold text-stone-500">Không tìm thấy tài khoản nào</span>
                        <p className="text-xs text-stone-400">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem, index) => {
                    const hasManagePermission = canManageUser(userItem.user_role);
                    const formattedDate = new Date(userItem.user_created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    });

                    return (
                      <tr key={userItem.user_user_id || `${page}-${index}`} className="hover:bg-stone-50/50 transition-colors group">
                        {/* STT */}
                        <td className="px-6 py-4 font-semibold text-stone-400 text-center">
                          {((page - 1) * limit + index + 1).toString().padStart(2, '0')}
                        </td>

                        {/* Account Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-500 overflow-hidden shrink-0">
                              {userItem.user_full_name ? userItem.user_full_name.charAt(0).toUpperCase() : ''}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-stone-900 text-[14px]">
                                {userItem.user_full_name}
                              </span>
                              <span className="text-[11px] text-stone-400 mt-0.5">
                                Khởi tạo: {formattedDate}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-stone-700">{userItem.user_email}</span>
                            <span className="text-xs text-stone-500 mt-0.5">{userItem.user_mobile || 'Chưa cung cấp'}</span>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${ROLE_COLORS[userItem.user_role]}`}>
                            {ROLE_LABELS[userItem.user_role]}
                          </span>
                        </td>

                        {/* Status Switch */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Tooltip title={userItem.user_is_active ? 'Đang hoạt động' : 'Bị khóa'}>
                              <Switch 
                                checked={userItem.user_is_active}
                                disabled={!hasManagePermission}
                                onChange={() => handleToggleStatus(userItem.user_user_id, userItem.user_is_active, userItem.user_role)}
                                size="small"
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': { color: TEAL_COLOR },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: TEAL_COLOR },
                                }}
                              />
                            </Tooltip>
                            {userItem.user_is_active ? (
                              <UserCheck size={14} className="text-teal-600 hidden sm:inline" />
                            ) : (
                              <UserX size={14} className="text-red-500 hidden sm:inline" />
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip title={hasManagePermission ? "Chỉnh sửa" : "Không có quyền chỉnh sửa"}>
                              <span>
                                <IconButton 
                                  size="small" 
                                  disabled={!hasManagePermission}
                                  onClick={() => navigate(`/admin/customers/edit/${userItem.user_user_id}`)}
                                  sx={{ 
                                    color: '#64748b', 
                                    bgcolor: '#f8fafc', 
                                    '&:hover': { color: THEME_COLOR, bgcolor: '#fef3c7' },
                                    '&.Mui-disabled': { color: '#cbd5e1' }
                                  }}
                                >
                                  <Edit2 size={15} />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={hasManagePermission ? "Xóa" : "Không có quyền xóa"}>
                              <span>
                                <IconButton 
                                  size="small" 
                                  disabled={!hasManagePermission}
                                  onClick={() => handleDeleteClick(userItem.user_user_id, userItem.user_full_name, userItem.user_role)}
                                  sx={{ 
                                    color: '#64748b', 
                                    bgcolor: '#f8fafc', 
                                    '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' },
                                    '&.Mui-disabled': { color: '#cbd5e1' }
                                  }}
                                >
                                  <Trash2 size={15} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          {!isLoading && list.length > 0 && (
            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs font-bold text-stone-500">
                Hiển thị <span className="text-stone-900">{filteredUsers.length}</span> / <span className="text-stone-900">{meta.total}</span> tài khoản
              </span>
              
              {/* Pagination Controls */}
              {meta.totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    sx={{
                      borderRadius: '8px',
                      minWidth: 'auto',
                      px: 1.5,
                      borderColor: '#cbd5e1',
                      color: '#475569',
                      '&:disabled': { borderColor: '#e2e8f0', color: '#94a3b8' }
                    }}
                  >
                    Trước
                  </Button>

                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      size="small"
                      variant={p === page ? "contained" : "text"}
                      onClick={() => setPage(p)}
                      sx={{
                        borderRadius: '8px',
                        minWidth: '32px',
                        h: '32px',
                        p: 0,
                        fontWeight: 'bold',
                        bgcolor: p === page ? THEME_COLOR : 'transparent',
                        color: p === page ? 'white' : '#475569',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: p === page ? '#87743b' : 'rgba(0,0,0,0.04)',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {p}
                    </Button>
                  ))}

                  <Button
                    size="small"
                    variant="outlined"
                    disabled={page === meta.totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, meta.totalPages))}
                    sx={{
                      borderRadius: '8px',
                      minWidth: 'auto',
                      px: 1.5,
                      borderColor: '#cbd5e1',
                      color: '#475569',
                      '&:disabled': { borderColor: '#e2e8f0', color: '#94a3b8' }
                    }}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE DIALOG */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)} 
        fullWidth 
        maxWidth="xs" 
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle className="flex items-center gap-2 text-red-600 font-bold">
          <AlertTriangle size={20} className="text-red-500" /> Xác nhận xóa tài khoản
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUserName}</strong>? Hành động này sẽ xóa vĩnh viễn tài khoản khỏi hệ thống và không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ 
              color: '#64748b', 
              fontWeight: 'bold',
              textTransform: 'none' 
            }}
          >
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            sx={{ 
              bgcolor: '#ef4444', 
              '&:hover': { bgcolor: '#dc2626' },
              borderRadius: '12px',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: 'none'
            }}
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomerList;
