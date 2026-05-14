import React, { useState } from 'react';
import { BookOpen, TrendingUp, Shield, Target, AlertTriangle, ChevronDown, ChevronUp, Lightbulb, BarChart2, DollarSign, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const tips = [
  {
    category: "Dasar Investasi",
    icon: <BookOpen size={20} className="text-blue-400" />,
    color: "blue",
    items: [
      {
        title: "Apa itu saham?",
        content: "Saham adalah bukti kepemilikan Anda di sebuah perusahaan. Ketika Anda membeli saham BBCA misalnya, Anda menjadi pemilik sebagian kecil dari Bank BCA. Keuntungan dari saham ada dua: kenaikan harga saham (capital gain) dan pembagian keuntungan perusahaan (dividen)."
      },
      {
        title: "Berapa modal awal yang dibutuhkan?",
        content: "Di Indonesia, Anda bisa mulai berinvestasi saham dengan modal sangat kecil. 1 lot = 100 lembar saham. Jika harga saham Rp 500/lembar, maka 1 lot = Rp 50.000. Mulailah dari yang Anda mampu, tidak perlu langsung besar."
      },
      {
        title: "Kapan waktu terbaik membeli saham?",
        content: "Tidak ada waktu yang sempurna. Yang penting adalah konsistensi. Strategi 'Dollar Cost Averaging' (beli rutin setiap bulan dalam jumlah sama) terbukti efektif untuk investor jangka panjang karena merata-rata harga beli."
      },
      {
        title: "Apa perbedaan trading dan investing?",
        content: "Trading = beli-jual jangka pendek (harian/mingguan), butuh waktu intensif dan analisis teknikal. Investing = beli dan tahan jangka panjang (tahunan), fokus pada fundamental perusahaan. Untuk pemula, investing jangka panjang lebih direkomendasikan."
      }
    ]
  },
  {
    category: "Analisis Fundamental",
    icon: <BarChart2 size={20} className="text-purple-400" />,
    color: "purple",
    items: [
      {
        title: "Apa itu P/E Ratio dan kenapa penting?",
        content: "Price-to-Earnings (P/E) Ratio = harga saham dibagi laba per saham. P/E rendah (< 15) bisa berarti saham murah secara historis. P/E tinggi (> 30) mungkin saham sudah mahal. Namun bandingkan selalu dengan P/E rata-rata sektornya, bukan angka mutlak."
      },
      {
        title: "Cara baca laporan keuangan sederhana",
        content: "Fokus pada 3 hal utama: (1) Revenue - apakah pendapatan tumbuh tiap tahun? (2) Net Profit Margin - berapa persen keuntungan dari pendapatan? (3) DER (Debt-to-Equity Ratio) - apakah utang tidak terlalu besar? Hutang DER < 1 umumnya lebih aman."
      },
      {
        title: "Apa itu ROE dan mengapa penting?",
        content: "Return on Equity (ROE) = kemampuan perusahaan menghasilkan laba dari modal sendiri. ROE > 15% menunjukkan perusahaan yang efisien dalam menggunakan modal. Semakin tinggi dan stabil ROE-nya, semakin baik kualitas perusahaan tersebut."
      }
    ]
  },
  {
    category: "Manajemen Risiko",
    icon: <Shield size={20} className="text-green-400" />,
    color: "green",
    items: [
      {
        title: "Aturan 5%: Jangan menaruh semua telur dalam satu keranjang",
        content: "Maksimal alokasikan 5-10% dari total portofolio untuk satu saham. Dengan diversifikasi ke 10-15 saham berbeda dari sektor yang berbeda, risiko kerugian besar dari satu saham dapat diminimalisir secara signifikan."
      },
      {
        title: "Stop Loss: Batasi kerugian Anda",
        content: "Tentukan batas kerugian maksimal sebelum membeli. Contoh: 'Jika saham ini turun 7% dari harga beli, saya akan jual.' Disiplin menjalankan stop loss adalah perbedaan antara trader yang bertahan dan yang tidak."
      },
      {
        title: "Investasikan hanya uang yang tidak dibutuhkan",
        content: "Jangan investasikan: dana darurat (3-6 bulan pengeluaran), uang untuk kebutuhan 1-2 tahun ke depan, atau uang pinjaman. Investasi saham ideal untuk uang yang bisa Anda 'lupakan' selama 3-5 tahun ke depan."
      },
      {
        title: "Kenali psikologi investasi Anda",
        content: "FOMO (Fear of Missing Out) dan panik saat harga turun adalah musuh terbesar investor. Buat rencana investasi yang jelas sebelum membeli, dan patuhi rencana tersebut. Emosi adalah faktor kerugian terbesar di pasar saham."
      }
    ]
  },
  {
    category: "Tips Praktis Ritel",
    icon: <Target size={20} className="text-orange-400" />,
    color: "orange",
    items: [
      {
        title: "Beli saham blue chip dulu untuk pemula",
        content: "Blue chip (BBCA, BBRI, TLKM, ASII, BMRI) adalah saham perusahaan besar dengan fundamental kuat. Lebih stabil, likuiditas tinggi, dan banyak analisis tersedia. Ideal untuk belajar sambil berinvestasi dengan risiko relatif lebih terkontrol."
      },
      {
        title: "Gunakan fitur auto-invest di aplikasi",
        content: "Banyak aplikasi sekuritas (IPOT, Stockbit, Bibit) menawarkan fitur investasi rutin otomatis. Manfaatkan fitur ini untuk membangun kebiasaan investasi tanpa perlu memantau pasar setiap hari."
      },
      {
        title: "Pantau laporan keuangan kuartalan",
        content: "Perusahaan tbk wajib merilis laporan keuangan tiap 3 bulan. Jadikan momen ini untuk mengevaluasi apakah perusahaan yang Anda miliki masih sesuai ekspektasi. Jangan asal jual hanya karena harga turun jika fundamentalnya masih baik."
      },
      {
        title: "Waspadai saham gorengan",
        content: "Saham dengan volume tiba-tiba melonjak drastis, harga naik ratusan persen dalam hitungan hari, dan tidak ada berita fundamentalnya, patut dicurigai. Ini sering merupakan pola pump-and-dump yang merugikan investor ritel."
      }
    ]
  },
  {
    category: "Mindset & Jangka Panjang",
    icon: <Clock size={20} className="text-cyan-400" />,
    color: "cyan",
    items: [
      {
        title: "Kekuatan compound interest (bunga berbunga)",
        content: "Investasi Rp 1.000.000/bulan dengan return rata-rata 12%/tahun, dalam 20 tahun bisa menjadi sekitar Rp 960 juta. Waktu adalah aset terbesar investor. Mulai lebih awal, bahkan dengan nominal kecil, jauh lebih baik daripada menunggu jumlah yang 'cukup'."
      },
      {
        title: "Pasar selalu pulih dalam jangka panjang",
        content: "IHSG pernah crash saat krisis 1998, 2008, dan 2020. Namun setiap kali, pasar selalu pulih dan mencapai rekor baru. Investor yang panik dan jual di harga terendah adalah yang paling rugi. Tetap tenang dan investasi rutin saat market turun justru peluang."
      },
      {
        title: "Belajar terus, tapi jangan analysis paralysis",
        content: "Belajar tentang investasi itu penting, tapi jangan sampai terlalu banyak belajar malah tidak berani mulai. Mulailah dengan nominal kecil sambil terus belajar. Pengalaman nyata di pasar adalah guru terbaik."
      }
    ]
  }
];

const AccordionItem = ({ item, isOpen, onToggle, colorClass }) => (
  <div className={`border border-gray-700/50 rounded-xl overflow-hidden transition-all`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/40 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Lightbulb size={14} className={`text-${colorClass}-400 flex-shrink-0`} />
        <span className="text-sm font-medium text-gray-200">{item.title}</span>
      </div>
      {isOpen ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
    </button>
    {isOpen && (
      <div className="px-4 pb-4">
        <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-gray-600 pl-3">
          {item.content}
        </p>
      </div>
    )}
  </div>
);

const PembelajaranRitelPage = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const colorMap = { blue: 'blue', purple: 'purple', green: 'green', orange: 'orange', cyan: 'cyan' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] text-gray-100">
      <Navbar />

      {/* Header */}
      <div className="bg-slate-900/30 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl shadow-lg shadow-emerald-500/20">
            <BookOpen className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Pembelajaran Ritel</h1>
            <p className="text-sm text-gray-400">Panduan investasi saham untuk investor ritel Indonesia</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-amber-900/20 border border-amber-500/40 rounded-xl">
          <AlertTriangle className="text-amber-400 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm text-amber-300/90 leading-relaxed">
            <strong>⚠️ Disclaimer Penting:</strong> Konten ini bersifat edukatif dan <strong>bukan merupakan rekomendasi investasi atau saran keuangan</strong>. Keputusan investasi sepenuhnya tanggung jawab Anda. Selalu konsultasikan dengan penasihat keuangan berlisensi (CFP/WMI) sebelum mengambil keputusan investasi yang signifikan.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <DollarSign size={16} />, label: 'Modal Minimum', value: '~Rp 50rb', color: 'green' },
            { icon: <Clock size={16} />, label: 'Jam Bursa', value: '09:00-15:00', color: 'blue' },
            { icon: <TrendingUp size={16} />, label: 'Return Historis', value: '~10-15%/th', color: 'purple' },
            { icon: <Shield size={16} />, label: 'Dijamin OJK', value: 'Hingga 2M', color: 'orange' },
          ].map((stat, i) => (
            <div key={i} className={`p-3 bg-${stat.color}-900/20 border border-${stat.color}-500/30 rounded-xl text-center`}>
              <div className={`text-${stat.color}-400 flex justify-center mb-1`}>{stat.icon}</div>
              <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
              <p className={`text-sm font-bold text-${stat.color}-400`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tips Sections */}
        {tips.map((section, catIdx) => (
          <div key={catIdx} className="bg-gray-900/40 border border-gray-700/40 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-700/40">
              {section.icon}
              <h2 className="text-base font-bold text-white">{section.category}</h2>
              <span className="ml-auto text-xs text-gray-500">{section.items.length} topik</span>
            </div>
            <div className="p-3 space-y-2">
              {section.items.map((item, itemIdx) => (
                <AccordionItem
                  key={itemIdx}
                  item={item}
                  isOpen={!!openItems[`${catIdx}-${itemIdx}`]}
                  onToggle={() => toggleItem(catIdx, itemIdx)}
                  colorClass={colorMap[section.color]}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Footer Note */}
        <div className="p-4 bg-gray-800/30 border border-gray-700/40 rounded-xl text-center">
          <p className="text-sm text-gray-400">
            📚 Ingin belajar lebih dalam? Cek <strong className="text-blue-400">Glosarium</strong> untuk memahami istilah-istilah saham, atau gunakan <strong className="text-purple-400">Analyst AI</strong> untuk analisis saham spesifik.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PembelajaranRitelPage;
