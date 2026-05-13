import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, RefreshCw, AlertTriangle, BarChart2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const API_BASE = "https://api.indonesiastockanalyst.my.id";

const TopMoversPage = () => {
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('gainers');

  const majorStocks = [
    'BBCA', 'BBRI', 'TLKM', 'ASII', 'BMRI', 'BBNI', 'UNVR', 'ICBP',
    'INDF', 'GGRM', 'KLBF', 'HMSP', 'SMGR', 'INCO', 'ADRO', 'PTBA',
    'ANTM', 'PGAS', 'ITMG', 'UNTR', 'EXCL', 'CPIN', 'TBIG', 'TOWR',
    'MIKA', 'GOTO', 'MDKA', 'BRPT', 'MEDC', 'JPFA', 'WIKA', 'WSKT',
    'PTPP', 'JSMR', 'SCMA', 'AMMN', 'ACES', 'ESSA', 'BYAN', 'BRIS',
    'HRUM', 'BUMI', 'TINS', 'AKRA', 'MNCN', 'ERAA', 'TKIM', 'DOID'
  ];

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const promises = majorStocks.map(async (code) => {
        try {
          const url = `${API_BASE}/api/chart/${code}.JK?limit=10`;
          const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (!response.ok) return null;
          const json = await response.json();
          const data = json.data || [];
          if (data.length < 2) return null;
          const today = data[data.length - 1];
          const yesterday = data[data.length - 2];
          if (!yesterday?.price || !today?.price) return null;
          const dailyChange = ((today.price - yesterday.price) / yesterday.price) * 100;
          return {
            code,
            name: json.info?.shortName || json.info?.longName || code,
            price: today.price,
            change: dailyChange,
            volume: today.volume || 0
          };
        } catch { return null; }
      });

      const results = (await Promise.all(promises)).filter(Boolean);
      if (results.length === 0) throw new Error('Tidak ada data yang tersedia.');

      const sorted = [...results].sort((a, b) => b.change - a.change);
      setTopGainers(sorted.slice(0, 10));
      setTopLosers([...sorted].reverse().slice(0, 10));
      setLastUpdated(new Date());
    } catch (err) {
      setError('Gagal memuat data. Pastikan koneksi Anda stabil.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatPrice = (p) => new Intl.NumberFormat('id-ID').format(p);

  const StockRow = ({ stock, rank }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-800/40 hover:bg-gray-800/70 rounded-xl border border-gray-700/30 hover:border-blue-500/30 transition-all group">
      <span className="w-6 text-center text-xs font-bold text-gray-500">{rank}</span>
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <span className="text-white font-bold text-[10px]">{stock.code.substring(0, 2)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{stock.code}</p>
        <p className="text-xs text-gray-400 truncate">{stock.name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">Rp {formatPrice(stock.price)}</p>
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold mt-0.5 ${stock.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {stock.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] text-gray-100">
      <Navbar />

      {/* Header */}
      <div className="bg-slate-900/30 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <BarChart2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Top Gainer & Loser</h1>
              <p className="text-sm text-gray-400">Pergerakan saham hari ini · Data BEI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <p className="text-xs text-gray-500">Update: {lastUpdated.toLocaleTimeString('id-ID')}</p>
            )}
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg text-sm text-blue-400 font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-amber-900/20 border border-amber-500/40 rounded-xl mb-6">
          <AlertTriangle className="text-amber-400 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm text-amber-300/90 leading-relaxed">
            <strong>⚠️ Bukan Rekomendasi Investasi.</strong> Data ini hanya untuk referensi dan pemantauan pasar, bukan saran beli atau jual. Selalu lakukan analisis mandiri. Investasi saham mengandung risiko.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-400" size={36} />
            <p className="text-gray-400 text-sm">Memuat data pasar...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-red-400">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-blue-600 rounded-lg text-sm text-white hover:bg-blue-700 transition">Coba Lagi</button>
          </div>
        ) : (
          <>
            {/* Mobile Tabs */}
            <div className="flex md:hidden gap-2 mb-4">
              <button onClick={() => setActiveTab('gainers')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'gainers' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                🚀 Top Gainer
              </button>
              <button onClick={() => setActiveTab('losers')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'losers' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                📉 Top Loser
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Gainers */}
              <div className={activeTab === 'losers' ? 'hidden md:block' : ''}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-600/20 rounded-lg"><TrendingUp className="text-green-400" size={16} /></div>
                  <h2 className="text-lg font-bold text-green-400">Top Gainer</h2>
                  <span className="text-xs text-gray-500 ml-auto">Naik terbesar</span>
                </div>
                <div className="space-y-2">
                  {topGainers.map((stock, i) => <StockRow key={stock.code} stock={stock} rank={i + 1} />)}
                </div>
              </div>

              {/* Losers */}
              <div className={activeTab === 'gainers' ? 'hidden md:block' : ''}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-red-600/20 rounded-lg"><TrendingDown className="text-red-400" size={16} /></div>
                  <h2 className="text-lg font-bold text-red-400">Top Loser</h2>
                  <span className="text-xs text-gray-500 ml-auto">Turun terbesar</span>
                </div>
                <div className="space-y-2">
                  {topLosers.map((stock, i) => <StockRow key={stock.code} stock={stock} rank={i + 1} />)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopMoversPage;
