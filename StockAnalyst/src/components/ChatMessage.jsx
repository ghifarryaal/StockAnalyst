import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Sparkles } from 'lucide-react';

const ChatMessage = ({ role, content }) => {
  const isAi = role === 'assistant';
  const safeContent = content || '';
  const normalizedContent = safeContent
    .replace(/undefined/gi, '')
    .replace(/null/gi, '')
    .trim();
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // Final safeguard to remove any undefined text
  const finalContent = (displayedContent || '')
    .replace(/undefined/gi, '')
    .replace(/null/gi, '')
    .trim();

  // Typing animation effect for AI messages
  useEffect(() => {
    if (!isAi) {
      setDisplayedContent(normalizedContent);
      setIsTyping(false);
      return;
    }

    if (!normalizedContent || normalizedContent.includes('📊 Menganalisis') || normalizedContent.includes('⚠️') || normalizedContent.includes('❌')) {
      setDisplayedContent(normalizedContent);
      setIsTyping(false);
      return;
    }

    setDisplayedContent('');
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < normalizedContent.length) {
        setDisplayedContent(prev => prev + normalizedContent[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [normalizedContent, isAi]);

  return (
    <div className={`w-full py-8 ${isAi ? 'bg-transparent' : 'bg-gray-800/20 backdrop-blur-sm'} animate-fadeIn`}>
      <div className="max-w-3xl mx-auto flex gap-6 px-4">

        {/* AVATAR */}
        <div className="shrink-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isAi
                ? 'bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-500 text-white animate-pulse-slow hover:scale-110'
                : 'bg-gradient-to-br from-gray-700 to-gray-600 text-gray-200 hover:scale-105'
            } ring-2 ring-offset-2 ring-offset-transparent ${
              isAi ? 'ring-blue-500/50 hover:ring-purple-500/70' : 'ring-gray-600/50'
            }`}
            style={isAi ? { boxShadow: '0 0 25px rgba(59, 130, 246, 0.4), 0 0 50px rgba(139, 92, 246, 0.2)' } : {}}
          >
            {isAi ? (
              <div className="relative">
                <Bot size={20} />
                {isTyping && (
                  <Sparkles size={10} className="absolute -top-1 -right-1 animate-spin" />
                )}
              </div>
            ) : (
              <User size={20} />
            )}
          </div>
        </div>

        {/* MESSAGE */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">
              {isAi ? 'Stock Analyst AI' : 'You'}
            </p>
            {isAi && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full">
                AI
              </span>
            )}
            {isTyping && isAi && (
              <span className="text-xs text-gray-500 animate-pulse">typing...</span>
            )}
          </div>

          {/* CARD CONTAINER UNTUK AI */}
          <div
            className={`${
              isAi
                ? 'bg-gradient-to-br from-[#161a22]/80 to-[#1a1f2e]/80 border border-gray-700/40 rounded-2xl p-6 shadow-2xl hover:shadow-blue-900/30 hover:border-blue-500/30 transition-all duration-500 backdrop-blur-md hover:backdrop-blur-lg'
                : ''
            }`}
          >
            <div className="prose prose-invert max-w-none leading-relaxed">

              <ReactMarkdown
                components={{
                  /* SECTION TITLE */
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold mt-8 mb-4 border-b border-gray-700/50 pb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-400 shrink-0" />
                      <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {children}
                      </span>
                    </h2>
                  ),

                  /* SUB TITLE */
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mt-6 mb-3">
                      {children}
                    </h3>
                  ),

                  /* PARAGRAPH */
                  p: ({ children }) => {
                    try {
                      const cleanChildren = React.Children.map(children, child => 
                        typeof child === 'string' ? child.replace(/undefined/gi, '').replace(/null/gi, '') : child
                      );
                      return (
                        <p className="mb-4 text-sm text-gray-300 leading-7 tracking-wide">
                          {cleanChildren}
                        </p>
                      );
                    } catch {
                      return (
                        <p className="mb-4 text-sm text-gray-300 leading-7 tracking-wide">
                          {children}
                        </p>
                      );
                    }
                  },

                  /* LIST */
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside ml-5 space-y-2 mb-4 text-sm text-gray-300">
                      {children}
                    </ul>
                  ),

                  li: ({ children }) => (
                    <li className="pl-1">{children}</li>
                  ),

                  /* STRONG / HIGHLIGHT */
                  strong: ({ children }) => {
                    const text = String(children).toLowerCase();

                    // Highlight khusus setup trading
                    if (text.includes('entry')) {
                      return (
                        <span className="font-bold text-emerald-400 bg-gradient-to-r from-emerald-400/20 to-green-400/10 px-2.5 py-1 rounded-md border border-emerald-400/30 shadow-sm">
                          {children}
                        </span>
                      );
                    }

                    if (text.includes('tp') || text.includes('target')) {
                      return (
                        <span className="font-bold text-blue-400 bg-gradient-to-r from-blue-400/20 to-cyan-400/10 px-2.5 py-1 rounded-md border border-blue-400/30 shadow-sm">
                          {children}
                        </span>
                      );
                    }

                    if (text.includes('stop') || text.includes('sl')) {
                      return (
                        <span className="font-bold text-red-400 bg-gradient-to-r from-red-400/20 to-rose-400/10 px-2.5 py-1 rounded-md border border-red-400/30 shadow-sm">
                          {children}
                        </span>
                      );
                    }

                    return (
                      <span className="font-semibold text-white bg-gradient-to-r from-gray-700/60 to-gray-800/60 px-2 py-1 rounded-md border border-gray-700/50">
                        {children}
                      </span>
                    );
                  },
                }}
              >
                {finalContent}
              </ReactMarkdown>
              {isTyping && isAi && (
                <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-1"></span>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
