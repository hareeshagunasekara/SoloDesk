import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import Button from '../components/Button';
import logo from '../assets/logo_light.png';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CheckSquare,
  Calendar,
  FileText,
  CreditCard,
  Clock,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  BarChart3,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const SidebarLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking',
      message: 'Design Studio booked a consultation for tomorrow',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: 'Invoice #INV-2024-001 has been paid',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      type: 'project',
      title: 'Project Update',
      message: 'Website redesign project is 75% complete',
      time: '3 hours ago',
      unread: false,
    },
    {
      id: 4,
      type: 'client',
      title: 'New Client',
      message: 'TechCorp has been added as a new client',
      time: '1 day ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview of business activities',
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
      description: 'Add, edit, view, filter clients',
      current: location.pathname.startsWith('/clients'),
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'FullCalendar bookings (drag-reschedule)',
      current: location.pathname === '/calendar',
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      description: 'To-dos, reminders, auto-follow-ups',
      current: location.pathname.startsWith('/tasks'),
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
      description: 'View/send invoices, PDF export',
      current: location.pathname.startsWith('/invoices'),
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCard,
      description: 'See transactions, status, filters',
      current: location.pathname === '/payments',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Charts: earnings, top clients, trends',
      current: location.pathname === '/analytics',
    },
    {
      name: 'Auto-Messages',
      href: '/messages',
      icon: MessageSquare,
      description: 'View/edit auto-generated emails/reminders',
      current: location.pathname === '/messages',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'payment':
        return CreditCard;
      case 'project':
        return FolderOpen;
      case 'client':
        return Users;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return 'text-blue-500';
      case 'payment':
        return 'text-green-500';
      case 'project':
        return 'text-purple-500';
      case 'client':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-2xl border-r border-gray-700/30 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-700/30 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src={logo} 
                  alt="SoloDesk Logo" 
                  className="h-8 w-8 object-contain transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/40 to-gray-600/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
              </div>
              <span 
                className="text-xl font-bold bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-gray-200 group-hover:to-gray-300"
              >
                SoloDesk
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-700/50 transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto scrollbar-hide">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex flex-col px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:shadow-lg border border-transparent',
                  item.current
                    ? 'bg-gradient-to-r from-gray-700/50 to-gray-600/40 border-gray-600/30 text-gray-200 shadow-lg shadow-gray-900/20'
                    : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/20 hover:text-gray-200 hover:border-gray-600/20'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-300',
                      item.current 
                        ? 'text-gray-200' 
                        : 'text-gray-500 group-hover:text-gray-300'
                    )}
                  />
                  <span className="font-semibold">{item.name}</span>
                </div>
                <p className={cn(
                  'text-xs mt-1 ml-8 transition-colors duration-300',
                  item.current 
                    ? 'text-gray-400' 
                    : 'text-gray-500 group-hover:text-gray-400'
                )}>
                  {item.description}
                </p>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-700/30 p-4 bg-gradient-to-b from-transparent to-gray-800/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-br from-[#99a1af] via-[#6a7282] to-[#1e2939] rounded-full flex items-center justify-center text-gray-100 font-semibold shadow-lg ring-2 ring-gray-600/30 group-hover:scale-110 transition-transform duration-300">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-800 shadow-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/25 to-[#364153]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-200 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/20 hover:text-gray-200 rounded-lg transition-all duration-300 hover:shadow-md"
                onClick={() => setSidebarOpen(false)}
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/20 hover:text-gray-200 rounded-lg transition-all duration-300 hover:shadow-md"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-sm text-gray-400 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-red-800/20 hover:text-red-300 rounded-lg transition-all duration-300 hover:shadow-md"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn('lg:pl-80 transition-all duration-300', sidebarOpen && 'pl-80')}>
        {/* Top Header Bar - iOS Style */}
        <header className="sticky top-0 z-40 h-16 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-2xl border-b border-gray-700/30 shadow-2xl">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 transition-all duration-300 border border-gray-600/40 hover:border-gray-500/40 shadow-sm hover:shadow-md"
              >
                <Menu className="h-5 w-5 text-gray-300" />
              </button>
              
              {/* Logo for mobile */}
              <div className="lg:hidden flex items-center space-x-3">
                <div className="relative">
                  <div className="h-8 w-8 bg-gradient-to-br from-gray-600 via-gray-500 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                    <img 
                      src={logo} 
                      alt="SoloDesk Logo" 
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">SoloDesk</span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 transition-all duration-300 group border border-gray-600/40 hover:border-gray-500/40 shadow-sm hover:shadow-md"
                >
                  <Bell className="h-5 w-5 text-gray-300 group-hover:text-gray-200 transition-colors duration-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-lg animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-400/15 to-gray-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-gray-50/95 via-gray-100/90 to-gray-50/95 backdrop-blur-2xl border border-gray-200/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-50 overflow-hidden transition-all duration-200 ease-in-out">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-200/20 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-100 flex items-center">
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                          </h3>
                          <button className="text-xs text-gray-300 hover:text-gray-200 transition-colors duration-200">
                            Mark all as read
                          </button>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto bg-gradient-to-br from-gray-50/95 via-gray-100/90 to-gray-50/95">
                        {notifications.length > 0 ? (
                          <div className="py-2">
                            {notifications.map((notification) => {
                              const Icon = getNotificationIcon(notification.type);
                              return (
                                <div
                                  key={notification.id}
                                  className={cn(
                                    "px-4 py-3 hover:bg-gradient-to-r hover:from-gray-200/50 hover:to-gray-300/50 transition-all duration-200 cursor-pointer border-b border-gray-200/20",
                                    notification.unread && "bg-blue-50/30"
                                  )}
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className={cn(
                                      "flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center",
                                      notification.unread && "bg-blue-100"
                                    )}>
                                      <Icon className={cn("h-4 w-4", getNotificationColor(notification.type))} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                          {notification.title}
                                        </p>
                                        {notification.unread && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {notification.time}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No notifications yet</p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-gray-200/20 bg-gray-50/50">
                        <button className="w-full text-xs text-gray-700 hover:text-gray-800 transition-colors duration-200 font-medium">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-200">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-8 w-8 bg-gradient-to-br from-[#99a1af] via-[#6a7282] to-[#1e2939] rounded-full flex items-center justify-center text-sm font-semibold text-gray-100 shadow-lg ring-2 ring-gray-600/30 group-hover:scale-110 transition-transform duration-300">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-800 shadow-sm"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e2939]/25 to-[#364153]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout; 