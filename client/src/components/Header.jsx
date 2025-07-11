import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import logo from '../assets/logo.png';
import { 
  X, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Clock,
  Bell
} from 'lucide-react';


const Header = ({ className = '' }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const profileDropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToFeatures = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      window.location.href = '/#features';
    } else {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
  };

  // Dashboard navigation items
  const dashboardItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: 'text-blue-400' },
    { icon: Calendar, label: 'Calendar', href: '/calendar', color: 'text-green-400' },
    { icon: Users, label: 'Clients', href: '/clients', color: 'text-purple-400' },
    { icon: FileText, label: 'Projects', href: '/projects', color: 'text-orange-400' },
    { icon: Clock, label: 'Time Tracking', href: '/time-tracking', color: 'text-red-400' },
    { icon: CreditCard, label: 'Invoices', href: '/invoices', color: 'text-emerald-400' },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-gradient-to-r from-[#210B2C]/95 to-[#210B2C]/90 backdrop-blur-xl border-b border-[#BC96E6]/20 shadow-lg ${className}`}>
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Far Left */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group" 
            onClick={closeMobileMenu}
          >
            <div className="relative">
              <img 
                src={logo} 
                alt="SoloDesk Logo" 
                className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#FFD166]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="text-xl font-bold text-white group-hover:text-[#FFD166] transition-colors duration-300">
              SoloDesk
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center justify-center flex-1 space-x-6">
            <Link 
              to="/" 
              className="text-white/90 hover:text-[#FFD166] transition-all duration-300 text-sm font-medium group hover:drop-shadow-[0_0_10px_rgba(255,209,102,0.5)]"
            >
              Home
            </Link>
            <button 
              onClick={scrollToFeatures} 
              className="text-white/70 hover:text-[#FFD166] transition-all duration-300 text-sm group hover:drop-shadow-[0_0_10px_rgba(255,209,102,0.5)]"
            >
              Features
            </button>
            <Link 
              to="/about" 
              className="text-white/70 hover:text-[#FFD166] transition-all duration-300 text-sm group hover:drop-shadow-[0_0_10px_rgba(255,209,102,0.5)]"
            >
              About
            </Link>
          </nav>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  >
                    <Bell className="h-5 w-5 text-white/80 group-hover:text-[#FFD166] transition-colors duration-300" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#210B2C] to-[#210B2C]/90">
                        <h3 className="text-white font-semibold flex items-center">
                          <Bell className="h-4 w-4 mr-2" />
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto bg-white">
                        <div className="p-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100">
                          <div className="flex items-start space-x-3">
                            <div className="h-2 w-2 bg-[#FFD166] rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-gray-900 text-sm font-medium">Welcome to SoloDesk!</p>
                              <p className="text-gray-600 text-sm mt-1">Complete your onboarding to get started with your freelance business.</p>
                              <p className="text-gray-400 text-xs mt-2">2 minutes ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-gray-900 text-sm font-medium">Profile Setup Complete</p>
                              <p className="text-gray-600 text-sm mt-1">Your business profile has been successfully configured.</p>
                              <p className="text-gray-400 text-xs mt-2">1 hour ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  >
                    {/* User Avatar */}
                    <div className="relative">
                      <div className="h-8 w-8 bg-gradient-to-br from-[#BC96E6] to-[#FFD166] rounded-full flex items-center justify-center text-[#210B2C] font-semibold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {getUserInitials()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-[#210B2C]"></div>
                    </div>
                    
                    {/* User Info */}
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">{getUserDisplayName()}</p>
                      <p className="text-white/60 text-xs">{user?.businessName || 'Freelancer'}</p>
                    </div>
                    
                    <ChevronDown className={`h-4 w-4 text-white/60 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                      {/* User Header */}
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#210B2C] to-[#210B2C]/90">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gradient-to-br from-[#BC96E6] to-[#FFD166] rounded-full flex items-center justify-center text-[#210B2C] font-bold text-lg shadow-lg">
                            {getUserInitials()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{getUserDisplayName()}</p>
                            <p className="text-white/80 text-sm">{user?.email}</p>
                            <p className="text-[#FFD166] text-xs font-medium">{user?.businessName || 'Freelancer'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Dashboard Access */}
                      <div className="p-4 border-b border-gray-100 bg-white">
                        <h4 className="text-gray-900 font-semibold text-sm mb-3 flex items-center">
                          <LayoutDashboard className="h-4 w-4 mr-2 text-[#210B2C]" />
                          Quick Access
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {dashboardItems.slice(0, 4).map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-gray-100"
                            >
                              <item.icon className={`h-4 w-4 ${item.color} group-hover:scale-110 transition-transform duration-200`} />
                              <span className="text-gray-700 text-xs font-medium group-hover:text-[#210B2C] transition-colors duration-200">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Profile Actions */}
                      <div className="p-2 bg-white">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                        >
                          <User className="h-4 w-4 text-gray-500 group-hover:text-[#FFD166] transition-colors duration-200" />
                          <span className="text-gray-700 font-medium group-hover:text-[#210B2C] transition-colors duration-200">Profile Settings</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                        >
                          <Settings className="h-4 w-4 text-gray-500 group-hover:text-[#FFD166] transition-colors duration-200" />
                          <span className="text-gray-700 font-medium group-hover:text-[#210B2C] transition-colors duration-200">Account Settings</span>
                        </Link>
                        
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-all duration-200 group w-full text-left"
                          >
                            <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
                            <span className="text-red-600 font-medium group-hover:text-red-700 transition-colors duration-200">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="relative text-white/70 hover:text-[#FFD166] transition-all duration-300 text-sm group"
                >
                  Sign In
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD166] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-[#FFD166] to-[#FFD166]/90 hover:from-[#FFD166]/90 hover:to-[#FFD166] text-[#210B2C] px-6 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                  asChild
                >
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
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
          <div className="md:hidden mt-4 pb-4 border-t border-white/10">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-4 mt-4">
              <Link 
                to="/" 
                className="text-white/90 hover:text-[#FFD166] transition-colors text-sm font-medium py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <button 
                onClick={(e) => { scrollToFeatures(e); closeMobileMenu(); }}
                className="text-white/70 hover:text-[#FFD166] transition-colors text-sm py-2 text-left w-full"
              >
                Features
              </button>
              <Link 
                to="/about" 
                className="text-white/70 hover:text-[#FFD166] transition-colors text-sm py-2"
                onClick={closeMobileMenu}
              >
                About
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="flex flex-col space-y-3 mt-6 pt-4 border-t border-white/10">
              {isAuthenticated ? (
                <>
                  {/* Mobile User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="h-10 w-10 bg-gradient-to-br from-[#BC96E6] to-[#FFD166] rounded-full flex items-center justify-center text-[#210B2C] font-semibold">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{getUserDisplayName()}</p>
                      <p className="text-white/60 text-sm">{user?.businessName || 'Freelancer'}</p>
                    </div>
                  </div>

                  {/* Mobile Dashboard Links */}
                  <div className="grid grid-cols-2 gap-2">
                    {dashboardItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 p-3 rounded-lg hover:bg-white/10 transition-all duration-200"
                      >
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-white/80 text-sm">{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <Link 
                    to="/profile" 
                    className="text-white/70 hover:text-[#FFD166] transition-colors text-sm py-2"
                    onClick={closeMobileMenu}
                  >
                    Profile Settings
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm py-2 text-left w-full"
                  >
                    Sign Out
                  </button>
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
                    className="bg-gradient-to-r from-[#FFD166] to-[#FFD166]/90 hover:from-[#FFD166]/90 hover:to-[#FFD166] text-[#210B2C] px-6 py-3 rounded-lg text-sm font-semibold w-full" 
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