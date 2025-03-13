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
          
          {/* Quick links */}
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
                href="mailto:support@temputaskcom" 
                className="inline-block text-pink-200 hover:text-pink-100 transition-colors text-xs md:text-sm"
              >
                support@temputaskcom
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