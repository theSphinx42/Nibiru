import React, { useState } from 'react';
import { ReactNode } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Footer from './Footer';
import Starfield from './Starfield';
import QuantumScore from './QuantumScore';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { Logo } from './Logo';
import { LoadingScreen } from './LoadingScreen';
import CartIcon from './CartIcon';
import BackgroundMusic from './BackgroundMusic';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showQuantumScore?: boolean;
  className?: string;
  loading?: boolean;
  loadingText?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Nibiru Platform',
  description = 'Quantum-coded marketplace for digital services',
  showQuantumScore = true,
  className = '',
  loading = false,
  loadingText,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    // Navigate to home page after logout if desired
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Loading Screen */}
      <LoadingScreen isLoading={loading} text={loadingText} />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Starfield />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3">
                <Logo size={32} variant="full" />
              </Link>

              <nav className="flex items-center space-x-8">
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/marketplace"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Marketplace
                </Link>
                <CartIcon />
                
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button 
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="text-white" />
                        )}
                      </div>
                      <span>{user.displayName || user.name || user.username || 'User'}</span>
                      <FiChevronDown className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                          Profile
                        </Link>
                        <Link href="/dashboard/my-items" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                          My Items
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <div className="flex items-center">
                            <FiLogOut className="mr-2" />
                            Logout
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/login"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`container mx-auto px-4 py-8 pt-24 pb-40 ${className}`}>
          {children}
        </main>

        {/* Quantum Score */}
        {showQuantumScore && user && (
          <QuantumScore score={user.quantumScore} />
        )}

        {/* Footer */}
        <Footer />

        {/* Dev Controls - Moved to bottom */}
        {/* 
        <div className="fixed bottom-0 left-0 z-[100] w-full bg-gray-900/80 backdrop-blur-sm border-t border-gray-800/50">
          <DevNav />
        </div>
        */}
      </div>
      <BackgroundMusic />
    </div>
  );
};

export default Layout; 