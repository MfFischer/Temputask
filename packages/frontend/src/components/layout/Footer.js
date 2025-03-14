// components/layout/Footer.js
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-violet-900/90 border-t border-white/10 py-6 mt-auto text-white">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Branding section - full width on small mobile */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-3 space-x-2">
              <div className="h-7 w-7 relative">
                <Image 
                  src="/icons/logo.svg" 
                  alt="Tempu Task Logo" 
                  width={28} 
                  height={28}
                  className="rounded-full"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">
                Tempu Task
              </span>
            </div>
            <p className="text-indigo-100/80 text-sm leading-relaxed max-w-xs">
              Transform your productivity with intelligent time tracking and actionable insights.
            </p>
          </div>
          
          {/* Quick links - Aligned with Sidebar for consistency */}
          <div className="col-span-1">
            <h3 className="text-pink-200 font-medium mb-3 text-sm md:text-base">Quick Links</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li>
                <Link href="/" className="text-indigo-100 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-indigo-100 hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/focus" className="text-indigo-100 hover:text-white transition-colors">
                  Focus Mode
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-indigo-100 hover:text-white transition-colors">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-indigo-100 hover:text-white transition-colors">
                  Insights
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal section */}
          <div className="col-span-1">
            <h3 className="text-pink-200 font-medium mb-3 text-sm md:text-base">Legal</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li>
                <Link href="/privacy" className="text-indigo-100 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-indigo-100 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-indigo-100 hover:text-white transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact section */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-pink-200 font-medium mb-3 text-sm md:text-base">Contact</h3>
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-indigo-100">
                Questions or feedback?
              </p>
              <a 
                href="mailto:support@temputask.com"
                className="inline-block text-pink-200 hover:text-pink-100 transition-colors text-xs md:text-sm"
              >
                support@temputask.com
              </a>
            </div>
           {/* Social media icons */}
          <div className="mt-3 flex space-x-3">
            {/* X (formerly Twitter) */}
            <a href="#" className="text-indigo-100 hover:text-white">
              <span className="sr-only">X</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          </div>
        </div>
        
        {/* Copyright section */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-indigo-200/70">
            © {currentYear} Tempu Task. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;