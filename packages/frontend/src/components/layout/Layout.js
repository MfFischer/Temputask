// components/layout/Layout.js
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@supabase/auth-helpers-react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import DistractionPromptModal from '../DistractionPromptModal';

const Layout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Redirect to homepage when user logs out
  useEffect(() => {
    if (!user && !pathname?.includes('/login') && !pathname?.includes('/signup') && pathname !== '/') {
      router.push('/');
    }
  }, [user, pathname, router]);
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);
  
  // Determine if we're on an auth page
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup');
  const isHomePage = pathname === '/';
  
  // Simple layout for auth pages and homepage when not logged in
  if (isAuthPage || (isHomePage && !user)) {
    return <main className="min-h-screen">{children}</main>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="flex flex-1">
        {/* Sidebar for authenticated users */}
        {user && (
          <Sidebar
            isMobile={isMobile}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
        )}
        
        {/* Main content area with proper spacing - using app-content class */}
        <main className={`app-content flex-1 transition-all duration-300 pt-16 ${
          user && !isMobile ? 'md:ml-64' : 'w-full'
        }`}>
          <div className="main-container px-4 py-6 flex-grow">
            {children}
          </div>
        </main>
      </div>
      
      {/* Full-width footer with proper sidebar clearance */}
      <div className={`w-full ${user && !isMobile ? 'md:ml-64' : ''}`}>
        <Footer />
      </div>
      
      {/* Global distraction prompt */}
      <DistractionPromptModal />
    </div>
  );
};

export default Layout;