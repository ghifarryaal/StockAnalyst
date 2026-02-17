import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Sparkles, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatMessage = ({ role, content, isAuthWarning = false }) => {
  const navigate = useNavigate();
  const isAi = role === 'assistant';
  const safeContent = content || '';
  const normalizedContent = safeContent
    .replace(/undefined/gi, '')
    .replace(/null/gi, '')
    .trim();
  // Final safeguard to remove any undefined text
  const finalContent = normalizedContent
    .replace(/undefined/gi, '')
    .replace(/null/gi, '')
    .trim();

  return (
    <div className={`w-full py-8 ${isAi ? 'bg-transparent' : 'bg-gray-800/20 backdrop-blur-sm'} animate-fadeIn`}>
      <div className="max-w-3xl mx-auto flex gap-6 px-4">

        {/* AVATAR */}
        <div className="shrink-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-300 ${isAi
              ? 'bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-500 text-white animate-pulse-slow hover:scale-110'
              : 'bg-gradient-to-br from-gray-700 to-gray-600 text-gray-200 hover:scale-105'
              } ring-2 ring-offset-2 ring-offset-transparent ${isAi ? 'ring-blue-500/50 hover:ring-purple-500/70' : 'ring-gray-600/50'
              }`}
            style={isAi ? { boxShadow: '0 0 25px rgba(59, 130, 246, 0.4), 0 0 50px rgba(139, 92, 246, 0.2)' } : {}}
          >
            {isAi ? (
              <div className="relative">
                <Bot size={20} />
                {/* Typing indicator removed */}
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
            {/* Status removed */}
          </div>

          {/* CARD CONTAINER UNTUK AI */}
          <div
            className={`${isAi
              ? 'bg-gradient-to-br from-[#161a22]/80 to-[#1a1f2e]/80 border border-gray-700/40 rounded-2xl p-6 shadow-2xl hover:shadow-blue-900/30 hover:border-blue-500/30 transition-all duration-500 backdrop-blur-md hover:backdrop-blur-lg'
              : ''
              }`}
          >
            <div className="prose prose-invert max-w-none leading-relaxed">

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  /* TABLE */
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 rounded-xl border border-gray-700/50 shadow-lg">
                      <table className="min-w-full divide-y divide-gray-700/50 bg-gray-800/10 backdrop-blur-sm">
                        {children}
                      </table>
                    </div>
                  ),

                  thead: ({ children }) => (
                    <thead className="bg-gray-800/40">
                      {children}
                    </thead>
                  ),

                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-gray-700/30">
                      {children}
                    </tbody>
                  ),

                  tr: ({ children }) => (
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      {children}
                    </tr>
                  ),

                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                      {children}
                    </th>
                  ),

                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {children}
                    </td>
                  ),

                  /* SECTION TITLE */
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold mt-8 mb-4 border-b border-gray-700/50 pb-3 flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-500/10">
                        <Sparkles size={18} className="text-blue-400 shrink-0" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-100 to-blue-300 bg-clip-text text-transparent">
                        {children}
                      </span>
                    </h2>
                  ),

                  /* SUB TITLE */
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-emerald-300 mt-6 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {children}
                    </h3>
                  ),

                  /* PARAGRAPH */
                  p: ({ children }) => {
                    try {
                      const cleanChildren = React.Children.map(children, child =>
                        typeof child === 'string' ? child.replace(/undefined/gi, '').replace(/null/gi, '') : child
                      );
                      // Don't render empty paragraphs
                      if (!cleanChildren || (Array.isArray(cleanChildren) && cleanChildren.every(c => !c || (typeof c === 'string' && !c.trim())))) {
                        return null;
                      }
                      return (
                        <p className="mb-4 text-[15px] text-gray-300 leading-7 tracking-wide font-light">
                          {cleanChildren}
                        </p>
                      );
                    } catch {
                      return (
                        <p className="mb-4 text-[15px] text-gray-300 leading-7 tracking-wide font-light">
                          {children}
                        </p>
                      );
                    }
                  },

                  /* LIST */
                  ul: ({ children }) => (
                    <ul className="space-y-2 mb-6 text-gray-300">
                      {children}
                    </ul>
                  ),

                  li: ({ children }) => (
                    <li className="flex items-start gap-3 text-sm leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0"></span>
                      <span>{children}</span>
                    </li>
                  ),

                  /* BLOCKQUOTE */
                  blockquote: ({ children }) => (
                    <div className="border-l-4 border-blue-500/50 pl-4 py-1 my-4 bg-blue-900/10 rounded-r-lg italic text-gray-400">
                      {children}
                    </div>
                  ),

                  /* STRONG / HIGHLIGHT */
                  strong: ({ children }) => {
                    const text = String(children).toLowerCase();

                    // Highlight for Trading Signals
                    if (['buy', 'long'].some(k => text.includes(k)) && text.length < 20) {
                      return (
                        <span className="font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                          {children}
                        </span>
                      );
                    }
                    if (['sell', 'short', 'avoid'].some(k => text.includes(k)) && text.length < 20) {
                      return (
                        <span className="font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">
                          {children}
                        </span>
                      );
                    }
                    if (['wait', 'hold', 'neutral'].some(k => text.includes(k)) && text.length < 20) {
                      return (
                        <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {children}
                        </span>
                      );
                    }

                    // Highlight for Technical Levels
                    if (text.includes('entry') || text.includes('support')) {
                      return (
                        <span className="font-bold text-emerald-300">
                          {children}
                        </span>
                      );
                    }

                    if (text.includes('target') || text.includes('tp') || text.includes('resistance')) {
                      return (
                        <span className="font-bold text-blue-300">
                          {children}
                        </span>
                      );
                    }

                    if (text.includes('stop') || text.includes('sl')) {
                      return (
                        <span className="font-bold text-rose-300">
                          {children}
                        </span>
                      );
                    }

                    return (
                      <strong className="font-bold text-gray-100">
                        {children}
                      </strong>
                    );
                  },
                }}
              >
                {finalContent}
              </ReactMarkdown>

              {isAuthWarning && (
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 group"
                  >
                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span>Ke Halaman Login</span>
                  </button>
                  <p className="text-center text-[11px] text-gray-500 mt-3">
                    Bebas biaya pendaftaran dan nikmati fitur analisis pintar.
                  </p>
                </div>
              )}
              {/* Cursor removed */}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
