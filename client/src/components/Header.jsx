import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Button from './Button';
import logo from '../assets/logo.png';
import { 
  X, 
  Menu, 
  User, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Clock,
  Bell
} from 'lucide-react';


const Header = ({ className = '' }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationsAsRead, markAllNotificationsAsRead } = useNotifications();
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

  // Notification helper functions
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'welcome':
        return Bell;
      case 'project_due_soon':
      case 'project_overdue':
        return FileText;
      case 'task_due_soon':
      case 'task_overdue':
        return Clock;
      case 'payment_received':
        return CreditCard;
      case 'invoice_sent':
        return FileText;
      case 'client_added':
        return Users;
      case 'project_completed':
        return FileText;
      case 'task_completed':
        return Clock;
      case 'reminder':
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'welcome':
        return 'text-blue-500';
      case 'project_due_soon':
      case 'project_overdue':
        return 'text-orange-500';
      case 'task_due_soon':
      case 'task_overdue':
        return 'text-red-500';
      case 'payment_received':
        return 'text-green-500';
      case 'invoice_sent':
        return 'text-blue-500';
      case 'client_added':
        return 'text-purple-500';
      case 'project_completed':
        return 'text-green-500';
      case 'task_completed':
        return 'text-green-500';
      case 'reminder':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Dashboard navigation items
  const dashboardItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: 'text-gray-600' },
    { icon: Users, label: 'Clients', href: '/clients', color: 'text-gray-600' },
    { icon: FileText, label: 'Projects', href: '/projects', color: 'text-gray-600' },
    { icon: CreditCard, label: 'Invoices', href: '/invoices', color: 'text-gray-600' },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-gradient-to-r from-[#f9fafb]/90 via-[#f3f4f6]/85 to-[#f9fafb]/90 backdrop-blur-3xl border-b border-[#e5e7eb]/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] h-16 ${className}`}>
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo - Far Left */}
        <Link 
          to="/" 
          className="flex items-center space-x-3 group flex-shrink-0" 
          onClick={closeMobileMenu}
        >
          <div className="relative">
            <img 
              src={logo} 
              alt="SoloDesk Logo" 
              className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/40 to-[#364153]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#1e2939] to-[#364153] bg-clip-text text-transparent group-hover:from-[#99a1af] group-hover:to-[#6a7282] transition-all duration-300">
            SoloDesk
          </span>
        </Link>

        {/* Navigation - Desktop - Centered */}
        <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-8">
          <Link 
            to="/" 
            className="relative text-[#1e2939] hover:text-[#364153] transition-all duration-300 text-sm font-medium group"
          >
            Home
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/20 to-[#364153]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </Link>
          <button 
            onClick={scrollToFeatures} 
            className="relative text-[#1e2939]/80 hover:text-[#364153] transition-all duration-300 text-sm group"
          >
            Features
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/20 to-[#364153]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </button>
          <Link 
            to="/about" 
            className="relative text-[#1e2939]/80 hover:text-[#364153] transition-all duration-300 text-sm group"
          >
            About
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/20 to-[#364153]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </Link>
        </nav>

        {/* Actions - Desktop - Far Right */}
        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[#1e2939]/10 hover:to-[#364153]/10 transition-all duration-300 group border border-[#e5e7eb]/40 hover:border-[#1e2939]/30 shadow-sm hover:shadow-md"
                >
                  <Bell className="h-5 w-5 text-[#1e2939] group-hover:text-[#364153] transition-colors duration-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-lg animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/15 to-[#364153]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </button>
                
                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-[#f9fafb]/95 via-[#f3f4f6]/90 to-[#f9fafb]/95 backdrop-blur-2xl border border-[#e5e7eb]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
                    <div className="p-4 border-b border-[#e5e7eb]/20 bg-gradient-to-r from-[#1e2939] via-[#364153] to-[#1e2939]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[#f9fafb] font-semibold flex items-center">
                          <Bell className="h-4 w-4 mr-2" />
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => {
                              markAllNotificationsAsRead();
                              setIsNotificationsOpen(false);
                            }}
                            className="text-xs text-[#f9fafb]/80 hover:text-[#f9fafb] transition-colors duration-200"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto bg-gradient-to-br from-[#f9fafb]/95 via-[#f3f4f6]/90 to-[#f9fafb]/95">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const Icon = getNotificationIcon(notification.type);
                          return (
                            <div
                              key={notification._id}
                              onClick={() => {
                                if (!notification.isRead) {
                                  markNotificationsAsRead([notification._id]);
                                }
                                setIsNotificationsOpen(false);
                              }}
                              className="p-4 hover:bg-gradient-to-r hover:from-[#1e2939]/5 hover:to-[#364153]/5 transition-colors duration-200 border-b border-[#e5e7eb]/20 cursor-pointer"
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ${!notification.isRead && "bg-blue-100"}`}>
                                  <Icon className={`h-4 w-4 ${getNotificationColor(notification.type)}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-[#1e2939] text-sm font-medium truncate">
                                      {notification.title}
                                    </p>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-[#1e2939]/80 text-sm mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-[#6a7282] text-xs mt-2">
                                    {notification.timeAgo}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[#1e2939]/10 hover:to-[#364153]/10 transition-all duration-300 group border border-[#e5e7eb]/40 hover:border-[#1e2939]/30 shadow-sm hover:shadow-md"
                >
                  {/* User Avatar */}
                  <div className="relative">
                    <div className="h-8 w-8 bg-gradient-to-br from-[#99a1af] via-[#6a7282] to-[#1e2939] rounded-full flex items-center justify-center text-[#f9fafb] font-semibold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {getUserInitials()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-[#f9fafb] shadow-sm"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/25 to-[#364153]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </div>
                  
                  {/* User Info */}
                  <div className="text-left">
                    <p className="text-[#1e2939] font-medium text-sm">{getUserDisplayName()}</p>
                    <p className="text-[#6a7282] text-xs">{user?.businessName || 'Freelancer'}</p>
                  </div>
                  
                  <ChevronDown className={`h-4 w-4 text-[#6a7282] transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-[#f9fafb]/95 via-[#f3f4f6]/90 to-[#f9fafb]/95 backdrop-blur-2xl border border-[#e5e7eb]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
                    {/* User Header */}
                    <div className="p-4 border-b border-[#e5e7eb]/20 bg-gradient-to-r from-[#1e2939] via-[#364153] to-[#1e2939]">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-[#99a1af] via-[#6a7282] to-[#1e2939] rounded-full flex items-center justify-center text-[#f9fafb] font-bold text-lg shadow-lg">
                          {getUserInitials()}
                        </div>
                        <div>
                          <p className="text-[#f9fafb] font-semibold">{getUserDisplayName()}</p>
                          <p className="text-[#f9fafb]/80 text-sm">{user?.email}</p>
                          <p className="text-[#99a1af] text-xs font-medium">{user?.businessName || 'Freelancer'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Dashboard Access */}
                    <div className="p-4 border-b border-gray-200/20 bg-gradient-to-br from-gray-50/95 via-gray-100/90 to-gray-50/95">
                      <h4 className="text-gray-800 font-semibold text-sm mb-3 flex items-center">
                        <LayoutDashboard className="h-4 w-4 mr-2 text-gray-600" />
                        Quick Access
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {dashboardItems.slice(0, 4).map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-200/50 hover:to-gray-300/50 transition-all duration-200 group border border-gray-200/30 hover:border-gray-400/40 shadow-sm hover:shadow-md backdrop-blur-sm"
                          >
                            <div className="relative">
                              <item.icon className={`h-4 w-4 ${item.color} group-hover:text-gray-800 transition-all duration-200`} />
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
                            </div>
                            <span className="text-gray-700 text-xs font-medium group-hover:text-gray-900 transition-colors duration-200">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Profile Actions */}
                    <div className="p-2 bg-gradient-to-br from-[#f9fafb]/95 via-[#f3f4f6]/90 to-[#f9fafb]/95">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-[#1e2939]/5 hover:to-[#364153]/5 transition-all duration-200 group"
                      >
                        <User className="h-4 w-4 text-[#6a7282] group-hover:text-[#1e2939] transition-colors duration-200" />
                        <span className="text-[#1e2939] font-medium group-hover:text-[#1e2939] transition-colors duration-200">Profile Settings</span>
                      </Link>
                      
                      <div className="border-t border-[#e5e7eb]/20 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-900/10 hover:to-red-800/10 transition-all duration-200 group w-full text-left border border-transparent hover:border-red-300/30"
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
                className="relative text-[#1e2939]/80 hover:text-[#364153] transition-all duration-300 text-sm group"
              >
                Sign In
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/20 to-[#364153]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </Link>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-[#99a1af] via-[#6a7282] to-[#99a1af] hover:from-[#6a7282] hover:via-[#99a1af] hover:to-[#6a7282] text-[#f9fafb] px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-[#99a1af]/20 hover:border-[#6a7282]/30" 
                asChild
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="relative md:hidden p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[#1e2939]/10 hover:to-[#364153]/10 transition-all duration-300 border border-[#e5e7eb]/40 hover:border-[#1e2939]/30 shadow-sm hover:shadow-md"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-[#1e2939]" />
          ) : (
            <Menu className="h-5 w-5 text-[#1e2939]" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-lg animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Menu - Fixed Position */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-[#f9fafb]/95 via-[#f3f4f6]/90 to-[#f9fafb]/95 backdrop-blur-2xl border-b border-[#e5e7eb]/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="relative text-[#1e2939] hover:text-[#364153] transition-colors text-sm font-medium py-2 group"
                onClick={closeMobileMenu}
              >
                Home
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/20 to-[#364153]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </Link>
              <button 
                onClick={(e) => { scrollToFeatures(e); closeMobileMenu(); }}
                className="relative text-[#1e2939]/80 hover:text-[#364153] transition-colors text-sm py-2 text-left w-full group"
              >
                Features
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/20 to-[#364153]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </button>
              <Link 
                to="/about" 
                className="relative text-[#1e2939]/80 hover:text-[#364153] transition-colors text-sm py-2 group"
                onClick={closeMobileMenu}
              >
                About
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/20 to-[#364153]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="flex flex-col space-y-3 mt-6 pt-4 border-t border-[#e5e7eb]/20">
              {isAuthenticated ? (
                <>
                  {/* Mobile User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#1e2939]/5 to-[#364153]/5 rounded-xl border border-[#e5e7eb]/30 shadow-sm">
                    <div className="h-10 w-10 bg-gradient-to-br from-[#99a1af] via-[#6a7282] to-[#1e2939] rounded-full flex items-center justify-center text-[#f9fafb] font-semibold">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-[#1e2939] font-medium">{getUserDisplayName()}</p>
                      <p className="text-[#6a7282] text-sm">{user?.businessName || 'Freelancer'}</p>
                    </div>
                  </div>

                  {/* Mobile Dashboard Links */}
                  <div className="grid grid-cols-2 gap-2">
                    {dashboardItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-200/50 hover:to-gray-300/50 transition-all duration-200 border border-gray-200/30 hover:border-gray-400/40 shadow-sm hover:shadow-md backdrop-blur-sm"
                      >
                        <div className="relative">
                          <item.icon className={`h-4 w-4 ${item.color} group-hover:text-gray-800 transition-all duration-200`} />
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
                        </div>
                        <span className="text-gray-700 text-sm group-hover:text-gray-900 transition-colors duration-200">{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <Link 
                    to="/profile" 
                    className="relative text-[#1e2939]/80 hover:text-[#364153] transition-colors text-sm py-2 group"
                    onClick={closeMobileMenu}
                  >
                    Profile Settings
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/20 to-[#364153]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="relative text-red-500 hover:text-red-600 transition-colors text-sm py-2 text-left w-full group"
                  >
                    Sign Out
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-red-800/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="relative text-[#1e2939]/80 hover:text-[#364153] transition-colors text-sm py-2 group"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/20 to-[#364153]/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </Link>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-[#99a1af] via-[#6a7282] to-[#99a1af] hover:from-[#6a7282] hover:via-[#99a1af] hover:to-[#6a7282] text-[#f9fafb] px-6 py-3 rounded-xl text-sm font-semibold w-full border border-[#99a1af]/20 hover:border-[#6a7282]/30 shadow-lg hover:shadow-xl" 
                    asChild
                    onClick={closeMobileMenu}
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 