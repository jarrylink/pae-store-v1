'use client';

import React from 'react';
import { 
  Shield, 
  Truck, 
  Headphones, 
  Award, 
  Clock, 
  Wallet, 
  Zap, 
  Globe,
  CheckCircle,
  Star,
  ThumbsUp,
  Users
} from 'lucide-react';

interface Advantage {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const advantages: Advantage[] = [
  {
    id: 1,
    title: 'Premium Quality',
    description: 'High-grade materials with international certifications for lasting performance',
    icon: <Award className="w-8 h-8" />,
    color: 'from-yellow-500 to-amber-500'
  },

  {
    id: 3,
    title: '24/7 Support',
    description: 'Round-the-clock customer support and technical assistance',
    icon: <Headphones className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 4,
    title: 'Warranty',
    description: 'Comprehensive warranty coverage on all solar products',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 5,
    title: 'Fast & Free Delivery',
    description: 'Quick shipping across Katsina State and nationwide',
    icon: <Clock className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 6,
    title: 'Best Prices',
    description: 'Competitive pricing with flexible payment options',
    icon: <Wallet className="w-8 h-8" />,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 8,
    title: 'Trusted Partner',
    description: 'Over 10,000+ satisfied customers across Nigeria',
    icon: <Users className="w-8 h-8" />,
    color: 'from-indigo-500 to-purple-500'
  }
];

export default function CompetitiveAdvantage() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">Competitive Advantage</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We deliver excellence through quality products, expert service, and unwavering support
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage) => (
            <div
              key={advantage.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${advantage.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon Container */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${advantage.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {advantage.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {advantage.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {advantage.description}
              </p>
              
              {/* Decorative Line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${advantage.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">2,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Customer Satisfaction</div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            Start Your Solar Journey Today
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Free consultation • No obligation • Expert advice
          </p>
        </div>
      </div>
    </section>
  );
}
