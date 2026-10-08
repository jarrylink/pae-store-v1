'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Shield,
  Award,
  Truck,
  Headphones,
  ChevronRight
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Products', href: '/products' },
    { name: 'Accessories', href: '/accessories' },
    { name: 'Services', href: '/services' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const supportLinks = [
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns Policy', href: '/returns' },
    { name: 'Warranty', href: '/warranty' },
    { name: 'Privacy Policy', href: '/privacy' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/powerafric', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/powerafric', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/powerafric', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/powerafric', label: 'YouTube' },
    { icon: Linkedin, href: 'https://linkedin.com/company/powerafric', label: 'LinkedIn' },
  ];

  const features = [
    { icon: Truck, text: 'Fast Delivery' },
    { icon: Shield, text: 'Quality Guaranteed' },
    { icon: Award, text: 'Best Prices' },
    { icon: Headphones, text: '24/7 Support' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Features Bar - Mobile scrollable */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 overflow-x-auto pb-1 sm:pb-0">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{feature.text}</span>
                {index < features.length - 1 && (
                  <span className="hidden sm:inline text-gray-700">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Power Afric
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Your trusted partner for solar energy solutions. We provide quality solar panels, inverters, batteries, and installation services.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">B3&B4 Khalil Rahman Complex, GRA, Katsina</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-400">080 3366 6041</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-400">sales@powerafric.ng</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-400">Mon-Sat: 8AM - 6PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links - Mobile accordion style */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Stay Connected
            </h4>
            <p className="text-sm text-gray-400">
              Subscribe to get updates on new products and special offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 sm:px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-400 text-white placeholder-gray-500 min-w-[140px]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-800 hover:bg-green-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              © {currentYear} Power Afric Energy Services Ltd. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-gray-400">
              <Link href="/privacy" className="hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-green-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;