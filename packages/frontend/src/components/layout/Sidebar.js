import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  FolderIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  LightBulbIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isMobile, isOpen, setIsOpen }) => {
  const router = useRouter();
  
  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      exact: true
    },
    {
      name: 'Companies',
      href: '/companies',
      icon: BuildingOfficeIcon
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderIcon
    },
    {
      name: 'Focus Mode',
      href: '/focus',
      icon: ClockIcon
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon
    },
    {
      name: 'Insights',
      href: '/insights',
      icon: LightBulbIcon
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon
    },
  ];
  
  // Determine if a navigation item is active
  const isActive = (item) => {
    if (item.exact) {
      return router.pathname === item.href;
    }
    return router.pathname.startsWith(item.href);
  };

  // Updated sidebar classes with the violet/indigo/pink gradient theme
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-20 flex flex-col w-64 h-full pt-16
    transition-transform duration-300 ease-in-out
    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
    bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900
    border-r border-white/10 overflow-y-auto
  `;

  // Overlay for mobile view
  const overlayClasses = `
    fixed inset-0 z-10 bg-black/70 transition-opacity duration-300 ease-in-out
    ${isMobile && isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={overlayClasses}
        onClick={() => setIsOpen(false)} 
        aria-hidden="true"
      ></div>
      
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full py-6 px-4">
          {/* Navigation items */}
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const active = isActive(item);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-white/10 text-pink-200'
                      : 'text-indigo-100 hover:bg-white/5 hover:text-white'
                    }
                    relative
                  `}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0 transition-colors
                      ${active
                        ? 'text-pink-200'
                        : 'text-indigo-200/70 group-hover:text-white'
                      }
                    `}
                  />
                  {item.name}
                  
                  {active && (
                    <div className="absolute right-0 w-1 h-8 bg-pink-400 rounded-l-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* App version */}
          <div className="mt-6 px-2 text-xs text-indigo-200/50">
            Tempu Task v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;