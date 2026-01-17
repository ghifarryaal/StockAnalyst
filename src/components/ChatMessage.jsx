import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

const ChatMessage = ({ role, content }) => {
  const isAi = role === 'assistant';

  return (
    <div className={`w-full py-8 ${isAi ? 'bg-transparent' : 'bg-gray-800/30'}`}>
      <div className="max-w-3xl mx-auto flex gap-6 px-4">
        {/* Avatar Area */}
        <div className="shrink-0 flex flex-col relative items-end">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
            isAi 
              ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}>
            {isAi ? <Bot size={18} /> : <User size={18} />}
          </div>
        </div>

        {/* Message Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Nama Role */}
          <p className="text-sm font-semibold text-gray-400 mb-2">
            {isAi ? 'Stock Analyst AI' : 'You'}
          </p>

          <div className="prose prose-invert max-w-none leading-relaxed text-gray-200">
            <ReactMarkdown
              components={{
                // PERBAIKAN: Saya menghapus "node" di sini agar tidak merah
                h2: (props) => (
                  <h2 className="text-xl font-bold text-blue-400 mt-6 mb-3 flex items-center gap-2 border-b border-gray-700 pb-2" {...props} />
                ),
                h3: (props) => (
                  <h3 className="text-lg font-semibold text-emerald-400 mt-5 mb-2" {...props} />
                ),
                p: (props) => (
                  <p className="mb-4 text-base text-gray-300 leading-7" {...props} />
                ),
                ul: (props) => (
                  <ul className="list-disc list-outside ml-5 space-y-2 mb-4 text-gray-300" {...props} />
                ),
                li: (props) => (
                  <li className="pl-1" {...props} />
                ),
                strong: (props) => (
                  <strong className="font-bold text-white bg-gray-800/50 px-1 rounded" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;