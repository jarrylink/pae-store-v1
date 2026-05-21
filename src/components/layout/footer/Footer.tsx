'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Facebook, Twitter, Linkedin, Instagram, Youtube, 
  Mail, Phone, MapPin, Clock, Award, Shield, 
  Truck, Headphones, Zap, Sun, Battery, Wrench,
  ChevronRight, Send, Users, Briefcase, GraduationCap
} from 'lucide-react';

export default function Footer() {
  const [installationEmail, setInstallationEmail] = useState('');
  const [affiliateEmail, setAffiliateEmail] = useState('');
  const [trainingEmail, setTrainingEmail] = useState('');
  const [formStatus, setFormStatus] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (type: string, email: string, setEmail: any) => {
    if (!email) {
      setFormStatus({ ...formStatus, [type]: 'Please enter your email' });
      return;
    }
    
    setFormStatus({ ...formStatus, [type]: 'sending' });
    
    // Simulate API call - replace with actual API endpoint
    setTimeout(() => {
      setFormStatus({ ...formStatus, [type]: 'success' });
      setEmail('');
      setTimeout(() => {
        setFormStatus({ ...formStatus, [type]: '' });
      }, 3000);
    }, 1000);
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Main Footer with Registration Forms */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Join Installation Network */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Wrench className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Installation Network</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Join our network of certified solar installers. Get access to exclusive projects, training, and technical support.
              </p>
              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Access to installation jobs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Technical training & certification</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Priority support & tools</span>
                </li>
              </ul>
              <div className="flex gap-2 mt-4">
                <input
                  type="email"
                  value={installationEmail}
                  onChange={(e) => setInstallationEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleSubmit('installation', installationEmail, setInstallationEmail)}
                  disabled={formStatus.installation === 'sending'}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {formStatus.installation === 'sending' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Join
                </button>
              </div>
              {formStatus.installation === 'success' && (
                <p className="text-green-400 text-sm mt-2">✓ Thanks for joining! We'll contact you soon.</p>
              )}
            </div>

            {/* Join Affiliate Program */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Affiliate Program</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Earn commissions by referring customers to Power Afric. Join our affiliate network and start earning today.
              </p>
              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Up to 10% commission on sales</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Monthly payouts & bonuses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Marketing materials provided</span>
                </li>
              </ul>
              <div className="flex gap-2 mt-4">
                <input
                  type="email"
                  value={affiliateEmail}
                  onChange={(e) => setAffiliateEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleSubmit('affiliate', affiliateEmail, setAffiliateEmail)}
                  disabled={formStatus.affiliate === 'sending'}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {formStatus.affiliate === 'sending' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Join
                </button>
              </div>
              {formStatus.affiliate === 'success' && (
                <p className="text-green-400 text-sm mt-2">✓ Thanks for your interest! We'll send you details.</p>
              )}
            </div>

            {/* Training & Workshop */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Training & Workshop</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Enhance your skills with our professional solar training programs. From basic to advanced levels.
              </p>
              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Hands-on practical training</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Industry-recognized certificate</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Job placement assistance</span>
                </li>
              </ul>
              <div className="flex gap-2 mt-4">
                <input
                  type="email"
                  value={trainingEmail}
                  onChange={(e) => setTrainingEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => handleSubmit('training', trainingEmail, setTrainingEmail)}
                  disabled={formStatus.training === 'sending'}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {formStatus.training === 'sending' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Register
                </button>
              </div>
              {formStatus.training === 'success' && (
                <p className="text-green-400 text-sm mt-2">✓ Registration received! Check your email for details.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Footer - Company Info */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Power Afric</h3>
              <p className="text-gray-400 text-sm mb-4">
                Nigeria's most trusted supplier of premium solar solutions, providing sustainable energy across the nation.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="https://powerafric.ng/about" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">About Us <ChevronRight className="w-3 h-3" /></Link></li>
                <li><Link href="/products" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">Products <ChevronRight className="w-3 h-3" /></Link></li>
                <li><Link href="https://powerafric.ng/services" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">Services <ChevronRight className="w-3 h-3" /></Link></li>
                <li><Link href="https://powerafric.ng/blog" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">Blog <ChevronRight className="w-3 h-3" /></Link></li>
                <li><Link href="https://powerafric.ng/careers" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">Careers <ChevronRight className="w-3 h-3" /></Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm">Shop B3&B4 Khalilurrahman Plaza, Hajj Camp Roundabout, GRA, Katsina</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 text-sm">+234 803 366 6041</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 text-sm">info@powerafric.ng</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 text-sm">Mon-Fri: 9am - 6pm</span>
                </li>
              </ul>
            </div>

            {/* Energy Advisory & Consultancy */}
            <div className="bg-gradient-to-br from-blue-600/10 to-green-600/10 rounded-xl p-5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-white font-bold text-lg">Energy Advisory</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Get expert guidance on solar energy solutions tailored to your needs.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <Check className="w-3 h-3 text-green-400" />
                  Free energy assessment
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <Check className="w-3 h-3 text-green-400" />
                  Custom system design
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <Check className="w-3 h-3 text-green-400" />
                  ROI & savings calculation
                </li>

              </ul>
              <button className="mt-4 w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                Book Consultation →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Power Afric. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper component for checkmark (since Check wasn't imported)
const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);
