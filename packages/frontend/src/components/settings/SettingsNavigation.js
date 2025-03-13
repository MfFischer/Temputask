import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const SettingsNavigation = () => {
  const router = useRouter();
  
  const navigation = [
    {
      name: 'Account',
      href: '/settings',
      exact: true,
      status: 'active'
    },
    {
      name: 'Company Profile',
      href: '/settings/company-profile',
      exact: true,
      status: 'active'
    },
    {
      name: 'Notifications',
      href: '/settings/notifications',
      exact: true,
      status: 'coming-soon'
    },
    {
      name: 'Integrations',
      href: '/settings/integrations',
      exact: true,
      status: 'coming-soon'
    },
    {
      name: 'Billing',
      href: '/settings/billing',
      exact: true,
      status: 'active'
    },
    {
      name: 'Team',
      href: '/settings/team',
      exact: true,
      status: 'coming-soon'
    }
  ];
  
  // Determine if a navigation item is active
  const isActive = (item) => {
    if (item.exact) {
      return router.pathname === item.href;
    }
    return router.pathname.startsWith(item.href);
  };
  
  return (
    <nav className="space-y-1 mb-8">
      {navigation.map((item) => {
        const active = isActive(item);
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              block px-3 py-2 rounded-md text-sm font-medium 
              ${active
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              }
              relative
            `}
          >
            <div className="flex justify-between items-center">
              {item.name}
              {item.status === 'coming-soon' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  Soon
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default SettingsNavigation;