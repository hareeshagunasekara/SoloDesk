import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { generateInitials } from '../utils/cn';
import Button from '../components/Button';
import logo from '../assets/logo.png';
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
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'sidebar lg:translate-x-0',
          sidebarOpen && 'sidebar-open'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-[#BC96E6]/20">
            <Link to="/" className="flex items-center space-x-2 group">
              <img 
                src={logo} 
                alt="SoloDesk Logo" 
                className="h-8 w-8 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(188,150,230,0.8)] group-hover:scale-110"
              />
              <span 
                className="text-xl font-bold bg-gradient-to-r from-[#BC96E6] to-[#FFD166] bg-clip-text text-transparent transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(188,150,230,0.6)] group-hover:scale-105"
                style={{ 
                  height: '64px',
                  paddingTop: '20px'
                }}
              >
                SoloDesk
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#BC96E6]/10 transition-colors duration-200"
            >
              <X className="h-5 w-5 text-[#BC96E6]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto scrollbar-hide">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex flex-col px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-lg',
                  item.current
                    ? 'bg-gradient-to-r from-[#BC96E6]/20 to-[#FFD166]/10 border border-[#BC96E6]/30 text-[#BC96E6] shadow-lg'
                    : 'text-muted-foreground hover:bg-gradient-to-r hover:from-[#210B2C]/50 hover:to-[#BC96E6]/10 hover:text-[#BC96E6] hover:border hover:border-[#BC96E6]/20'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                      item.current 
                        ? 'text-[#BC96E6]' 
                        : 'text-muted-foreground group-hover:text-[#BC96E6]'
                    )}
                  />
                  <span className="font-semibold">{item.name}</span>
                </div>
                <p className={cn(
                  'text-xs mt-1 ml-8 transition-colors duration-200',
                  item.current 
                    ? 'text-[#BC96E6]/70' 
                    : 'text-muted-foreground/60 group-hover:text-[#BC96E6]/70'
                )}>
                  {item.description}
                </p>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-[#BC96E6]/20 p-4 bg-gradient-to-b from-transparent to-[#210B2C]/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="client-avatar ring-2 ring-[#BC96E6]/30">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  generateInitials(user?.name || 'User')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#BC96E6] truncate">
                  {user?.businessName || user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground/70 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-gradient-to-r hover:from-[#210B2C]/50 hover:to-[#BC96E6]/10 hover:text-[#BC96E6] rounded-lg transition-all duration-200 hover:shadow-md"
                onClick={() => setSidebarOpen(false)}
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-gradient-to-r hover:from-[#210B2C]/50 hover:to-[#BC96E6]/10 hover:text-[#BC96E6] rounded-lg transition-all duration-200 hover:shadow-md"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-sm text-muted-foreground hover:bg-gradient-to-r hover:from-[#FFD166]/10 hover:to-[#FFD166]/5 hover:text-[#FFD166] rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn('main-content', sidebarOpen && 'main-content-sidebar-open')}>
        {/* Top Header Bar - iOS Style */}
        <header className="sticky top-0 z-50 h-16 bg-gradient-to-r from-[#210B2C]/95 to-[#210B2C]/90 backdrop-blur-xl border-b border-[#BC96E6]/20 shadow-lg">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <Menu className="h-5 w-5 text-white/80" />
              </button>
              
              {/* Logo for mobile */}
              <div className="lg:hidden flex items-center space-x-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#BC96E6] to-[#FFD166] flex items-center justify-center overflow-hidden shadow-lg">
                  <img 
                    src={logo} 
                    alt="SoloDesk Logo" 
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-white">SoloDesk</span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                >
                  <Bell className="h-5 w-5 text-white/80 group-hover:text-[#FFD166] transition-colors duration-200" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-lg animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden transition-all duration-200 ease-in-out">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#210B2C] to-[#210B2C]/90">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white flex items-center">
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                          </h3>
                          <button className="text-xs text-[#FFD166] hover:text-[#FFD166]/80 transition-colors duration-200">
                            Mark all as read
                          </button>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto bg-white">
                        {notifications.length > 0 ? (
                          <div className="py-2">
                            {notifications.map((notification) => {
                              const Icon = getNotificationIcon(notification.type);
                              return (
                                <div
                                  key={notification.id}
                                  className={cn(
                                    "px-4 py-3 hover:bg-gray-50 transition-all duration-200 cursor-pointer border-b border-gray-100",
                                    notification.unread && "bg-blue-50/50"
                                  )}
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className={cn(
                                      "flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center",
                                      notification.unread && "bg-blue-100"
                                    )}>
                                      <Icon className={cn("h-4 w-4", getNotificationColor(notification.type))} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {notification.title}
                                        </p>
                                        {notification.unread && (
                                          <div className="w-2 h-2 bg-[#FFD166] rounded-full flex-shrink-0"></div>
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
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                        <button className="w-full text-xs text-[#210B2C] hover:text-[#210B2C]/80 transition-colors duration-200 font-medium">
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
                    <p className="text-sm font-medium text-white">
                      {user?.businessName || user?.name || 'User'}
                    </p>
                    <p className="text-xs text-white/60">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#BC96E6] to-[#FFD166] flex items-center justify-center text-sm font-semibold text-[#210B2C] shadow-lg ring-2 ring-white/20">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      generateInitials(user?.name || 'User')
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout; 