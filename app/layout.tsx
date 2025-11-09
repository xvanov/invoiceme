'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { AuthProvider, useAuth } from '@/lib/contexts/AuthContext';

function Navigation() {
  const { isAuthenticated, logout, email } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-medium group-hover:shadow-large transition-shadow duration-200">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              InvoiceMe
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link 
              href="/customers" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-150"
            >
              Customers
            </Link>
            <Link 
              href="/invoices" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-150"
            >
              Invoices
            </Link>
            <Link 
              href="/payments" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-150"
            >
              Payments
            </Link>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">{email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                data-testid="logout-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

