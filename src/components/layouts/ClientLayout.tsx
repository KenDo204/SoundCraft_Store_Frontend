import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/common/Home/Header';
import Footer from '../common/Home/Footer';

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1">
        {/* Các trang con (Home, Cart, Product...) sẽ được render vào đây */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;