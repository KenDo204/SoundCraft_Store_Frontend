import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategoryTree } from '@/store/slices/category.slice';
import TopBar from './components/Header/TopBar';
import DesktopNav from './components/Header/DesktopNav';
import Logo from './components/Header/Logo';
import MobileMenu from './components/Header/MobileMenu';
import HeaderActions from './components/Header/HeaderActions';
import CategoryMegaMenu from '../../../features/categories/components';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [megaMenuSection, setMegaMenuSection] = useState('main');

  const { tree } = useAppSelector((state) => state.categories);
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleOpenMegaMenu = (section: string = 'main') => {
    setMegaMenuSection(section);
    setIsMegaMenuOpen(true);
  };

  useEffect(() => {
    if (tree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, [dispatch, tree.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="w-full flex flex-col font-sans sticky top-0 z-50">
      {/* <div className={`transition-all duration-300 overflow-hidden ${isScrolled ? 'h-0 opacity-0' : 'h-8'}`}>
        <TopBar />
      </div> */}

      <div className={`bg-[#fcfbf9] backdrop-blur-sm border-b border-stone-200 shadow-sm transition-all 
      duration-500 ease-in-out
        ${isScrolled ? 'h-16 shadow-md' : 'h-24'}
        `}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full relative">

            {/* Left: Mobile Menu Toggle & Desktop Links */}
            <div className="flex items-center flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center gap-2 p-2 -ml-2 text-stone-600 hover:text-stone-900 cursor-pointer group"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div
                onClick={() => setIsMegaMenuOpen(true)}
                className={`hidden lg:flex items-center gap-2.5 cursor-pointer group transition-all duration-500 overflow-hidden whitespace-nowrap
                  ${isScrolled ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'}
                `}
              >
                <Menu className="w-5 h-5 text-stone-800 group-hover:text-orange-700 transition-colors" />
                <span className="text-[13px] font-black tracking-[0.2em] uppercase text-stone-800 group-hover:text-orange-700 mt-0.5 transition-colors">
                  MENU
                </span>
              </div>

              <DesktopNav
                isCompact={isScrolled}
                onOpenMegaMenu={handleOpenMegaMenu}
              />
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <Logo isCompact={isScrolled} />
            </div>

            {/* Right: Actions */}
            <HeaderActions
              isCompact={isScrolled}
              user={user}
              onLoginClick={() => navigate("/login")}
            />
          </div>
        </div>
      </div>

      <CategoryMegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        categories={tree}
        initialSection={megaMenuSection}
      />

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={tree}
      />
    </header>
  );
};

export default Header;