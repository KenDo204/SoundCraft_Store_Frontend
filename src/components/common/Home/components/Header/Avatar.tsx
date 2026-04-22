import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { 
  User, 
  ShoppingCart, 
  ClipboardList, 
  Heart, 
  LogOut, 
  ShieldCheck, 
  ChevronDown 
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import type { UserInfo } from '@/types/auth.types';

const navItems = [
  { title: "Hồ sơ của bạn", icon: <User className="w-4 h-4" />, path: "/account/profile" },
  { title: "Giỏ hàng của tôi", icon: <ShoppingCart className="w-4 h-4" />, path: "/cart" },
  { title: "Lịch sử mua hàng", icon: <ClipboardList className="w-4 h-4" />, path: "/account/orders" },
  { title: "Danh sách yêu thích", icon: <Heart className="w-4 h-4" />, path: "/wishlist" },
];

const AvatarNav = ({ user }: { user: UserInfo }) => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
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

  console.log("CHECK EMAIL TRƯỚC KHI HIỂN THỊ:", user);
  console.log("EMAIL TRONG NAV:", user?.email);
  

  if (!user || !user.email){
    console.log("NAV KHÔNG HIỆN VÌ THIẾU EMAIL");
    return null;
  }

  return (
    <div 
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        {/* TRIGGER: Avatar với hiệu ứng hover xanh teal như cũ */}
        <DropdownMenuTrigger asChild>
          <div className="relative cursor-pointer group outline-none">
            <div className="p-0.5 rounded-full transition-all duration-300 group-hover:ring-2 group-hover:ring-stone-600">
              <Avatar className="w-10 h-10 border border-stone-200">
                <AvatarImage referrerPolicy="no-referrer" src={user.avatar || undefined} alt={user.full_name} />
                <AvatarFallback className="bg-stone-100 text-[#00927c] font-bold">
                  {user.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Icon drop down nhỏ góc dưới */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-stone-100 shadow-sm">
              <ChevronDown className="w-4 h-4 text-stone-600" />
            </div>
          </div>
        </DropdownMenuTrigger>

        {/* CONTENT: Menu thả xuống */}
        <DropdownMenuContent className="w-64 p-2 shadow-xl border-stone-200" align="end">
          <DropdownMenuLabel className="px-2 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-stone-900 leading-none">
                {user.full_name}
              </span>
              <span className="text-xs text-stone-500 mt-1 truncate">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-stone-100" />

          {/* Danh sách menu chính */}
          <div className="py-1">
            {navItems.map((item) => (
              <DropdownMenuItem 
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer text-stone-700 hover:text-theme-olive transition-colors focus:bg-stone-50"
              >
                <span className="text-stone-400 group-hover:text-theme-olive">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.title}</span>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="bg-stone-100" />

          {/* Nút đặc biệt: Quản trị hoặc Seller */}
          <div className="py-1">
            {["ROLE_ADMIN", "ROLE_SUPER_ADMIN"].includes(user?.role) ? (
              <DropdownMenuItem 
                onClick={() => navigate("/admin")}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer bg-[#00927c] text-white focus:bg-[#007a68] focus:text-white rounded-md mb-1 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-bold">Trang Quản Trị Viên</span>
              </DropdownMenuItem>
            ) : (
              null
            )}
          </div>

          <DropdownMenuSeparator className="bg-stone-100" />

          {/* Nút Đăng xuất */}
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-bold">Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AvatarNav;