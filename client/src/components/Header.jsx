import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import logo from '../assets/logo.png';
import { X, Menu } from 'lucide-react';

/**
 * Header Component
 * 
 * A reusable header component that displays:
 * - Logo and brand name
 * - Navigation links (Home, Features, About)
 * - Authentication-aware navigation (Login/Register vs Dashboard)
 * - Mobile menu button (for future mobile menu implementation)
 * 
 * Usage:
 * <Header />
 * <Header className="custom-class" />
 */

const Header = ({ className = '' }) => {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 bg-[#210B2C]/90 backdrop-blur-xl border-b border-[#BC96E6]/20 ${className}`}>
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Far Left */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <img 
              src={logo} 
              alt="SoloDesk Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-semibold text-white">SoloDesk</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white/90 hover:text-[#FFD166] transition-colors text-sm font-medium">
              Home
            </Link>
            <Link to="/features" className="text-white/70 hover:text-[#FFD166] transition-colors text-sm">
              Features
            </Link>
            <Link to="/about" className="text-white/70 hover:text-[#FFD166] transition-colors text-sm">
              About
            </Link>
          </nav>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white/70 hover:text-[#FFD166] transition-colors text-sm">
                  Dashboard
                </Link>
                <Button size="sm" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#210B2C] px-4 py-2 rounded-lg text-sm font-medium" asChild>
                  <Link to="/dashboard">Go to App</Link>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white/70 hover:text-[#FFD166] transition-colors text-sm">
                  Sign In
                </Link>
                <Button size="sm" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#210B2C] px-4 py-2 rounded-lg text-sm font-medium" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-[#BC96E6]/10 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-white/80" />
            ) : (
              <Menu className="h-5 w-5 text-white/80" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[#BC96E6]/20">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-4 mt-4">
              <Link 
                to="/" 
                className="text-white/90 hover:text-[#FFD166] transition-colors text-sm font-medium py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className="text-white/70 hover:text-[#FFD166] transition-colors text-sm py-2"
                onClick={closeMobileMenu}
              >
                Features
              </Link>
              <Link 
                to="/about" 
                className="text-white/70 hover:text-[#FFD166] transition-colors text-sm py-2"
                onClick={closeMobileMenu}
              >
                About
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="flex flex-col space-y-3 mt-6 pt-4 border-t border-[#BC96E6]/20">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-white/70 hover:text-[#FFD166] transition-colors text-sm py-2"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Button 
                    size="sm" 
                    className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#210B2C] px-4 py-3 rounded-lg text-sm font-medium w-full" 
                    asChild
                    onClick={closeMobileMenu}
                  >
                    <Link to="/dashboard">Go to App</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white/70 hover:text-[#FFD166] transition-colors text-sm py-2"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Button 
                    size="sm" 
                    className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#210B2C] px-4 py-3 rounded-lg text-sm font-medium w-full" 
                    asChild
                    onClick={closeMobileMenu}
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 