'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const whatsappNumber = "2348033666041";
const welcomeMessage = "Hello! 👋 Welcome to Power Afric. How can we help you with your solar energy needs?";

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: welcomeMessage, isUser: false, timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 300) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimizeChat = () => {
    setIsMinimized(true);
    if (!isMinimized) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleRestoreChat = () => {
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const encodedMessage = encodeURIComponent(inputMessage);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

    setInputMessage('');

    setTimeout(() => {
      const autoResponse: Message = {
        id: messages.length + 2,
        text: "Thanks for your message! Our team will respond shortly on WhatsApp. 💚",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, autoResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Button - Fixed position no overflow */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-4 right-4 z-50 group"
          aria-label="Chat on WhatsApp"
          style={{ maxWidth: 'none', width: 'auto' }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></div>
            <div className="relative bg-[#25D366] hover:bg-[#20b859] text-white rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.121 1.521 5.861L.53 23.22c-.092.361.222.675.583.583l5.36-1.002C8.08 23.657 9.994 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.935 0-3.78-.525-5.36-1.44l-3.84.72.72-3.84C2.525 15.78 2 13.935 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              </svg>
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Chat Window - Responsive width */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up" style={{ width: 'min(90vw, 380px)', maxWidth: 'calc(100vw - 32px)' }}>
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-1">
                <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.121 1.521 5.861L.53 23.22c-.092.361.222.675.583.583l5.36-1.002C8.08 23.657 9.994 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.935 0-3.78-.525-5.36-1.44l-3.84.72.72-3.84C2.525 15.78 2 13.935 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">WhatsApp Chat</h3>
                <p className="text-green-100 text-xs">Typically replies within minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isMinimized && (
                <button onClick={handleMinimizeChat} className="text-white hover:text-green-100 transition-colors p-1">
                  <Minimize2 className="w-4 h-4" />
                </button>
              )}
              {isMinimized && (
                <button onClick={handleRestoreChat} className="text-white hover:text-green-100 transition-colors p-1">
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
              <button onClick={handleCloseChat} className="text-white hover:text-green-100 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              <div className="h-80 sm:h-96 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-2 rounded-2xl break-words ${
                      message.isUser
                        ? 'bg-[#25D366] text-white rounded-br-sm'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-sm'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isUser ? 'text-green-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                  {["Solar panel pricing 💰", "Installation quote 🔧", "Technical support ⚡", "Battery options 🔋"].map((reply) => (
                    <button
                      key={reply}
                      onClick={() => {
                        setInputMessage(reply);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors whitespace-nowrap"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-3 py-2 bg-[#25D366] hover:bg-[#20b859] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  We'll respond on WhatsApp within minutes
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
