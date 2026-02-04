import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Newspaper, BookOpen, Building2, TrendingUp, X } from "lucide-react";
import ChatMessage from "./components/ChatMessage";
import TabChart from "./components/TabChart";
import NewsSidebar from "./components/NewsSidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import StockTicker from "./components/StockTicker";
import TopStocks from "./components/TopStocks";
import Glossary from "./components/Glossary";
import IndustryGuide from "./components/IndustryGuide";

function App() {
  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 **Halo Ritel Unyu!**\n\n✨ Selamat datang di **StockAnalyst AI** - Asisten analisis saham pintar Anda!\n\n📊 **Cara Menggunakan:**\nKetik kode saham Indonesia (contoh: **BBCA**, **BBRI**, **TLKM**) untuk mendapatkan analisis lengkap dengan:\n\n💡 Analisis fundamental & teknikal\n📈 Rekomendasi trading setup\n🎯 Target harga dan stop loss\n📰 Berita terkini perusahaan\n\n**Siap memulai? Ketik kode saham favorit Anda!** 🚀"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("");
  const [openNews, setOpenNews] = useState(false);
  const [openGlossary, setOpenGlossary] = useState(false);
  const [openIndustryGuide, setOpenIndustryGuide] = useState(false);
  const [openTopStocks, setOpenTopStocks] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e, directTicker = null) => {
    e.preventDefault();
    const tickerToUse = directTicker || input.trim();
    if (!tickerToUse) return;

    const t = tickerToUse.toUpperCase();

    setMessages(m => [
      ...m,
      { role: "user", content: t },
      { role: "assistant", content: "📊 Menganalisis saham" }
    ]);

    setInput("");
    setTicker(t);
    setLoading(true);

    try {
      // Timeout 30 detik untuk fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: t }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Cek status response
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      console.log('=== RAW RESPONSE ===', text);

      // Bersihkan response
      const trimmed = text ? text.trim() : '';
      const cleaned = trimmed.replace(/\bundefined\b/gi, '').trim();

      // Validasi konten response
      if (!cleaned || cleaned.length < 10) {
        throw new Error('Response kosong atau tidak valid');
      }

      // Cek jika response adalah error message dari backend
      const lowerText = cleaned.toLowerCase();
      if (lowerText.includes('error') || lowerText.includes('not found') || lowerText.includes('tidak ditemukan')) {
        setMessages(m => {
          const c = [...m];
          c[c.length - 1].content = `❌ **Kode Saham Tidak Ditemukan**\n\nKode saham **${t}** tidak valid atau tidak tersedia.\n\n💡 **Tips:**\n• Pastikan kode saham benar (contoh: BBCA, BBRI, TLKM)\n• Gunakan kode saham Indonesia yang terdaftar di BEI\n• Coba kode saham lain`;
          return c;
        });
      } else {
        setMessages(m => {
          const c = [...m];
          c[c.length - 1].content = cleaned;
          return c;
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);

      let errorMessage = "⚠️ **Gagal Mengambil Data**\n\n";

      if (error.name === 'AbortError') {
        errorMessage += "⏱️ Permintaan melebihi batas waktu (30 detik).\n\n💡 **Saran:** Coba lagi dalam beberapa saat.";
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage += "🌐 Tidak dapat terhubung ke server.\n\n💡 **Saran:**\n• Periksa koneksi internet Anda\n• Pastikan server backend aktif\n• Coba refresh halaman";
      } else if (error.message.includes('tidak valid') || error.message.includes('kosong')) {
        errorMessage += `❌ Kode saham **${t}** tidak valid atau tidak ditemukan.\n\n💡 **Tips:** Gunakan kode saham yang terdaftar di BEI (contoh: BBCA, BBRI, TLKM)`;
      } else {
        errorMessage += `${error.message}\n\n💡 **Saran:** Silakan coba lagi atau gunakan kode saham lain.`;
      }

      setMessages(m => {
        const c = [...m];
        c[c.length - 1].content = errorMessage;
        return c;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-transparent text-gray-100 flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center px-6 py-4 border-b border-gray-700/30 backdrop-blur-xl bg-gradient-to-r from-gray-900/50 to-gray-800/50 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg hover:scale-110 transition-transform duration-300" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">StockAnalyst</span>
            </h1>
            <p className="text-[10px] text-gray-500">by Ghifarryaal</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setOpenIndustryGuide(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-cyan-500/50"
            style={{ boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)' }}
          >
            <Building2 size={16} /> <span className="hidden sm:inline">Industri</span>
          </button>

          <button
            onClick={() => setOpenTopStocks(true)}
            className="lg:hidden bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-orange-500/50"
            style={{ boxShadow: '0 0 15px rgba(234, 88, 12, 0.3)' }}
          >
            <TrendingUp size={16} /> <span className="hidden sm:inline">Pasar</span>
          </button>

          <button
            onClick={() => setOpenGlossary(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-green-500/50"
            style={{ boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}
          >
            <BookOpen size={16} /> <span className="hidden sm:inline">Glosarium</span>
          </button>
          {ticker && (
            <button
              onClick={() => setOpenNews(true)}
              className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-blue-500/50"
              style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}
            >
              <Newspaper size={16} /> <span className="hidden sm:inline">Berita</span>
            </button>
          )}
        </div>
      </header>

      {/* STOCK TICKER */}
      <StockTicker
        currentTicker={ticker}
        onTickerClick={(code) => {
          handleSubmit({ preventDefault: () => { } }, code);
        }}
      />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT NEWS */}
        <aside className="hidden lg:block w-80 border-r border-gray-700/30">
          <NewsSidebar ticker={ticker} embedded />
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto pb-40">
          <ErrorBoundary>
            {messages.map((m, i) => (
              <div key={i}>
                <ChatMessage role={m.role} content={m.content} />
                {m.role === "assistant" && ticker && i === messages.length - 1 && (
                  <div className="max-w-3xl mx-auto px-4 mt-4">
                    <TabChart symbol={`${ticker}.JK`} />
                  </div>
                )}
              </div>
            ))}
          </ErrorBoundary>

          {loading && (
            <div className="max-w-3xl mx-auto px-4 mt-4 flex items-center gap-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
              <Loader2 className="animate-spin text-blue-400" size={20} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-200">Memproses AI...</span>
                <span className="text-xs text-gray-400">Menganalisis data pasar</span>
              </div>
              <div className="ml-auto flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </main>

        {/* RIGHT TOP STOCKS */}
        <aside className="hidden lg:block w-[22rem] xl:w-96 border-l border-gray-700/30">
          <TopStocks
            onStockClick={(code) => {
              handleSubmit({ preventDefault: () => { } }, code);
            }}
          />
        </aside>
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f1117]/95 via-[#0f1117]/90 to-transparent p-4 border-t border-gray-700/30 backdrop-blur-xl"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ketik kode saham (cth: BBCA)"
              disabled={loading}
              className="flex-1 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg backdrop-blur-sm hover:border-gray-600/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed px-5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/50 disabled:shadow-none group hover:scale-105 active:scale-95"
            >
              <Send className="group-hover:translate-x-0.5 transition-transform" size={20} />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-500 mt-2 font-medium">
            ⚠️ <span className="font-bold">Disclaimer:</span> Analisis ini hanya untuk tujuan edukasi. Keputusan investasi sepenuhnya berada di tangan Anda (DYOR).
          </p>
        </div>
      </form>

      {/* MOBILE NEWS */}
      <NewsSidebar
        ticker={ticker}
        isOpen={openNews}
        onClose={() => setOpenNews(false)}
      />

      {/* MOBILE TOP STOCKS MODAL */}
      {openTopStocks && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpenTopStocks(false)} />
          <div className="bg-[#1a1f2e] w-full max-w-md h-[80vh] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col relative animate-fadeInUp">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <TrendingUp size={18} className="text-orange-500" />
                Live Market
              </h3>
              <button onClick={() => setOpenTopStocks(false)} className="p-1 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TopStocks onStockClick={(code) => {
                handleSubmit({ preventDefault: () => { } }, code);
                setOpenTopStocks(false);
              }} />
            </div>
          </div>
        </div>
      )}

      {/* GLOSSARY MODAL */}
      <Glossary
        isOpen={openGlossary}
        onClose={() => setOpenGlossary(false)}
      />

      {/* INDUSTRY GUIDE MODAL */}
      <IndustryGuide
        isOpen={openIndustryGuide}
        onClose={() => setOpenIndustryGuide(false)}
      />
    </div>
  );
}

export default App;
