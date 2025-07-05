import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin as MapPinIcon,
} from 'lucide-react';
import logo from '../assets/logo.png';

/**
 * Footer Component
 * 
 * A reusable footer component that displays:
 * - Company information and logo
 * - Social media links
 * - Quick navigation links
 * - Contact information
 * - Copyright and legal links
 * 
 * Usage:
 * <Footer />
 * <Footer className="custom-class" />
 */

const Footer = ({ className = '' }) => {
  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: '#', label: 'Facebook' },
    { icon: <Twitter className="h-5 w-5" />, href: '#', label: 'Twitter' },
    { icon: <Instagram className="h-5 w-5" />, href: '#', label: 'Instagram' },
    { icon: <Linkedin className="h-5 w-5" />, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className={`bg-primary text-white ${className}`}>
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={logo} 
                alt="SoloDesk Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-2xl font-bold">SoloDesk</span>
            </div>
            <p className="text-white/80 mb-6 max-w-md">
              Smart workspace management solutions for modern organizations. 
              Transform how you manage desks, track usage, and optimize your workspace.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-white/80 hover:text-accent transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-white/80 hover:text-accent transition-colors">Pricing</Link></li>
              <li><Link to="/about" className="text-white/80 hover:text-accent transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-accent" />
                <span className="text-white/80">hello@solodesk.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-accent" />
                <span className="text-white/80">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-accent" />
                <span className="text-white/80">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            © 2024 SoloDesk. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-white/60 hover:text-accent transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/60 hover:text-accent transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-white/60 hover:text-accent transition-colors text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 