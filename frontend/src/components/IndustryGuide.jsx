import React, { useState, useEffect } from 'react';
import { Building2, Search, X, TrendingUp, TrendingDown, Loader2, Globe, AlertCircle } from 'lucide-react';
import { getIndustries } from '../services/industryService';

const IndustryGuide = ({ isOpen, onClose, standalone = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSector, setActiveSector] = useState('all');
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen || standalone) {
      loadIndustries();
    }
  }, [isOpen, standalone]);

  const loadIndustries = async () => {
    setLoading(true);
    const { industries: data, error: err } = await getIndustries();
    
    if (err) {
      console.warn('Using fallback data due to fetch error:', err);
      // Use fallback data if PB is not ready
      setIndustries(fallbackIndustryData);
    } else if (data.length > 0) {
      setIndustries(data);
    } else {
      setIndustries(fallbackIndustryData);
    }
    setLoading(false);
  };

  const sectors = [
    { id: 'all', name: 'Semua Sektor', icon: '🏭' },
    { id: 'Perbankan', name: 'Perbankan', icon: '🏦' },
    { id: 'Infrastruktur', name: 'Infrastruktur', icon: '📡' },
    { id: 'Konsumer', name: 'Konsumer', icon: '🛒' },
    { id: 'Properti & Konstruksi', name: 'Properti', icon: '🏢' },
    { id: 'Energi & Pertambangan', name: 'Energi', icon: '⛏️' },
    { id: 'Teknologi', name: 'Teknologi', icon: '💻' },
    { id: 'Kesehatan', name: 'Kesehatan', icon: '💊' },
    { id: 'Transportasi', name: 'Transportasi', icon: '✈️' },
    { id: 'Agrikultur', name: 'Agrikultur', icon: '🌾' },
    { id: 'Media', name: 'Media', icon: '📺' }
  ];

  const filteredIndustries = industries.filter(item => {
    const searchStr = (item.industry + ' ' + item.description + ' ' + (item.examples?.join(' ') || '')).toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesSector = activeSector === 'all' || item.sector === activeSector;
    return matchesSearch && matchesSector;
  });

  if (!isOpen && !standalone) return null;

  const content = (
    <div className={`${standalone ? 'w-full' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700/50 backdrop-blur-xl'}`}>
      {/* Header (only for Modal) */}
      {!standalone && (
        <div className="bg-gradient-to-r from-cyan-600/90 to-blue-700/90 p-6 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Panduan Sektor & Industri</h2>
              <p className="text-cyan-100 text-sm mt-0.5 opacity-80">Klasifikasi lengkap industri saham Indonesia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/15 rounded-full transition-all duration-200 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="p-6 space-y-4 bg-slate-900/40 border-b border-slate-700/50">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Cari industri, kode saham, atau deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner hover:bg-slate-800"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {sectors.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSector(sec.id)}
              className={`px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 flex items-center gap-2 font-medium ${
                activeSector === sec.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              <span className="text-lg">{sec.icon}</span>
              {sec.name}
            </button>
          ))}
        </div>
      </div>

      {/* Industries List */}
      <div className={`overflow-y-auto p-6 custom-scrollbar ${standalone ? '' : 'max-h-[calc(90vh-320px)]'}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                <div className="absolute inset-0 blur-lg bg-cyan-500/20 animate-pulse"></div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Sinkronisasi data industri...</p>
          </div>
        ) : filteredIndustries.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-slate-300 text-xl font-semibold">Data Tidak Ditemukan</p>
            <p className="text-slate-500 text-sm mt-2">Gunakan kata kunci pencarian yang berbeda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredIndustries.map((item, index) => (
              <div
                key={index}
                className={`group border border-slate-700/50 rounded-3xl p-6 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-500 bg-slate-800/30 hover:bg-slate-800/50 relative overflow-hidden`}
              >
                {/* Decorative background element */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all duration-500"></div>

                {/* Header */}
                <div className="flex items-start justify-between mb-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-slate-600/50 group-hover:scale-110 transition-transform duration-500">
                        {item.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">{item.industry}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Sektor: {item.sector}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 mb-6 leading-relaxed text-sm font-medium border-l-2 border-cyan-500/30 pl-4">
                    {item.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Characteristics */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-cyan-500/50"></span>
                            Karakteristik
                        </h4>
                        <div className="space-y-2">
                            {(item.characteristics || []).map((char, i) => (
                                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-700/20 p-2 rounded-lg border border-slate-700/30">
                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-glow-cyan"></div>
                                    {char}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-blue-500/50"></span>
                            Metrik Utama
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {(item.keyMetrics || []).map((metric, i) => (
                                <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20 uppercase tracking-tighter">
                                    {metric}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Examples */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-4 h-0.5 bg-emerald-500/50"></span>
                    Contoh Emiten
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                    {(item.examples || []).map((example, i) => (
                      <div key={i} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-[11px] font-mono text-slate-200 hover:border-emerald-500/30 hover:bg-slate-900 transition-all truncate">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks & Opportunities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl relative overflow-hidden group/risk">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <h4 className="text-xs font-bold text-red-400 uppercase">Risiko</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">{item.risks}</p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl relative overflow-hidden group/opp">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-emerald-400 uppercase">Peluang</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">{item.opportunities}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-900/60 p-4 border-t border-slate-800 flex justify-between items-center px-8">
        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">
            Klasifikasi Sektor IDX 2024
        </p>
        <p className="text-slate-400 text-xs font-medium">
          Menampilkan <span className="text-cyan-400">{filteredIndustries.length}</span> dari <span className="text-slate-200">{industries.length}</span> industri
        </p>
      </div>
    </div>
  );

  if (standalone) return content;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-500 animate-in fade-in zoom-in-95">
      {content}
    </div>
  );
};

const fallbackIndustryData = [
  // PERBANKAN
  {
    sector: "Perbankan",
    industry: "Perbankan",
    description: "Lembaga keuangan yang menghimpun dana dari masyarakat dalam bentuk simpanan dan menyalurkannya kembali dalam bentuk kredit atau pinjaman.",
    characteristics: ["Highly regulated", "Sensitif terhadap suku bunga acuan", "Bisnis padat modal (Capital intensive)", "Mengandalkan pertumbuhan kredit"],
    keyMetrics: ["NIM (Net Interest Margin)", "NPL (Non-Performing Loan)", "LDR (Loan to Deposit Ratio)", "CAR (Capital Adequacy Ratio)", "ROA (Return on Assets)"],
    examples: ["BBCA - Bank Central Asia", "BBRI - Bank Rakyat Indonesia", "BMRI - Bank Mandiri", "BBNI - Bank Negara Indonesia"],
    risks: "Risiko peningkatan kredit macet (NPL), kenaikan suku bunga acuan yang menekan NIM, dan perlambatan pertumbuhan ekonomi makro.",
    opportunities: "Peningkatan penetrasi perbankan digital, perluasan kredit UMKM, dan pertumbuhan ekonomi nasional.",
    icon: "🏦"
  },
  // INFRASTRUKTUR
  {
    sector: "Infrastruktur",
    industry: "Telekomunikasi",
    description: "Penyedia infrastruktur jaringan komunikasi seluler, layanan data internet, fiber optik, dan infrastruktur penunjang telekomunikasi lainnya.",
    characteristics: ["Capex tinggi (Capital intensive)", "Pendapatan berulang (Recurring revenue)", "Persaingan tarif yang ketat", "Sensitif terhadap perubahan teknologi"],
    keyMetrics: ["ARPU (Average Revenue Per User)", "EBITDA Margin", "Churn Rate", "Capex to Revenue"],
    examples: ["TLKM - Telkom Indonesia", "ISAT - Indosat Ooredoo Hutchison", "EXCL - XL Axiata", "TOWR - Sarana Menara Nusantara"],
    risks: "Perang tarif antar-operator, tingginya biaya investasi teknologi baru (5G), serta depresiasi nilai tukar rupiah.",
    opportunities: "Kebutuhan konsumsi data internet yang terus meningkat, perluasan IoT, dan adopsi layanan komputasi awan (cloud).",
    icon: "📡"
  },
  {
    sector: "Infrastruktur",
    industry: "Konstruksi & Jalan Tol",
    description: "Perusahaan yang membangun infrastruktur sipil (jalan, jembatan, bandara) dan operator konsesi jalan tol berbayar.",
    characteristics: ["Investasi jangka panjang", "Leverage keuangan tinggi (banyak utang)", "Sangat bergantung pada anggaran belanja negara"],
    keyMetrics: ["Order Book (Kontrak Baru)", "Debt-to-Equity Ratio (DER)", "Traffic Volume (Volume Kendaraan)", "Gross Profit Margin"],
    examples: ["JSMR - Jasa Marga", "ADHI - Adhi Karya", "WIKA - Wijaya Karya", "PTPP - Pembangunan Perumahan"],
    risks: "Keterlambatan penyelesaian proyek, membengkaknya biaya konstruksi, beban bunga utang tinggi, dan penundaan pembebasan lahan.",
    opportunities: "Rencana pembangunan infrastruktur berkelanjutan dari pemerintah dan peningkatan konektivitas antar-wilayah.",
    icon: "🛣️"
  },
  // KONSUMER
  {
    sector: "Konsumer",
    industry: "Makanan & Minuman",
    description: "Produsen makanan olahan kemasan, produk susu, penyedap rasa, mie instan, dan minuman kemasan siap saji.",
    characteristics: ["Sektor defensif (stabil saat krisis)", "Kekuatan merek (Brand Equity)", "Jaringan distribusi yang luas"],
    keyMetrics: ["Gross Profit Margin", "Market Share", "Raw Material Cost Ratio", "Receivable Turnover"],
    examples: ["ICBP - Indofood CBP Sukses Makmur", "INDF - Indofood Sukses Makmur", "MYOR - Mayora Indah", "ROTI - Nippon Indosari Corpindo"],
    risks: "Kenaikan harga bahan baku komoditas impor (gandum, gula), pelemahan daya beli masyarakat, dan fluktuasi nilai tukar rupiah.",
    opportunities: "Inovasi produk sehat baru, ekspansi pangsa pasar ekspor, dan pertumbuhan populasi usia produktif.",
    icon: "🍔"
  },
  {
    sector: "Konsumer",
    industry: "Perdagangan Ritel",
    description: "Perusahaan perdagangan eceran modern yang menjual barang konsumsi sehari-hari, kebutuhan rumah tangga, pakaian, hingga kosmetik.",
    characteristics: ["Sensitif terhadap daya beli konsumen", "Manajemen inventori ketat", "Persaingan ketat dengan platform e-commerce"],
    keyMetrics: ["SSSG (Same Store Sales Growth)", "Inventory Turnover", "Gross Margin per Square Meter"],
    examples: ["AMRT - Sumber Alfaria Trijaya (Alfamart)", "ACES - Ace Hardware Indonesia", "MAPI - Mitra Adiperkasa", "LPPF - Matahari Department Store"],
    risks: "Pergeseran tren belanja konsumen ke online, peningkatan biaya sewa/operasional gerak fisik, serta inflasi tinggi.",
    opportunities: "Ekspansi jaringan gerai ke wilayah luar Jawa, integrasi digital omnichannel (online to offline), dan program loyalitas pelanggan.",
    icon: "🛒"
  },
  // PROPERTI & KONSTRUKSI
  {
    sector: "Properti & Konstruksi",
    industry: "Properti & Real Estate",
    description: "Perusahaan pengembang properti hunian (rumah tapak, apartemen), properti komersial (mal, perkantoran), dan kawasan industri.",
    characteristics: ["Siklus bisnis panjang (Cyclical)", "Sensitif terhadap tingkat suku bunga KPR", "Pengakuan pendapatan tertunda"],
    keyMetrics: ["Marketing Sales (Pra-penjualan)", "Interest Coverage Ratio", "Landbank Size (Cadangan Lahan)"],
    examples: ["BSDE - Bumi Serpong Damai", "PWON - Pakuwon Jati", "CTRA - Ciputra Development", "SMRA - Summarecon Agung"],
    risks: "Kenaikan suku bunga KPR, kelebihan pasokan properti di pasar, dan lambatnya pemulihan daya beli kelas menengah.",
    opportunities: "Insentif bebas PPN dari pemerintah, tingginya kebutuhan hunian pertama (backlog perumahan), dan ekspansi ke kota mandiri baru.",
    icon: "🏢"
  },
  // ENERGI & PERTAMBANGAN
  {
    sector: "Energi & Pertambangan",
    industry: "Pertambangan Batubara",
    description: "Eksplorasi, penambangan, pemrosesan, dan pemasaran batubara untuk kebutuhan pembangkit listrik dan metalurgi.",
    characteristics: ["Bisnis komoditas murni (Sangat siklikal)", "Sensitif harga batubara global", "Tuntutan transisi energi (ESG)"],
    keyMetrics: ["Production Volume", "Strip Ratio (Rasio kupas tanah)", "Average Selling Price (ASP)", "Cash Cost per Ton"],
    examples: ["ADRO - Adaro Energy", "PTBA - Bukit Asam", "ITMG - Indo Tambangraya Megah", "HRUM - Harum Energy"],
    risks: "Penurunan harga batubara global, kenaikan tarif royalti pemerintah, dan penurunan permintaan jangka panjang akibat transisi energi.",
    opportunities: "Permintaan energi yang masih kuat dari negara berkembang, dan diversifikasi korporasi ke bisnis energi terbarukan.",
    icon: "⛏️"
  },
  {
    sector: "Energi & Pertambangan",
    industry: "Pertambangan Logam & Mineral",
    description: "Eksplorasi dan pemrosesan komoditas mineral penting seperti nikel, emas, tembaga, bauksit, dan timah.",
    characteristics: ["Hilirisasi pertambangan (smelter)", "Sensitif terhadap harga logam LME", "Bahan baku teknologi masa depan"],
    keyMetrics: ["Ore Grade (Kadar bijih)", "Smelter Production Capacity", "All-In Sustaining Cost (AISC)"],
    examples: ["ANTM - Aneka Tambang", "INCO - Vale Indonesia", "MDKA - Merdeka Copper Gold", "TINS - Timah"],
    risks: "Larangan ekspor bijih mentah tambahan, perubahan harga komoditas dunia, serta tingginya biaya modal pembangunan smelter.",
    opportunities: "Tingginya permintaan nikel untuk bahan baku baterai kendaraan listrik (EV) global dan harga emas sebagai safe-haven saat inflasi.",
    icon: "💎"
  },
  // TEKNOLOGI
  {
    sector: "Teknologi",
    industry: "Teknologi & Jasa Digital",
    description: "Perusahaan penyedia platform e-commerce, transportasi on-demand, financial technology (fintech), dan integrator solusi IT.",
    characteristics: ["Valuasi berbasis pertumbuhan (Growth stock)", "Inovasi siklus cepat", "Asset light (minim aset fisik)"],
    keyMetrics: ["GTV (Gross Transaction Value)", "Take Rate (Komisi)", "Monthly Active Users (MAU)", "Contribution Margin"],
    examples: ["GOTO - GoTo Gojek Tokopedia", "BUKA - Bukalapak", "MTDL - Metrodata Electronics"],
    risks: "Persaingan ketat yang menuntut efisiensi biaya, regulasi ketat keamanan data, dan keterbatasan likuiditas pendanaan makro.",
    opportunities: "Adopsi AI untuk efisiensi bisnis, perluasan inklusi keuangan digital, dan tingkat penetrasi internet nasional yang masih tumbuh.",
    icon: "💻"
  },
  // KESEHATAN
  {
    sector: "Kesehatan",
    industry: "Farmasi",
    description: "Perusahaan yang memproduksi, meriset, dan mendistribusikan obat-obatan generik, obat herbal/tradisional, dan alat kesehatan.",
    characteristics: ["Defensive sector", "Sangat bergantung pada impor bahan baku aktif obat", "Sensitif nilai tukar mata uang asing"],
    keyMetrics: ["R&D to Sales Ratio", "Gross Profit Margin", "BPJS Product Contribution"],
    examples: ["KLBF - Kalbe Farma", "SIDO - Industri Jamu dan Farmasi Sido Muncul", "TSPC - Tempo Scan Pacific"],
    risks: "Ketergantungan impor bahan baku obat (API) yang mencapai >90%, penurunan margin akibat penetrasi obat generik BPJS murah.",
    opportunities: "Meningkatnya kesadaran kesehatan pasca-pandemi, pertumbuhan segmen suplemen herbal, dan potensi pasar ekspor.",
    icon: "💊"
  },
  {
    sector: "Kesehatan",
    industry: "Rumah Sakit",
    description: "Penyedia layanan medis kesehatan rawat jalan, rawat inap, fasilitas diagnostik, dan laboratorium.",
    characteristics: ["Investasi Capex pengembangan gedung tinggi", "Sangat bergantung pada ketersediaan dokter spesialis", "Siklus musiman penyakit"],
    keyMetrics: ["ARPOB (Average Revenue Per Occupied Bed)", "BOR (Bed Occupancy Ratio)", "ALOS (Average Length of Stay)"],
    examples: ["MIKA - Mitra Keluarga Karyasehat", "HEAL - Medikaloka Hermina", "SILO - Siloam International Hospitals"],
    risks: "Kelangkaan tenaga medis spesialis di daerah, regulasi tarif klaim BPJS Kesehatan, dan risiko klaim malpraktik medis.",
    opportunities: "Pertumbuhan kelas menengah yang memiliki asuransi kesehatan swasta, dan perluasan jaringan rumah sakit di kota tier-2/3.",
    icon: "🏥"
  },
  // TRANSPORTASI
  {
    sector: "Transportasi",
    industry: "Logistik & Pelayaran",
    description: "Jasa transportasi logistik darat, pengiriman paket kilat, pengangkutan kontainer laut, dan sewa kapal komoditas.",
    characteristics: ["Sangat bergantung pada volume perdagangan nasional", "Sensitif harga bahan bakar minyak (BBM)", "Siklikal mengikuti indeks sewa kapal global"],
    keyMetrics: ["Charter Rate (Tarif sewa kapal)", "Fuel Cost Ratio", "Utilization Rate (Tingkat keterisian)"],
    examples: ["TMAS - Temas", "SMDR - Samudera Indonesia", "BIRD - Blue Bird", "ASSA - Adi Sarana Armada"],
    risks: "Kenaikan harga BBM industri, kemacetan rute distribusi logistik, serta penurunan volume perdagangan ekspor-impor.",
    opportunities: "Pertumbuhan logistik e-commerce yang pesat, proyek tol laut pemerintah, dan peningkatan rute distribusi maritim.",
    icon: "✈️"
  },
  // AGRIKULTUR
  {
    sector: "Agrikultur",
    industry: "Perkebunan Kelapa Sawit",
    description: "Pembudidayaan kelapa sawit dan pengolahan Crude Palm Oil (CPO) beserta produk hilir turunannya.",
    characteristics: ["Bisnis siklikal", "Dipengaruhi cuaca ekstrem (El Nino/La Nina)", "Padat karya", "Sensitif harga minyak nabati global"],
    keyMetrics: ["FFB Yield (Tandan Buah Segar per Hektar)", "OER (Oil Extraction Rate / Kadar rendemen)", "CPO Price Realization"],
    examples: ["AALI - Astra Agro Lestari", "LSIP - PP London Sumatra Indonesia", "TAPG - Triputra Agro Persada", "DSNG - Dharma Satya Nusantara"],
    risks: "Kebijakan pungutan ekspor, kampanye hitam isu lingkungan (ESG) di Uni Eropa, serta penurunan harga CPO global.",
    opportunities: "Mandatori biodiesel domestik pemerintah (B35/B40) sebagai penopang harga lokal dan meningkatnya permintaan minyak nabati dunia.",
    icon: "🌾"
  },
  // MEDIA
  {
    sector: "Media",
    industry: "Media & Penyiaran",
    description: "Stasiun penyiaran televisi free-to-air, rumah produksi konten digital, portal berita online, dan agensi periklanan.",
    characteristics: ["Sangat dipengaruhi anggaran belanja iklan (Adex)", "Migrasi penonton ke platform digital (YouTube, TikTok)", "Sensitif siklus politik/pemilu"],
    keyMetrics: ["Audience Share (Pangsa penonton)", "Digital Ad Revenue Growth", "Content Library Value"],
    examples: ["MNCN - Media Nusantara Citra", "SCMA - Surya Citra Media"],
    risks: "Penurunan belanja iklan di TV konvensional, tingginya biaya transisi siaran digital (ASO), dan dominasi platform iklan digital global.",
    opportunities: "Monetisasi konten melalui aplikasi streaming lokal (OTT) mandiri dan lonjakan iklan kampanye politik.",
    icon: "📺"
  }
];

export default IndustryGuide;
