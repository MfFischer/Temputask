// components/layout/Header.js (Updated)
import React, { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../contexts/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

const Header = ({ isMobile, sidebarOpen, setSidebarOpen }) => {
  const { user, signOut } = useContext(AuthContext);
  
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Mobile menu button */}
          {isMobile && (
            <div className="flex items-center">
              <button
                type="button"
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
                {sidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
          
          {/* Logo with improved contrast */}
          <div className="flex items-center">
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
          
          {/* Desktop navigation with better spacing */}
          <div className="hidden md:flex md:items-center md:justify-end md:flex-1">
            <nav className="flex space-x-6">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                Dashboard
              </Link>
              <Link href="/projects" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                Projects
              </Link>
              <Link href="/settings" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                Settings
              </Link>
            </nav>
          </div>
          
          {/* User menu & ThemeToggle with better alignment */}
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block font-medium">
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;