import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, StopCircle, Newspaper } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import TabChart from './components/TabChart';
import NewsSidebar from './components/NewsSidebar';

function App() {

  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "## 👋 Halo Ritel Unyu !\n" +
        "Ketik kode saham (contoh: **BBRI**) untuk melihat grafik & analisisnya."
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTicker, setCurrentTicker] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);
  useEffect(() => inputRef.current?.focus(), []);

  const normalizeTicker = (s) => {
    if (!s) return "";
    s = s.toUpperCase();
    if (s.length === 4 && !s.endsWith(".JK")) return `${s}.JK`;
    return s;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const tickerInput = input.trim().toUpperCase();
    const ticker = normalizeTicker(tickerInput); // dengan .JK untuk analisis
    const tickerForNews = tickerInput.replace('.JK', ''); // tanpa .JK untuk berita

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages(prev => [
      ...prev,
      { role: 'user', content: ticker },
      {
        role: 'assistant',
        content: "📊 Menampilkan grafik...",
        isLoading: true,
        aiError: false,
        chartError: false,
        ticker
      }
    ]);

    setCurrentTicker(tickerForNews); // simpan tanpa .JK untuk berita
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: ticker }),
        signal: controller.signal
      });

      if (!res.ok) throw new Error("n8n error");

      const json = await res.json();

      setMessages(prev => {
        const m = [...prev];
        const last = m[m.length - 1];

        last.content = json.output || "";
        last.isLoading = false;
        last.aiError = false;
        return m;
      });

    } catch {
      setMessages(prev => {
        const m = [...prev];
        const last = m[m.length - 1];

        last.content = ""; // JANGAN tampilkan error dulu
        last.isLoading = false;
        last.aiError = true;
        return m;
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f1117] text-gray-100">

      {/* NAVBAR */}
      <header className="fixed top-0 w-full bg-[#0f1117]/80 backdrop-blur-md
        border-b border-gray-800 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-500 w-5 h-5" />
            <h1 className="font-bold text-lg">
              StockAnalyst
              <span className="text-blue-500"> by Ghifarryaal</span>
            </h1>
          </div>
          
          {/* BUTTON NEWS */}
          {currentTicker && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                rounded-lg transition-colors text-sm font-medium"
            >
              <Newspaper className="w-4 h-4" />
              <span className="hidden sm:inline">Berita</span>
            </button>
          )}
        </div>
      </header>

      {/* CHAT */}
      <main className="flex-1 overflow-y-auto pt-20 pb-40">

        {messages.map((msg, i) => (
          <div key={i}>

            <ChatMessage
              role={msg.role}
              content={
                msg.aiError && msg.chartError
                  ? "⚠️ Data tidak tersedia"
                  : msg.content
              }
            />

            {/* CHART */}
            {msg.role === "assistant" && msg.ticker && (
              <div className="max-w-3xl mx-auto px-4 mt-4 mb-6">
                <TabChart
                  symbol={msg.ticker}
                  onError={() => {
                    setMessages(prev => {
                      const m = [...prev];
                      m[i].chartError = true;
                      return m;
                    });
                  }}
                />
              </div>
            )}

          </div>
        ))}

        {isLoading &&
          messages[messages.length - 1]?.isLoading && (
            <div className="w-full py-8">
              <div className="max-w-3xl mx-auto px-4 flex gap-3">
                <Loader2 className="animate-spin" />
                <span>Menghubungkan ke AI...</span>
              </div>
            </div>
          )}

        <div ref={messagesEndRef} />
      </main>

      {/* INPUT */}
      <footer className="fixed bottom-0 w-full pb-6 pt-10 px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik kode saham (cth: BMRI)"
              className="w-full bg-gray-800 rounded-2xl py-4
                pl-5 pr-14 border border-gray-700"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2
                p-2 bg-blue-600 rounded-xl"
            >
              {isLoading
                ? <StopCircle size={18} />
                : <Send size={18} />
              }
            </button>
          </form>
        </div>
      </footer>

      {/* NEWS SIDEBAR */}
      <NewsSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ticker={currentTicker}
      />
    </div>
  );
}

export default App;
