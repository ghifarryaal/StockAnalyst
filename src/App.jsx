import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, StopCircle } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import TabChart from './components/TabChart';

function App() {

  const N8N_WEBHOOK_URL =
    "https://tutorial-n8n.indonesiastockanalyst.my.id/webhook-test/analisa-saham";

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

    const ticker = normalizeTicker(input.trim());

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages(prev => [
      ...prev,
      { role: 'user', content: ticker },
      {
        role: 'assistant',
        content: "📊 Memuat grafik...",
        isLoading: true,
        ticker
      }
    ]);

    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: ticker }),
        signal: controller.signal
      });

      const json = await res.json();

      setMessages(prev => {
        const m = [...prev];
        const last = m[m.length - 1];

        last.content =
          json.output ||
          "Maaf, analisis tidak tersedia.";

        last.isLoading = false;
        return m;
      });

    } catch (err) {
      if (err.name === "AbortError") return;

      setMessages(prev => {
        const m = [...prev];
        const last = m[m.length - 1];

        last.content =
          "❌ Gagal mengambil analisis.\n" +
          "Coba ulang kembali.";

        last.isLoading = false;
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
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-2">
          <Sparkles className="text-blue-500 w-5 h-5" />
          <h1 className="font-bold text-lg">
            StockAnalyst
            <span className="text-blue-500"> by Ghifarryaal</span>
          </h1>
        </div>
      </header>

      {/* CHAT */}
      <main className="flex-1 overflow-y-auto pt-20 pb-40">

        {messages.map((msg, i) => (
          <div key={i}>
            {/* CHAT MESSAGE DULU */}
            <ChatMessage
              role={msg.role}
              content={msg.content}
            />

            {/* CHART DI BAWAH MESSAGE */}
            {msg.role === 'assistant' && msg.ticker && !msg.isLoading && (
              <div className="max-w-3xl mx-auto px-4 mt-6 mb-8 space-y-6">
                <TabChart symbol={msg.ticker} key={`chart-${msg.ticker}-${i}`} />
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
    </div>
  );
}

export default App;