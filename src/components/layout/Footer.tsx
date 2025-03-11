// src/components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </span>
          </div>
          
          <div className="flex space-x-6">
            <Link href="/privacy" legacyBehavior>
              <a className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms" legacyBehavior>
              <a className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                Terms of Service
              </a>
            </Link>
            <Link href="/help" legacyBehavior>
              <a className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                Help & Support
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;