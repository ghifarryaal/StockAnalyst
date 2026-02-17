import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, Sparkles, Newspaper, BookOpen, Building2, TrendingUp, X, GraduationCap, LogIn, User, LogOut } from "lucide-react";
import ChatMessage from "./components/ChatMessage";
import TabChart from "./components/TabChart";
import NewsSidebar from "./components/NewsSidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import StockTicker from "./components/StockTicker";
import TopStocks from "./components/TopStocks";
import { stockIndustryMap } from "./components/stockIndustryData";
import { getCachedAnalysis, saveAnalysisToCache, isCacheAvailable } from "./services/cacheService";
import { useAuth } from "./contexts/AuthContext";
import { checkUsageLimit, incrementUsage } from "./services/aiUsageService";
import Navbar from "./components/Navbar";

function App() {
  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

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
  const [openTopStocks, setOpenTopStocks] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e, directTicker = null) => {
    if (e) e.preventDefault();

    // 0. CHECK AUTHENTICATION
    if (!isAuthenticated) {
      setMessages(m => [
        ...m,
        {
          role: "assistant",
          content: "🔒 **Akses Terbatas**\n\nSilakan login terlebih dahulu untuk menggunakan fitur AI Analyst dan mendapatkan analisis saham mendalam.",
          isAuthWarning: true
        }
      ]);
      return;
    }

    // 1. CHECK USAGE LIMIT
    const { allowed, remaining, count, error: limitError } = await checkUsageLimit();
    if (limitError) {
      console.error("Limit check error:", limitError);
    }

    if (!allowed) {
      setMessages(m => [
        ...m,
        {
          role: "assistant",
          content: `⚠️ **Batas Harian Tercapai**\n\nMaaf, Anda telah menggunakan kuota harian sebanyak **5 prompt**.\n\n💡 **Tips:** Kuota akan di-reset besok secara otomatis. Silakan kembali lagi besok!`
        }
      ]);
      return;
    }

    // LOGIC BARU: Deteksi Ticker
    const findTicker = (text) => {
      if (!text) return null;
      const clean = text.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');
      const words = clean.split(/\s+/).filter(w => w.length >= 3);

      // 1. Cek di stockIndustryMap (Paling Akurat)
      const fromMap = words.find(w => stockIndustryMap[w]);
      if (fromMap) {
        console.log('✅ Ticker found in stockIndustryMap:', fromMap);
        return fromMap;
      }

      // 2. Cek 4 huruf bukan stopwords
      const STOPWORDS = ['YANG', 'DARI', 'PADA', 'AKAN', 'BISA', 'LALU', 'JIKA', 'SAAT', 'OLEH', 'KAMI', 'KITA', 'SAYA', 'ANDA', 'ATAU', 'JAGA', 'DATA', 'BANK', 'UANG'];
      const candidate4 = words.find(w => w.length === 4 && !STOPWORDS.includes(w));
      if (candidate4) {
        console.log('✅ Ticker detected (4-letter):', candidate4);
        return candidate4;
      }

      // 3. Fallback: Kata pertama 3-6 huruf jika input pendek
      if (words.length === 1 && words[0].length <= 6) {
        console.log('✅ Ticker detected (single word):', words[0]);
        return words[0];
      }

      console.log('❌ No ticker detected from input:', text);
      return null;
    };

    const rawInput = directTicker || input.trim();
    if (!rawInput) return;

    // Cari ticker dari natural language
    const detectedTicker = findTicker(rawInput);
    console.log('🔍 Input:', rawInput, '| Detected Ticker:', detectedTicker);

    // Tampilkan pesan user (asli)
    setMessages(m => [
      ...m,
      { role: "user", content: rawInput },
      { role: "assistant", content: "📊 Menganalisis saham" }
    ]);

    setInput("");
    setTicker(detectedTicker || "");
    setLoading(true);

    try {
      // ============================================
      // STEP 1: Check Cache First (Progressive Loading)
      // ============================================
      if (detectedTicker && isCacheAvailable()) {
        console.log('🔍 Checking cache for', detectedTicker);
        const cachedData = await getCachedAnalysis(detectedTicker);

        if (cachedData) {
          const cacheAge = Math.round((Date.now() - cachedData.timestamp) / 1000 / 60);
          console.log(`✅ Using cached data (${cacheAge} minutes old)`);

          // Tampilkan cached data dengan indikator
          setMessages(m => {
            const c = [...m];
            c[c.length - 1].content = cachedData.data + `\n\n---\n\n🕐 *Data dari cache (${cacheAge} menit yang lalu)*`;
            return c;
          });

          setLoading(false);

          // Optional: Fetch fresh data di background jika cache > 1 jam
          if (cacheAge > 60) {
            console.log('🔄 Cache agak lama, fetching fresh data di background...');
            // Continue to fetch below (don't return)
          } else {
            return; // Cache masih fresh, skip fetch
          }
        }
      }

      // ============================================
      // STEP 2: Fetch Fresh Data from N8N
      // ============================================
      setMessages(m => {
        const c = [...m];
        c[c.length - 1].content = "📊 Menganalisis saham (mengambil data terbaru...)";
        return c;
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: rawInput }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      console.log('=== RAW RESPONSE ===', text);

      const trimmed = text ? text.trim() : '';
      const cleaned = trimmed.replace(/\bundefined\b/gi, '').trim();

      if (!cleaned || cleaned.length < 10) {
        throw new Error('Response kosong atau tidak valid');
      }

      // ============================================
      // STEP 3: Save to Cache & Display
      // ============================================
      const lowerText = cleaned.toLowerCase();
      if (lowerText.includes('error') || lowerText.includes('not found') || lowerText.includes('tidak ditemukan')) {
        setMessages(m => {
          const c = [...m];
          c[c.length - 1].content = `❌ **Kode Saham Tidak Ditemukan**\n\nMaaf, saya tidak dapat menemukan analisa untuk permintaan Anda.\n\n💡 **Tips:**\n• Pastikan menyebutkan kode saham (contoh: BBCA)\n• Gunakan kode saham Indonesia yang valid`;
          return c;
        });
      } else {
        // Save to cache (non-blocking)
        if (detectedTicker) {
          saveAnalysisToCache(detectedTicker, cleaned).catch(err => {
            console.warn('Failed to save cache:', err);
          });
        }

        // Increment usage count in DB
        await incrementUsage();

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
      <Navbar />

      {/* MOBILE ACTIONS BAR (Sticky below navbar for mobile) */}
      <div className="lg:hidden flex items-center justify-center gap-2 p-2 px-4 border-b border-gray-700/30 bg-gray-900/50 backdrop-blur-md overflow-x-auto no-scrollbar">
        <button
          onClick={() => setOpenTopStocks(true)}
          className="whitespace-nowrap bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg transition-all duration-200"
        >
          <TrendingUp size={14} /> <span>Pasar</span>
        </button>

        <button
          onClick={() => navigate("/glossary")}
          className="whitespace-nowrap bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg transition-all duration-200"
        >
          <BookOpen size={14} /> <span>Glosarium</span>
        </button>

        {ticker && (
          <button
            onClick={() => setOpenNews(true)}
            className="whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            <Newspaper size={14} /> <span>Berita</span>
          </button>
        )}
      </div>

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
                <ChatMessage role={m.role} content={m.content} isAuthWarning={m.isAuthWarning} />
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
      {
        openTopStocks && (
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
        )
      }
    </div >
  );
}

export default App;
