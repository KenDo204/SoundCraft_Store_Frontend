import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PATHS } from '@/config/paths';

// Layouts & Route Guards
import MainLayout from '@/components/layouts/ClientLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

// Pages
import Login from '@/pages/client/Login';
import Home from '@/pages/client/Home';
import ForgotPasswordPage from '@/pages/client/ForgotPassword';
import SignupPage from '@/pages/client/SignUp';
import AdminRoute from './AdminRoute';
import AdminLayout from '@/components/layouts/AdminLayout';
import AddCategory from '@/pages/admin/Categories/AddCategory';
import EditCategory from '@/pages/admin/Categories/EditCategory';
import CategoryList from '@/pages/admin/Categories/CategoryList';
import { BrandList } from '@/pages/admin/Brands/BrandList';
import { BrandAddEdit } from '@/pages/admin/Brands/BrandAddEdit';
import { SliderList } from '@/pages/admin/Banners/SliderList';
import { SliderAddEdit } from '@/pages/admin/Banners/SliderAddEdit';
import { CouponList } from '@/pages/admin/Coupons/CouponList';
import { AddCoupon } from '@/pages/admin/Coupons/AddCoupon';
import { NotFound } from '@/pages/NotFound';
import { AdminProfile } from '@/pages/admin/Profile/AdminProfile';
import Profile from '@/pages/client/Profile/Profile';
import { ProductList } from '@/pages/admin/Products/ProductList';
import { ProductDetail } from '@/pages/client/Product/ProductDetail';
import { Products } from '@/pages/client/Product/Products';
import { Wishlist } from '@/pages/client/Wishlist/Wishlist';
import { Cart } from '@/pages/client/Cart/Cart';
import { Checkout } from '@/pages/client/Checkout/Checkout';
import { PaymentResult } from '@/pages/client/Checkout/PaymentResult';
import { OrderList } from '@/pages/admin/Orders/OrderList';
import { Addresses } from '@/pages/client/Address/Addresses';
import { BlogList } from '@/pages/client/Blog/BlogList';
import { BlogDetail } from '@/pages/client/Blog/BlogDetail';
import { AdminBlogList } from '@/pages/admin/Blog/AdminBlogList';
import { AdminBlogAddEdit } from '@/pages/admin/Blog/AdminBlogAddEdit';
import { NotificationsPage } from '@/pages/client/Notifications/Notifications';

// Mock Page
const AdminDashboard = () => <div className="text-2xl font-bold">Tổng quan hệ thống</div>;


const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* ================= ROUTES CHO KHÁCH (CHƯA ĐĂNG NHẬP) ================= */}
          <Route element={<GuestRoute />}>
            <Route path={PATHS.LOGIN} element={<Login />} />
            <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={PATHS.REGISTER} element={<SignupPage />} />
          </Route>

          {/* ================= ROUTES CHÍNH (CÓ HEADER) ================= */}

          {/* Public Pages (Ai cũng xem được) */}
          <Route path={PATHS.HOME} element={<Home />} />
          <Route path={PATHS.PRODUCTS} element={<Products />} />
          <Route path={PATHS.PRODUCT_DETAIL} element={<ProductDetail />} />
          <Route path={PATHS.COLLECTION} element={<Products />} />
          <Route path={PATHS.BLOG} element={<BlogList />} />
          <Route path={PATHS.BLOG_DETAIL} element={<BlogDetail />} />

          {/* Private Pages (Bắt buộc Đăng nhập) */}
          <Route element={<ProtectedRoute />}>
            <Route path={PATHS.PROFILE} element={<Profile />} />
            <Route path={PATHS.CHECKOUT} element={<Checkout />} />
            <Route path={PATHS.PAYMENT_RESULT} element={<PaymentResult />} />
            <Route path={PATHS.WISHLIST} element={<Wishlist />} />
            <Route path={PATHS.CART} element={<Cart />} />
            <Route path={PATHS.NOTIFICATION} element={<NotificationsPage />} />
          </Route>

          
        {/* ================= 404 NOT FOUND ================= */}
        <Route path="*" element={<NotFound />} />

        </Route>

        {/* ================= KHU VỰC DÀNH CHO ADMIN / OWNER ================= */}
        {/* Bọc bằng AdminRoute để kiểm tra quyền trước */}
        <Route path={PATHS.ADMIN} element={<AdminRoute />}>
          
          {/* Nếu pass quyền, render cái AdminLayout (Sidebar + Header) */}
          <Route element={<AdminLayout />}>
            {/* Các trang con sẽ được render vào thẻ <Outlet /> bên trong AdminLayout */}
            <Route index element={<AdminDashboard />} />                     {/* path: /admin */}
            <Route path={PATHS.ADMIN_PROFILE} element={<AdminProfile />} />
            <Route path={PATHS.ADMIN_BRANDS} element={<BrandList />} />                {/* path: /admin/brands */}
            <Route path={PATHS.ADMIN_BRANDS_ADD} element={<BrandAddEdit />} />                {/* path: /admin/brands/add */}
            <Route path={PATHS.ADMIN_BRANDS_EDIT} element={<BrandAddEdit />} />                {/* path: /admin/brands/edit/:brandId */}

            <Route path={PATHS.ADMIN_CATEGORIES} element={<CategoryList />} />        {/* path: /admin/categories */}
            <Route path={PATHS.ADMIN_ADD_CATEGORIES} element={<AddCategory />} />        {/* path: /admin/add-categories */}
            <Route path={PATHS.ADMIN_EDIT_CATEGORIES} element={<EditCategory />} />      {/* path: /admin/edit-categories/:categoryId */}

            <Route path={PATHS.ADMIN_BANNERS} element={<SliderList />} />       {/* path: /admin/banners */}
            <Route path={PATHS.ADMIN_BANNERS_ADD} element={<SliderAddEdit />} />       {/* path: /admin/banners/add */}
            <Route path={PATHS.ADMIN_BANNERS_EDIT} element={<SliderAddEdit />} />       {/* path: /admin/banners/edit/:sliderId */}

            <Route path={PATHS.ADMIN_ORDERS} element={<OrderList />} />
            <Route path={PATHS.ADMIN_PRODUCTS} element={<ProductList />} />
            
            <Route path={PATHS.ADMIN_COUPONS} element={<CouponList />} />
            <Route path={PATHS.ADMIN_COUPONS_ADD} element={<AddCoupon />} />

            <Route path={PATHS.ADMIN_BLOG} element={<AdminBlogList />} />
            <Route path={PATHS.ADMIN_BLOG_ADD} element={<AdminBlogAddEdit />} />
            <Route path={PATHS.ADMIN_BLOG_EDIT} element={<AdminBlogAddEdit />} />
            {/* <Route path={PATHS.ADMIN_PRODUCTS_ADD} element={<ProductFormModal />} />
            <Route path={PATHS.ADMIN_PRODUCTS_EDIT} element={<ProductFormModal />} /> */}

            <Route path="*" element={<NotFound />} />
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;