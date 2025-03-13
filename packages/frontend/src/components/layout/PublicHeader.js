// components/layout/PublicHeader.js
import Link from 'next/link';
import Image from 'next/image';

const PublicHeader = () => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with improved dark mode contrast */}
          <Link href="/" className="flex items-center space-x-2">
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

          {/* Public navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/features"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden md:block"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden md:block"
            >
              Pricing
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;