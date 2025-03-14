// components/layout/Header.js
import React, { useContext, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon, UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../contexts/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

const Header = ({ isMobile, sidebarOpen, setSidebarOpen }) => {
  const { user, signOut } = useContext(AuthContext);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Mobile menu button and Logo */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                type="button"
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
                {sidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            )}
            
            {/* Logo with improved contrast */}
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="h-8 w-8 relative">
                <Image 
                  src="/icons/logo.svg" 
                  alt="Tempu Task Logo" 
                  width={32} 
                  height={32} 
                  priority
                  className="rounded-full dark:brightness-125"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tempu Task
              </span>
            </Link>
          </div>
          
          {/* Center: Quick actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* These could be quick action buttons instead of navigation */}
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
              <BellIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Right side: Theme toggle and user menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <UserCircleIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden md:block font-medium truncate max-w-[120px]">
                    {user.email}
                  </span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                    <Link href="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;