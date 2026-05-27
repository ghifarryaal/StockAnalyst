import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Newspaper } from "lucide-react";
import ChatMessage from "./components/ChatMessage";
import TabChart from "./components/TabChart";
import NewsSidebar from "./components/NewsSidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";

function App() {
  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 **Halo Ritel Unyu!**\n\n✨ Selamat datang di **StockAnalyst AI** - Asisten analisis saham pintar Anda!\n\n📊 **Cara Menggunakan:**\nKetik kode saham Indonesia (contoh: **BBCA**, **BBRI**, **TLKM**) untuk mendapatkan analisis lengkap dengan:\n\n💡 Analisis fundamental & teknikal\n📈 Rekomendasi trading setup\n🎯 Target harga dan stop loss\n📰 Berita terkini perusahaan\n\n*(Diberikan kuota bebas 50 analisis gratis per hari)* 🚀"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("");
  const [openNews, setOpenNews] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e, directTicker = null) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const tickerToUse = directTicker || input.trim();
    if (!tickerToUse) return;

    const t = tickerToUse.toUpperCase();

    // Check daily limit of 50 using localStorage (due to database storage errors)
    const today = new Date().toDateString();
    let usageData = { date: today, count: 0 };
    try {
      const stored = localStorage.getItem("ai_prompt_usage");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          usageData = parsed;
        }
      }
    } catch (err) {
      console.error("Error reading localStorage usage:", err);
    }

    if (usageData.count >= 50) {
      setMessages(m => [
        ...m,
        { role: "user", content: t },
        { 
          role: "assistant", 
          content: `⚠️ **Batas Harian Terlampaui (Daily Limit Reached)**\n\nMaaf, kuota analisis harian Anda telah habis (maksimal **50 analisis per hari**).\n\nSilakan coba lagi besok! Terima kasih atas pengertiannya. 🙏` 
        }
      ]);
      setInput("");
      return;
    }

    // Increment and save usage
    usageData.count += 1;
    try {
      localStorage.setItem("ai_prompt_usage", JSON.stringify(usageData));
    } catch (err) {
      console.error("Error writing localStorage usage:", err);
    }

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
        body: JSON.stringify({ prompt: t, ticker: t, stock: t }),
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
        // Fallback ke data simulasi
        const fallbackText = generateFallbackAnalysis(t);
        setMessages(m => {
          const c = [...m];
          c[c.length - 1].content = `⚠️ **Respon N8N Kosong (Menggunakan Simulasi Lokal)**\n\n` + fallbackText + `\n\n---\n📊 *Sisa kuota harian Anda: ${50 - usageData.count}/50*`;
          return c;
        });
      } else {
        // Cek jika response adalah JSON
        let finalContent = cleaned;
        try {
          const parsed = JSON.parse(cleaned);
          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed)) {
              finalContent = parsed.map(v => v.output || JSON.stringify(v)).join("\n\n");
            } else if (parsed.output) {
              finalContent = parsed.output;
            }
          }
        } catch (e) {
          // Bukan JSON, gunakan cleaned text langsung
        }

        const lowerText = finalContent.toLowerCase();
        if (lowerText.includes('error') || lowerText.includes('not found') || lowerText.includes('tidak ditemukan')) {
          setMessages(m => {
            const c = [...m];
            c[c.length - 1].content = `❌ **Kode Saham Tidak Ditemukan**\n\nKode saham **${t}** tidak valid atau tidak tersedia.\n\n💡 **Tips:**\n• Pastikan kode saham benar (contoh: BBCA, BBRI, TLKM)\n• Gunakan kode saham Indonesia yang terdaftar di BEI\n• Coba kode saham lain\n\n📊 *Sisa kuota harian Anda: ${50 - usageData.count}/50*`;
            return c;
          });
        } else {
          setMessages(m => {
            const c = [...m];
            c[c.length - 1].content = finalContent + `\n\n---\n📊 *Sisa kuota harian Anda: ${50 - usageData.count}/50*`;
            return c;
          });
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      // Fallback ke data simulasi saat error koneksi/timeout
      const fallbackText = generateFallbackAnalysis(t);
      setMessages(m => {
        const c = [...m];
        c[c.length - 1].content = `⚠️ **Koneksi N8N Gagal / Offline (Menggunakan Simulasi Lokal)**\n\n` + fallbackText + `\n\n---\n📊 *Sisa kuota harian Anda: ${50 - usageData.count}/50*`;
        return c;
      });
    } finally {
      setLoading(false);
    }
  };

  // Generator data analisis simulasi yang realistis
  const generateFallbackAnalysis = (ticker) => {
    const t = ticker.toUpperCase();
    const dateStr = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
    
    return `### 📊 Analisis Teknikal & Fundamental **${t}** (${dateStr})

*Analisis ini disimulasikan secara lokal agar antarmuka Anda tetap berjalan saat webhook N8N mengalami kendala.*

---

#### **1. Rangkuman Tren & Sinyal**
* **Rekomendasi Utama**: **BUY ON WEAKNESS / ACCUMULATE**
* **Sinyal Momentum (RSI 14)**: **49.8 (Netral - Area Konsolidasi)**
* **Tren Pendek (EMA 20)**: Menguji area dinamis (Netral)
* **Tren Menengah (EMA 50)**: Berada di bawah harga saat ini (Bullish Trend Terjaga)

#### **2. Rencana Transaksi (Trading Setup)**
* **Area Beli (Buy Range)**: Dekat level support terdekat.
* **Target Harga 1 (TP1)**: Kenaikan jangka pendek +5% ke level resistance terdekat.
* **Target Harga 2 (TP2)**: Target jangka menengah +12% jika berhasil menembus resistance kuat dengan volume tinggi.
* **Batas Stop Loss**: Disarankan dipasang di level -4% di bawah support terkuat untuk membatasi risiko kerugian.

#### **3. Poin Fundamental Ringkas**
* **Valuasi (P/E & PBV)**: Diperdagangkan dekat dengan rata-rata historis 3 tahun terakhir.
* **Profitabilitas**: Margin laba kotor dan ROE tercatat solid dibanding kompetitor sejenis di industrinya.
* **Kesehatan Keuangan (DER)**: Struktur modal sangat sehat dengan porsi utang berbunga rendah.

---
*Disclaimer: Analisis ini bersifat simulasi lokal dan edukasi. Keputusan investasi sepenuhnya merupakan tanggung jawab pribadi.*`;
  };

  return (
    <div className="h-screen bg-transparent text-gray-100 flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <Navbar
        extraActions={
          ticker && (
            <button
              onClick={() => setOpenNews(true)}
              className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 border-none text-white whitespace-nowrap"
              style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}
            >
              <Newspaper size={16} /> <span className="hidden sm:inline">Berita</span>
            </button>
          )
        }
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
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f1117]/95 via-[#0f1117]/90 to-transparent p-4 border-t border-gray-700/30 backdrop-blur-xl"
      >
        <div className="max-w-3xl mx-auto flex gap-3">
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
      </form>

      {/* MOBILE NEWS */}
      <NewsSidebar
        ticker={ticker}
        isOpen={openNews}
        onClose={() => setOpenNews(false)}
      />
    </div>
  );
}

export default App;
