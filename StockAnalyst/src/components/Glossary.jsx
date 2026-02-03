import React, { useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';

const Glossary = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const glossaryTerms = [
    // Fundamental
    {
      term: "P/E Ratio (Price-to-Earnings)",
      definition: "Rasio harga saham terhadap laba per saham. Menunjukkan berapa kali investor bersedia membayar untuk setiap rupiah keuntungan perusahaan.",
      example: "P/E 15x berarti harga saham 15 kali lipat dari earning per share.",
      category: "fundamental"
    },
    {
      term: "EPS (Earnings Per Share)",
      definition: "Laba bersih perusahaan dibagi jumlah saham beredar. Menunjukkan profitabilitas per lembar saham.",
      example: "Jika laba Rp100M dan saham beredar 10M, EPS = Rp10/saham.",
      category: "fundamental"
    },
    {
      term: "PBV (Price-to-Book Value)",
      definition: "Rasio harga pasar terhadap nilai buku. Membandingkan harga saham dengan nilai aset bersih per saham.",
      example: "PBV < 1 berarti saham diperdagangkan di bawah nilai bukunya.",
      category: "fundamental"
    },
    {
      term: "ROE (Return on Equity)",
      definition: "Persentase keuntungan yang dihasilkan dari modal pemegang saham. Mengukur efisiensi perusahaan menggunakan modal.",
      example: "ROE 20% berarti setiap Rp100 modal menghasilkan Rp20 laba.",
      category: "fundamental"
    },
    {
      term: "ROA (Return on Assets)",
      definition: "Persentase keuntungan dari total aset. Mengukur seberapa efisien perusahaan menggunakan asetnya.",
      example: "ROA 10% berarti setiap Rp100 aset menghasilkan Rp10 laba.",
      category: "fundamental"
    },
    {
      term: "DER (Debt-to-Equity Ratio)",
      definition: "Rasio total utang terhadap ekuitas. Menunjukkan tingkat leverage atau penggunaan hutang perusahaan.",
      example: "DER 1.5x berarti utang 1.5 kali lebih besar dari ekuitas.",
      category: "fundamental"
    },
    {
      term: "Dividend Yield",
      definition: "Persentase dividen tahunan dibanding harga saham. Menunjukkan return dari dividen.",
      example: "Dividen Rp500/saham, harga Rp10.000 = yield 5%.",
      category: "fundamental"
    },
    {
      term: "Market Cap (Kapitalisasi Pasar)",
      definition: "Total nilai pasar perusahaan (harga saham x jumlah saham beredar).",
      example: "Harga Rp5.000, saham 1M lembar = market cap Rp5T.",
      category: "fundamental"
    },

    // Technical Analysis
    {
      term: "Support",
      definition: "Level harga dimana tekanan beli cenderung menghentikan penurunan harga.",
      example: "Saham BBCA sering bangkit kembali di harga Rp8.500.",
      category: "technical"
    },
    {
      term: "Resistance",
      definition: "Level harga dimana tekanan jual cenderung menghentikan kenaikan harga.",
      example: "BBRI kesulitan menembus harga Rp5.000.",
      category: "technical"
    },
    {
      term: "Moving Average (MA)",
      definition: "Rata-rata harga dalam periode tertentu untuk mengidentifikasi tren.",
      example: "MA 20 hari = rata-rata harga penutupan 20 hari terakhir.",
      category: "technical"
    },
    {
      term: "RSI (Relative Strength Index)",
      definition: "Indikator momentum yang mengukur kecepatan perubahan harga. Skala 0-100.",
      example: "RSI > 70 = overbought, RSI < 30 = oversold.",
      category: "technical"
    },
    {
      term: "MACD (Moving Average Convergence Divergence)",
      definition: "Indikator momentum yang menunjukkan hubungan antara dua moving average.",
      example: "MACD crossover ke atas signal line = sinyal beli.",
      category: "technical"
    },
    {
      term: "Volume",
      definition: "Jumlah saham yang diperdagangkan dalam periode tertentu.",
      example: "Volume tinggi + harga naik = konfirmasi tren bullish.",
      category: "technical"
    },
    {
      term: "Candlestick",
      definition: "Grafik yang menampilkan harga open, high, low, close dalam satu periode.",
      example: "Candle hijau = harga naik, candle merah = harga turun.",
      category: "technical"
    },
    {
      term: "Breakout",
      definition: "Pergerakan harga menembus level support atau resistance.",
      example: "Harga menembus resistance Rp5.000 dengan volume tinggi.",
      category: "technical"
    },
    {
      term: "Trend",
      definition: "Arah pergerakan harga secara umum (uptrend, downtrend, sideways).",
      example: "Uptrend: Higher High dan Higher Low berturut-turut.",
      category: "technical"
    },

    // Trading Strategy
    {
      term: "Stop Loss",
      definition: "Level harga untuk membatasi kerugian dengan otomatis menjual saham.",
      example: "Beli di Rp5.000, pasang stop loss di Rp4.800 (-4%).",
      category: "trading"
    },
    {
      term: "Take Profit",
      definition: "Level harga target untuk mengambil keuntungan.",
      example: "Beli di Rp5.000, target profit di Rp5.500 (+10%).",
      category: "trading"
    },
    {
      term: "Risk-Reward Ratio",
      definition: "Perbandingan antara risiko kerugian dan potensi keuntungan.",
      example: "RR 1:3 = risiko Rp100, potensi profit Rp300.",
      category: "trading"
    },
    {
      term: "Cut Loss",
      definition: "Aksi menjual saham untuk membatasi kerugian lebih lanjut.",
      example: "Saham turun 5%, segera cut loss sesuai strategi.",
      category: "trading"
    },
    {
      term: "Averaging Down",
      definition: "Membeli lebih banyak saham saat harga turun untuk menurunkan harga rata-rata.",
      example: "Beli 100 lembar @Rp5.000, tambah 100 @Rp4.500.",
      category: "trading"
    },
    {
      term: "Position Sizing",
      definition: "Menentukan jumlah modal yang dialokasikan untuk satu posisi trading.",
      example: "Maksimal 5% dari total portfolio per saham.",
      category: "trading"
    },
    {
      term: "Diversifikasi",
      definition: "Menyebar investasi ke berbagai aset untuk mengurangi risiko.",
      example: "Investasi di 10 saham berbeda dari sektor berbeda.",
      category: "trading"
    },

    // Market Terms
    {
      term: "Blue Chip",
      definition: "Saham perusahaan besar, stabil, dan memiliki reputasi baik.",
      example: "BBCA, BBRI, TLKM adalah contoh blue chip Indonesia.",
      category: "market"
    },
    {
      term: "IPO (Initial Public Offering)",
      definition: "Penawaran saham perdana perusahaan ke publik.",
      example: "Perusahaan go public melalui proses IPO di BEI.",
      category: "market"
    },
    {
      term: "BEI (Bursa Efek Indonesia)",
      definition: "Bursa saham resmi Indonesia tempat perdagangan saham.",
      example: "Semua saham Indonesia diperdagangkan di BEI.",
      category: "market"
    },
    {
      term: "IHSG (Indeks Harga Saham Gabungan)",
      definition: "Indeks yang mengukur performa seluruh saham di BEI.",
      example: "IHSG naik 2% = pasar saham secara umum naik.",
      category: "market"
    },
    {
      term: "LQ45",
      definition: "Indeks 45 saham dengan likuiditas tinggi dan kapitalisasi besar.",
      example: "Saham LQ45 lebih mudah dibeli/dijual karena likuid.",
      category: "market"
    },
    {
      term: "Auto Reject Atas (ARA)",
      definition: "Batas kenaikan maksimal harga saham dalam satu hari (biasanya 25% atau 35%).",
      example: "Saham naik 25% dalam sehari akan kena ARA.",
      category: "market"
    },
    {
      term: "Auto Reject Bawah (ARB)",
      definition: "Batas penurunan maksimal harga saham dalam satu hari (biasanya 7%).",
      example: "Saham turun 7% dalam sehari akan kena ARB.",
      category: "market"
    },
    {
      term: "Suspended",
      definition: "Penghentian sementara perdagangan saham oleh BEI.",
      example: "Saham di-suspend karena ada corporate action atau investigasi.",
      category: "market"
    },
    {
      term: "Lot",
      definition: "Satuan perdagangan saham di BEI (1 lot = 100 lembar saham).",
      example: "Beli 5 lot = beli 500 lembar saham.",
      category: "market"
    },

    // Investment Types
    {
      term: "Trading",
      definition: "Jual beli saham jangka pendek untuk profit dari pergerakan harga.",
      example: "Day trading: beli pagi jual sore hari yang sama.",
      category: "investment"
    },
    {
      term: "Investing",
      definition: "Membeli saham untuk jangka panjang berdasarkan fundamental.",
      example: "Buy and hold saham blue chip selama 5-10 tahun.",
      category: "investment"
    },
    {
      term: "Value Investing",
      definition: "Membeli saham undervalued (harga murah dibanding nilai intrinsik).",
      example: "Beli saham bagus yang sedang dijual murah oleh pasar.",
      category: "investment"
    },
    {
      term: "Growth Investing",
      definition: "Membeli saham perusahaan dengan pertumbuhan tinggi.",
      example: "Investasi di perusahaan teknologi dengan pertumbuhan 30%/tahun.",
      category: "investment"
    },
    {
      term: "Dividend Investing",
      definition: "Fokus pada saham yang rutin membagikan dividen tinggi.",
      example: "Beli saham BBCA untuk dividen yield 2-3% per tahun.",
      category: "investment"
    }
  ];

  const categories = [
    { id: 'all', name: 'Semua', icon: '📚' },
    { id: 'fundamental', name: 'Fundamental', icon: '📊' },
    { id: 'technical', name: 'Teknikal', icon: '📈' },
    { id: 'trading', name: 'Trading', icon: '💰' },
    { id: 'market', name: 'Pasar', icon: '🏢' },
    { id: 'investment', name: 'Investasi', icon: '💼' }
  ];

  const filteredTerms = glossaryTerms.filter(item => {
    const matchesSearch = 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Glosarium Trading & Investasi</h2>
              <p className="text-blue-100 text-sm mt-1">Panduan lengkap istilah pasar saham Indonesia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari istilah trading..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-slate-700 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Terms List */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">Tidak ada istilah yang ditemukan</p>
              <p className="text-slate-500 text-sm mt-2">Coba kata kunci lain</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTerms.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-400">{item.term}</h3>
                    <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                      {categories.find(c => c.id === item.category)?.name}
                    </span>
                  </div>
                  <p className="text-slate-300 mb-3 leading-relaxed">{item.definition}</p>
                  <div className="bg-slate-900/50 border-l-4 border-green-500 p-3 rounded">
                    <p className="text-sm text-slate-400">
                      <span className="text-green-400 font-semibold">Contoh: </span>
                      {item.example}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800 p-4 border-t border-slate-700">
          <p className="text-center text-slate-400 text-sm">
            📚 Total {filteredTerms.length} dari {glossaryTerms.length} istilah ditampilkan
          </p>
        </div>
      </div>
    </div>
  );
};

export default Glossary;
