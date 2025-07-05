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
} from 'lucide-react';

const SidebarLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
      current: location.pathname.startsWith('/clients'),
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      current: location.pathname.startsWith('/projects'),
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      current: location.pathname.startsWith('/tasks'),
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      current: location.pathname === '/calendar',
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
      current: location.pathname.startsWith('/invoices'),
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCard,
      current: location.pathname === '/payments',
    },
    {
      name: 'Time Tracking',
      href: '/time-tracking',
      icon: Clock,
      current: location.pathname === '/time-tracking',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <img 
                  src={logo} 
                  alt="SoloDesk Logo" 
                  className="h-6 w-6 object-contain"
                />
              </div>
              <span className="text-xl font-bold gradient-text">SoloDesk</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  item.current
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    item.current ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-card-foreground'
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="client-avatar">
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
                <p className="text-sm font-medium text-card-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="mt-3 space-y-1">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-card-foreground rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-card-foreground rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-card-foreground rounded-lg transition-colors"
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
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-card border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Logo for mobile */}
              <div className="lg:hidden flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  <img 
                    src={logo} 
                    alt="SoloDesk Logo" 
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <span className="text-lg font-bold gradient-text">SoloDesk</span>
              </div>
              
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-64 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick actions */}
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                className="hidden sm:flex"
              >
                New Project
              </Button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-error rounded-full"></span>
              </button>

              {/* User menu (mobile) */}
              <div className="lg:hidden">
                <div className="client-avatar">
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
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout; 