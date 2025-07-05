import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import logo from '../assets/logo.png';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <img 
                  src={logo} 
                  alt="SoloDesk Logo" 
                  className="h-10 w-10 object-contain"
                />
              </div>
              <span className="text-2xl font-bold gradient-text">SoloDesk</span>
            </Link>
            {title && (
              <h2 className="mt-6 text-3xl font-bold text-card-foreground">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form content */}
          <div className="card p-8">
            {children}
          </div>

          {/* Footer links */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              © 2024 SoloDesk. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <Link
                to="/privacy"
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/support"
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Your Personal Freelance HQ
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Manage clients, projects, tasks, and payments—all in one beautiful dashboard designed for freelancers.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-6 mt-12 max-w-lg mx-auto">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center mx-auto">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Time Tracking</h3>
                <p className="text-sm text-white/80">Track time effortlessly</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center mx-auto">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Invoicing</h3>
                <p className="text-sm text-white/80">Professional invoices</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center mx-auto">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Client Management</h3>
                <p className="text-sm text-white/80">Organize your clients</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center mx-auto">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Calendar</h3>
                <p className="text-sm text-white/80">Schedule & bookings</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-accent/30 blur-xl" />
        <div className="absolute top-1/2 left-1/4 h-16 w-16 rounded-full bg-secondary/20 blur-lg" />
      </div>
    </div>
  );
};

export default AuthLayout; 