import React, { useState, useEffect } from 'react';
import { X, Newspaper, Loader2, ExternalLink } from 'lucide-react';

const N8N_NEWS_URL = import.meta.env.VITE_N8N_NEWS_URL;

export default function NewsSidebar({ isOpen, onClose, ticker }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker || !isOpen) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(N8N_NEWS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: ticker })
        });
        
        if (!res.ok) throw new Error("Failed to fetch news");
        
        const data = await res.json();
        setNews(data.news || data.output?.news || []);
      } catch (err) {
        setError(err.message);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [ticker, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* OVERLAY */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <aside className={`
        fixed right-0 top-0 h-full w-full sm:w-96 
        bg-[#0f1117] border-l border-gray-800 z-50
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-lg">Berita {ticker}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          )}

          {error && (
            <div className="text-center py-10 px-4">
              <p className="text-red-400">❌ Gagal memuat berita</p>
              <p className="text-gray-400 text-sm mt-2">{error}</p>
            </div>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="text-center py-10 px-4">
              <p className="text-gray-400">📰 Belum ada berita untuk saham ini</p>
            </div>
          )}

          {!loading && !error && news.length > 0 && (
            <div className="space-y-4">
              {news.map((item, idx) => (
                <article 
                  key={idx}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
                >
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  {item.summary && (
                    <p className="text-gray-400 text-xs mb-3 line-clamp-3">
                      {item.summary}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.source || 'Unknown'}</span>
                    <span>{formatDate(item.published_at)}</span>
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-blue-400 hover:text-blue-300"
                    >
                      Baca selengkapnya
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
