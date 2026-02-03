import React, { useEffect, useState } from "react";
import { X, Newspaper, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const N8N_NEWS_URL = import.meta.env.VITE_N8N_NEWS_URL;

export default function NewsSidebar({
  ticker,
  embedded = false,
  isOpen = false,
  onClose = () => {}
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    if (!embedded && !isOpen) return;

    let cancelled = false;

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError("");
        setItems([]);

        const res = await fetch(N8N_NEWS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: ticker })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const contentType = res.headers.get("content-type") || "";
        let data;

        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          data = await res.text();
        }

        let outputs = [];

        if (Array.isArray(data)) {
          outputs = data
            .map(v => (typeof v?.output === "string" ? v.output : null))
            .filter(Boolean);
        } else if (typeof data === "object" && data !== null) {
          if (typeof data.output === "string") outputs = [data.output];
        } else if (typeof data === "string") {
          outputs = [data];
        }

        if (!cancelled) setItems(outputs);
      } catch (err) {
        console.error("NEWS ERROR:", err);
        if (!cancelled) {
          setError("Failed to fetch");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNews();
    return () => (cancelled = true);
  }, [ticker, embedded, isOpen]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-400" size={32} />
            <Sparkles className="absolute -top-1 -right-1 text-purple-400 animate-pulse" size={16} />
          </div>
          <p className="text-sm text-gray-400">Menganalisis berita...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 bg-red-500/10 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-red-400 font-semibold">
            ❌ Gagal memuat analisis berita
          </p>
          <p className="text-gray-400 text-sm mt-2">{error}</p>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-10 bg-gray-800/20 border border-gray-700/30 rounded-xl p-6 backdrop-blur-sm">
          <Newspaper className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Tidak ada analisis berita</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((text, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-[#161a22]/80 to-[#1a1f2e]/80 border border-gray-700/40 rounded-xl p-5 text-sm leading-relaxed text-gray-200 backdrop-blur-md hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300"
            dangerouslySetInnerHTML={{
              __html: String(text)
                .replace(/\n/g, "<br/>")
                .replace(/\*\*(.*?)\*\*/g, "<strong class='text-blue-400'>$1</strong>")
            }}
          />
        ))}
      </div>
    );
  };

  /* ===== DESKTOP LEFT ===== */
  if (embedded) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-gray-900/50 to-gray-900/30 backdrop-blur-sm border-r border-gray-700/30">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-4 border-b border-gray-700/30 flex items-center justify-between hover:bg-blue-500/10 transition-all duration-300 group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Newspaper className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Analisis Berita {ticker}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isCollapsed && items.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                {items.length}
              </span>
            )}
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            )}
          </div>
        </button>
        
        {/* Content - Collapsible */}
        <div 
          className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${
            isCollapsed ? 'max-h-0 p-0 opacity-0' : 'max-h-full opacity-100'
          }`}
        >
          {!isCollapsed && renderContent()}
        </div>
      </div>
    );
  }

  /* ===== MOBILE ===== */
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gradient-to-b from-gray-900/95 to-gray-900/90 backdrop-blur-xl border-l border-gray-700/30 z-50 flex flex-col shadow-2xl animate-slideIn">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg">
              <Newspaper className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Analisis Berita {ticker}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110 group"
          >
            <X className="text-gray-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </div>
      </aside>
    </>
  );
}
