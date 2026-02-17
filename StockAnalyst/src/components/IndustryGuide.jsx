import React, { useState } from 'react';
import { Building2, Search, X, TrendingUp, TrendingDown } from 'lucide-react';

const IndustryGuide = ({ isOpen, onClose, standalone = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSector, setActiveSector] = useState('all');

  const industryData = [
    // PERBANKAN
    {
      sector: "Perbankan",
      industry: "Bank",
      description: "Lembaga keuangan yang menghimpun dana dan menyalurkan kredit kepada masyarakat.",
      characteristics: [
        "Asset heavy business",
        "Highly regulated",
        "Margin berbasis spread bunga",
        "Risiko kredit macet (NPL)"
      ],
      keyMetrics: ["NIM", "NPL", "LDR", "ROA", "CAR"],
      examples: ["BBCA - Bank Central Asia", "BBRI - Bank Rakyat Indonesia", "BMRI - Bank Mandiri", "BBNI - Bank Negara Indonesia"],
      risks: "Risiko ekonomi makro, suku bunga, kredit macet",
      opportunities: "Pertumbuhan ekonomi, digitalisasi perbankan",
      icon: "🏦",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    },
    {
      sector: "Perbankan",
      industry: "Bank Syariah",
      description: "Bank yang beroperasi berdasarkan prinsip syariah Islam tanpa sistem bunga.",
      characteristics: [
        "Sistem bagi hasil",
        "Tanpa riba",
        "Produk berbasis akad syariah",
        "Pengawasan Dewan Syariah"
      ],
      keyMetrics: ["Margin Bagi Hasil", "NPF", "FDR", "ROA"],
      examples: ["BRIS - Bank Syariah Indonesia"],
      risks: "Kompetisi dengan bank konvensional, literasi syariah",
      opportunities: "Populasi muslim terbesar, tren halal economy",
      icon: "🕌",
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    },

    // TELEKOMUNIKASI
    {
      sector: "Infrastruktur",
      industry: "Telekomunikasi",
      description: "Penyedia layanan komunikasi data, suara, dan internet.",
      characteristics: [
        "Capital intensive",
        "Network effect",
        "Recurring revenue",
        "Margin tinggi setelah infrastruktur terbangun"
      ],
      keyMetrics: ["ARPU", "Subscriber Growth", "Churn Rate", "EBITDA Margin"],
      examples: ["TLKM - Telkom Indonesia", "EXCL - XL Axiata", "ISAT - Indosat"],
      risks: "Teknologi obsolete, kompetisi harga, regulasi tarif",
      opportunities: "5G rollout, IoT, cloud services, digitalisasi",
      icon: "📡",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
    },

    // CONSUMER GOODS
    {
      sector: "Konsumer",
      industry: "Makanan & Minuman",
      description: "Produsen produk makanan dan minuman konsumer.",
      characteristics: [
        "Brand loyalty tinggi",
        "Defensive stock",
        "Distribution network luas",
        "Margin stabil"
      ],
      keyMetrics: ["Market Share", "Distribution Coverage", "Gross Margin", "Brand Value"],
      examples: ["ICBP - Indofood CBP", "INDF - Indofood Sukses Makmur", "MYOR - Mayora"],
      risks: "Harga komoditas bahan baku, kompetisi brand",
      opportunities: "Pertumbuhan kelas menengah, ekspor, inovasi produk",
      icon: "🍔",
      color: "bg-orange-500/20 text-orange-400 border-orange-500/30"
    },
    {
      sector: "Konsumer",
      industry: "Rokok",
      description: "Produsen produk tembakau dan rokok.",
      characteristics: [
        "Cash cow",
        "Dividend yield tinggi",
        "Regulasi ketat",
        "Pricing power kuat"
      ],
      keyMetrics: ["Volume Sales", "Market Share", "Excise Tax Impact", "Dividend Yield"],
      examples: ["HMSP - HM Sampoerna", "GGRM - Gudang Garam", "RMBA - Bentoel"],
      risks: "Regulasi cukai, kampanye anti-rokok, ESG concerns",
      opportunities: "Captive market, ekspor, diversifikasi bisnis",
      icon: "🚬",
      color: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    },
    {
      sector: "Konsumer",
      industry: "Retail",
      description: "Pengecer produk konsumer baik offline maupun online.",
      characteristics: [
        "Omnichannel strategy",
        "Inventory turnover penting",
        "Lokasi strategis",
        "Customer loyalty program"
      ],
      keyMetrics: ["Same Store Sales Growth", "Inventory Turnover", "Gross Margin", "Foot Traffic"],
      examples: ["AMRT - Sumber Alfaria Trijaya", "MAPI - Mitra Adiperkasa"],
      risks: "E-commerce disruption, persaingan harga, lokasi",
      opportunities: "Ekspansi gerai, digital transformation, private label",
      icon: "🛒",
      color: "bg-pink-500/20 text-pink-400 border-pink-500/30"
    },

    // PROPERTI & KONSTRUKSI
    {
      sector: "Properti & Konstruksi",
      industry: "Properti",
      description: "Pengembang properti residensial dan komersial.",
      characteristics: [
        "Cyclical business",
        "Asset intensive",
        "Leverage tinggi",
        "Pre-sales sebagai leading indicator"
      ],
      keyMetrics: ["Marketing Sales", "Net Debt to Equity", "Inventory Turnover", "ROE"],
      examples: ["BSDE - Bumi Serpong Damai", "CTRA - Ciputra Development"],
      risks: "Suku bunga, oversupply, regulasi, sentiment ekonomi",
      opportunities: "Urbanisasi, KPR subsidi, demand residensial",
      icon: "🏢",
      color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
    },
    {
      sector: "Properti & Konstruksi",
      industry: "Konstruksi",
      description: "Kontraktor infrastruktur dan bangunan.",
      characteristics: [
        "Project-based revenue",
        "Orderbook sebagai backlog",
        "Working capital intensive",
        "Margin tipis, volume tinggi"
      ],
      keyMetrics: ["Orderbook", "Gross Margin", "Revenue Recognition", "Contract Wins"],
      examples: ["WIKA - Wijaya Karya", "WSKT - Waskita Karya", "PTPP - PP Persero"],
      risks: "Keterlambatan proyek, cost overrun, payment delay",
      opportunities: "Infrastruktur pemerintah, IKN, PPP projects",
      icon: "🏗️",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    },

    // ENERGI & PERTAMBANGAN
    {
      sector: "Energi & Pertambangan",
      industry: "Batubara",
      description: "Penambangan dan penjualan batubara thermal dan metalurgi.",
      characteristics: [
        "Commodity price driven",
        "Export oriented",
        "High dividend payout",
        "Cyclical"
      ],
      keyMetrics: ["Production Volume", "Coal Price", "Cash Cost", "Stripping Ratio"],
      examples: ["PTBA - Bukit Asam", "ADRO - Adaro Energy", "ITMG - Indo Tambangraya"],
      risks: "Harga komoditas, ESG, transisi energi, regulasi DMO",
      opportunities: "Demand Asia, harga batubara tinggi, diversifikasi energi",
      icon: "⛏️",
      color: "bg-stone-500/20 text-stone-400 border-stone-500/30"
    },
    {
      sector: "Energi & Pertambangan",
      industry: "Minyak & Gas",
      description: "Eksplorasi, produksi, dan distribusi minyak dan gas bumi.",
      characteristics: [
        "Capital intensive",
        "Long-term contracts",
        "Government partnership",
        "Strategic sector"
      ],
      keyMetrics: ["Production Volume", "Lifting Cost", "Reserve Replacement", "Oil Price"],
      examples: ["PGAS - Perusahaan Gas Negara", "MEDC - Medco Energi"],
      risks: "Harga minyak, deplesi cadangan, regulasi harga",
      opportunities: "Demand energi, pengembangan lapangan baru, LNG export",
      icon: "🛢️",
      color: "bg-red-500/20 text-red-400 border-red-500/30"
    },
    {
      sector: "Energi & Pertambangan",
      industry: "Nikel & Mineral",
      description: "Penambangan nikel, tembaga, dan mineral lainnya.",
      characteristics: [
        "EV supply chain",
        "Vertical integration",
        "Processing value-add",
        "Export ban impact"
      ],
      keyMetrics: ["Nickel Price", "Production Volume", "Processing Capacity", "EBITDA/ton"],
      examples: ["INCO - Vale Indonesia", "ANTM - Aneka Tambang", "TINS - Timah"],
      risks: "Harga nikel volatile, regulasi export, smelter capacity",
      opportunities: "EV boom, battery industry, hilirisasi, China demand",
      icon: "⚙️",
      color: "bg-slate-500/20 text-slate-400 border-slate-500/30"
    },

    // TEKNOLOGI
    {
      sector: "Teknologi",
      industry: "E-Commerce & Platform",
      description: "Platform digital marketplace dan teknologi konsumer.",
      characteristics: [
        "Network effect",
        "Cash burn untuk growth",
        "GMV sebagai metric",
        "High growth potential"
      ],
      keyMetrics: ["GMV", "Take Rate", "MAU/DAU", "Order Frequency", "Burn Rate"],
      examples: ["GOTO - GoTo Gojek Tokopedia", "BUKA - Bukalapak"],
      risks: "Profitabilitas, kompetisi, regulasi platform",
      opportunities: "Digital economy growth, super app ecosystem",
      icon: "💻",
      color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
    },
    {
      sector: "Teknologi",
      industry: "Fintech & Digital Banking",
      description: "Layanan keuangan digital dan payment gateway.",
      characteristics: [
        "Disruption model",
        "Tech-driven",
        "Regulasi sandbox",
        "Partnership strategy"
      ],
      keyMetrics: ["Transaction Volume", "TPV", "User Growth", "Transaction Fee"],
      examples: ["ARTO - Bank Jago", "BBYB - Bank Neo Commerce"],
      risks: "Regulasi OJK, cybersecurity, kompetisi bank incumbent",
      opportunities: "Financial inclusion, cashless society, embedded finance",
      icon: "💳",
      color: "bg-teal-500/20 text-teal-400 border-teal-500/30"
    },

    // KESEHATAN
    {
      sector: "Kesehatan",
      industry: "Farmasi",
      description: "Produsen obat-obatan dan produk farmasi.",
      characteristics: [
        "Defensive sector",
        "R&D intensive",
        "Patent protection",
        "Government tender"
      ],
      keyMetrics: ["Revenue Growth", "R&D Spending", "Product Pipeline", "Market Share"],
      examples: ["KLBF - Kalbe Farma", "KAEF - Kimia Farma"],
      risks: "Generic competition, regulasi harga, patent expiry",
      opportunities: "Aging population, healthcare awareness, export",
      icon: "💊",
      color: "bg-green-500/20 text-green-400 border-green-500/30"
    },
    {
      sector: "Kesehatan",
      industry: "Rumah Sakit",
      description: "Operator jaringan rumah sakit dan layanan kesehatan.",
      characteristics: [
        "Recurring revenue",
        "Bed occupancy rate",
        "BPJS vs retail mix",
        "Network expansion"
      ],
      keyMetrics: ["Bed Occupancy Rate", "Revenue Per Bed", "Patient Growth", "EBITDA Margin"],
      examples: ["HEAL - Medikaloka Hermina", "SILO - Siloam Hospitals"],
      risks: "Regulasi BPJS, doctor availability, operating cost",
      opportunities: "Healthcare demand, medical tourism, specialist services",
      icon: "🏥",
      color: "bg-red-500/20 text-red-400 border-red-500/30"
    },

    // TRANSPORTASI & LOGISTIK
    {
      sector: "Transportasi",
      industry: "Airlines",
      description: "Maskapai penerbangan penumpang dan kargo.",
      characteristics: [
        "High operating leverage",
        "Fuel cost sensitive",
        "Seasonal demand",
        "Load factor critical"
      ],
      keyMetrics: ["Load Factor", "RASK", "CASK", "Fleet Utilization", "On-Time Performance"],
      examples: ["BIRD - Blue Bird"],
      risks: "Harga avtur, kompetisi harga, safety incident",
      opportunities: "Tourism recovery, domestic travel growth, cargo",
      icon: "✈️",
      color: "bg-sky-500/20 text-sky-400 border-sky-500/30"
    },
    {
      sector: "Transportasi",
      industry: "Logistik",
      description: "Layanan pengiriman barang dan supply chain.",
      characteristics: [
        "E-commerce driven",
        "Network density",
        "Last-mile delivery",
        "Technology integration"
      ],
      keyMetrics: ["Shipment Volume", "Delivery Success Rate", "Revenue Per Shipment", "Network Coverage"],
      examples: ["ASSA - Adi Sarana Armada"],
      risks: "Kompetisi harga, fuel cost, driver shortage",
      opportunities: "E-commerce boom, cold chain, fulfillment services",
      icon: "📦",
      color: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    },

    // AGRIKULTUR
    {
      sector: "Agrikultur",
      industry: "Perkebunan Kelapa Sawit",
      description: "Perkebunan dan pengolahan kelapa sawit (CPO).",
      characteristics: [
        "CPO price driven",
        "Plantation maturity profile",
        "Sustainability certification",
        "Vertical integration"
      ],
      keyMetrics: ["CPO Price", "FFB Production", "Oil Extraction Rate", "Planted Area"],
      examples: ["AALI - Astra Agro Lestari"],
      risks: "CPO price, export levy, ESG, labor cost",
      opportunities: "Biodiesel demand, CPO premium, downstream products",
      icon: "🌴",
      color: "bg-lime-500/20 text-lime-400 border-lime-500/30"
    },
    {
      sector: "Agrikultur",
      industry: "Peternakan",
      description: "Budidaya ayam, feed mill, dan produk protein hewani.",
      characteristics: [
        "Integrated business model",
        "Feed-farm-food chain",
        "Price volatility",
        "Disease risk"
      ],
      keyMetrics: ["DOC Production", "Feed Conversion Ratio", "ASP", "Margin Per Kg"],
      examples: ["JPFA - Japfa Comfeed", "CPIN - Charoen Pokphand"],
      risks: "Corn/soybean price, disease outbreak, oversupply",
      opportunities: "Protein consumption growth, export market, integration",
      icon: "🐔",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    },

    // MEDIA & ENTERTAINMENT
    {
      sector: "Media",
      industry: "Media & Broadcasting",
      description: "Stasiun TV, konten digital, dan media entertainment.",
      characteristics: [
        "Ad revenue based",
        "Content is king",
        "Rating competition",
        "Digital transformation"
      ],
      keyMetrics: ["Ad Revenue", "Rating Share", "Digital Subscriber", "Content Library Value"],
      examples: ["SCMA - Surya Citra Media", "EMTK - Elang Mahkota Teknologi"],
      risks: "Ad spending cyclical, digital disruption, content cost",
      opportunities: "OTT services, digital advertising, content monetization",
      icon: "📺",
      color: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30"
    }
  ];

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

  const filteredIndustries = industryData.filter(item => {
    const matchesSearch =
      item.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.examples.some(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSector = activeSector === 'all' || item.sector === activeSector;
    return matchesSearch && matchesSector;
  });

  // For standalone mode, don't check isOpen
  if (!standalone && !isOpen) return null;

  const content = (
    <>
      {/* Header - only show in modal mode */}
      {!standalone && (
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Panduan Sektor & Industri</h2>
              <p className="text-blue-100 text-sm mt-1">Klasifikasi lengkap industri saham Indonesia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari industri atau kode saham..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Sector Filter */}
      <div className="p-4 border-b border-slate-700 overflow-x-auto">
        <div className="flex gap-2">
          {sectors.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSector(sec.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeSector === sec.id
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
            >
              <span className="mr-2">{sec.icon}</span>
              {sec.name}
            </button>
          ))}
        </div>
      </div>

      {/* Industries List */}
      <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 280px)' }}>
        {filteredIndustries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Tidak ada industri yang ditemukan</p>
            <p className="text-slate-500 text-sm mt-2">Coba kata kunci lain</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredIndustries.map((item, index) => (
              <div
                key={index}
                className={`border rounded-xl p-5 hover:shadow-xl transition-all ${item.color}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{item.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold">{item.industry}</h3>
                      <p className="text-sm text-slate-400">{item.sector}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 mb-4 leading-relaxed">{item.description}</p>

                {/* Characteristics */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">📋 Karakteristik:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {item.characteristics.map((char, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">📊 Metrik Utama:</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.keyMetrics.map((metric, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-800/70 text-slate-300 text-xs rounded-full border border-slate-600">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Examples */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">💼 Contoh Emiten:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.examples.map((example, i) => (
                      <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks & Opportunities */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <h4 className="text-sm font-semibold text-red-400">Risiko</h4>
                    </div>
                    <p className="text-xs text-slate-300">{item.risks}</p>
                  </div>
                  <div className="bg-green-900/20 border-l-4 border-green-500 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <h4 className="text-sm font-semibold text-green-400">Peluang</h4>
                    </div>
                    <p className="text-xs text-slate-300">{item.opportunities}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-800 p-4 border-t border-slate-700">
        <p className="text-center text-slate-400 text-sm">
          🏭 Total {filteredIndustries.length} dari {industryData.length} industri ditampilkan
        </p>
      </div>
    </>
  );

  // Standalone mode: return content without modal wrapper
  if (standalone) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full overflow-hidden border border-slate-700">
        {content}
      </div>
    );
  }

  // Modal mode: return content with modal wrapper
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700">
        {content}
      </div>
    </div>
  );
};

export default IndustryGuide;
