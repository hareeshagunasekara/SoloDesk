import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * PublicLayout Component
 * 
 * A layout wrapper for public pages that includes:
 * - Header component
 * - Main content area
 * - Footer component
 * 
 * This layout is perfect for marketing pages, about pages, and other public content.
 * 
 * Usage:
 * <PublicLayout>
 *   <YourPageContent />
 * </PublicLayout>
 * 
 * <PublicLayout className="custom-class">
 *   <YourPageContent />
 * </PublicLayout>
 */

const PublicLayout = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout; 