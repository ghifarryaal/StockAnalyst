// Mapping kode saham ke sektor dan industri
export const stockIndustryMap = {
  // PERBANKAN
  'BBCA': { sector: 'Perbankan', industry: 'Bank', icon: '🏦', color: 'bg-blue-500/20 text-blue-400' },
  'BBRI': { sector: 'Perbankan', industry: 'Bank', icon: '🏦', color: 'bg-blue-500/20 text-blue-400' },
  'BMRI': { sector: 'Perbankan', industry: 'Bank', icon: '🏦', color: 'bg-blue-500/20 text-blue-400' },
  'BBNI': { sector: 'Perbankan', industry: 'Bank', icon: '🏦', color: 'bg-blue-500/20 text-blue-400' },
  'BRIS': { sector: 'Perbankan', industry: 'Bank Syariah', icon: '🕌', color: 'bg-emerald-500/20 text-emerald-400' },
  'BBTN': { sector: 'Perbankan', industry: 'Bank', icon: '🏦', color: 'bg-blue-500/20 text-blue-400' },
  'MEGA': { sector: 'Perbankan', industry: 'Bank', icon: '🏦', color: 'bg-blue-500/20 text-blue-400' },
  'BTPS': { sector: 'Perbankan', industry: 'Bank', icon: '🏦', color: 'bg-blue-500/20 text-blue-400' },
  'BNGA': { sector: 'Perbankan', industry: 'Bank', icon: '🏦', color: 'bg-blue-500/20 text-blue-400' },
  
  // TELEKOMUNIKASI
  'TLKM': { sector: 'Infrastruktur', industry: 'Telekomunikasi', icon: '📡', color: 'bg-purple-500/20 text-purple-400' },
  'EXCL': { sector: 'Infrastruktur', industry: 'Telekomunikasi', icon: '📡', color: 'bg-purple-500/20 text-purple-400' },
  'ISAT': { sector: 'Infrastruktur', industry: 'Telekomunikasi', icon: '📡', color: 'bg-purple-500/20 text-purple-400' },
  'FREN': { sector: 'Infrastruktur', industry: 'Telekomunikasi', icon: '📡', color: 'bg-purple-500/20 text-purple-400' },
  
  // CONSUMER GOODS - Food & Beverage
  'ICBP': { sector: 'Konsumer', industry: 'Makanan & Minuman', icon: '🍔', color: 'bg-orange-500/20 text-orange-400' },
  'INDF': { sector: 'Konsumer', industry: 'Makanan & Minuman', icon: '🍔', color: 'bg-orange-500/20 text-orange-400' },
  'MYOR': { sector: 'Konsumer', industry: 'Makanan & Minuman', icon: '🍔', color: 'bg-orange-500/20 text-orange-400' },
  'ROTI': { sector: 'Konsumer', industry: 'Makanan & Minuman', icon: '🍔', color: 'bg-orange-500/20 text-orange-400' },
  'MLBI': { sector: 'Konsumer', industry: 'Makanan & Minuman', icon: '🍔', color: 'bg-orange-500/20 text-orange-400' },
  'ULTJ': { sector: 'Konsumer', industry: 'Makanan & Minuman', icon: '🍔', color: 'bg-orange-500/20 text-orange-400' },
  
  // CONSUMER GOODS - Tobacco
  'HMSP': { sector: 'Konsumer', industry: 'Rokok', icon: '🚬', color: 'bg-gray-500/20 text-gray-400' },
  'GGRM': { sector: 'Konsumer', industry: 'Rokok', icon: '🚬', color: 'bg-gray-500/20 text-gray-400' },
  'RMBA': { sector: 'Konsumer', industry: 'Rokok', icon: '🚬', color: 'bg-gray-500/20 text-gray-400' },
  'WIIM': { sector: 'Konsumer', industry: 'Rokok', icon: '🚬', color: 'bg-gray-500/20 text-gray-400' },
  
  // CONSUMER GOODS - Retail
  'AMRT': { sector: 'Konsumer', industry: 'Retail', icon: '🛒', color: 'bg-pink-500/20 text-pink-400' },
  'MAPI': { sector: 'Konsumer', industry: 'Retail', icon: '🛒', color: 'bg-pink-500/20 text-pink-400' },
  'ACES': { sector: 'Konsumer', industry: 'Retail', icon: '🛒', color: 'bg-pink-500/20 text-pink-400' },
  'ERAA': { sector: 'Konsumer', industry: 'Retail', icon: '🛒', color: 'bg-pink-500/20 text-pink-400' },
  
  // PROPERTY
  'BSDE': { sector: 'Properti & Konstruksi', industry: 'Properti', icon: '🏢', color: 'bg-cyan-500/20 text-cyan-400' },
  'CTRA': { sector: 'Properti & Konstruksi', industry: 'Properti', icon: '🏢', color: 'bg-cyan-500/20 text-cyan-400' },
  'ASRI': { sector: 'Properti & Konstruksi', industry: 'Properti', icon: '🏢', color: 'bg-cyan-500/20 text-cyan-400' },
  'PWON': { sector: 'Properti & Konstruksi', industry: 'Properti', icon: '🏢', color: 'bg-cyan-500/20 text-cyan-400' },
  'SMRA': { sector: 'Properti & Konstruksi', industry: 'Properti', icon: '🏢', color: 'bg-cyan-500/20 text-cyan-400' },
  'DILD': { sector: 'Properti & Konstruksi', industry: 'Properti', icon: '🏢', color: 'bg-cyan-500/20 text-cyan-400' },
  
  // CONSTRUCTION
  'WIKA': { sector: 'Properti & Konstruksi', industry: 'Konstruksi', icon: '🏗️', color: 'bg-yellow-500/20 text-yellow-400' },
  'WSKT': { sector: 'Properti & Konstruksi', industry: 'Konstruksi', icon: '🏗️', color: 'bg-yellow-500/20 text-yellow-400' },
  'PTPP': { sector: 'Properti & Konstruksi', industry: 'Konstruksi', icon: '🏗️', color: 'bg-yellow-500/20 text-yellow-400' },
  'ADHI': { sector: 'Properti & Konstruksi', industry: 'Konstruksi', icon: '🏗️', color: 'bg-yellow-500/20 text-yellow-400' },
  'TOTL': { sector: 'Properti & Konstruksi', industry: 'Konstruksi', icon: '🏗️', color: 'bg-yellow-500/20 text-yellow-400' },
  
  // MINING - Coal
  'PTBA': { sector: 'Energi & Pertambangan', industry: 'Batubara', icon: '⛏️', color: 'bg-stone-500/20 text-stone-400' },
  'ADRO': { sector: 'Energi & Pertambangan', industry: 'Batubara', icon: '⛏️', color: 'bg-stone-500/20 text-stone-400' },
  'ITMG': { sector: 'Energi & Pertambangan', industry: 'Batubara', icon: '⛏️', color: 'bg-stone-500/20 text-stone-400' },
  'HRUM': { sector: 'Energi & Pertambangan', industry: 'Batubara', icon: '⛏️', color: 'bg-stone-500/20 text-stone-400' },
  'BYAN': { sector: 'Energi & Pertambangan', industry: 'Batubara', icon: '⛏️', color: 'bg-stone-500/20 text-stone-400' },
  'BUMI': { sector: 'Energi & Pertambangan', industry: 'Batubara', icon: '⛏️', color: 'bg-stone-500/20 text-stone-400' },
  
  // MINING - Oil & Gas
  'PGAS': { sector: 'Energi & Pertambangan', industry: 'Minyak & Gas', icon: '🛢️', color: 'bg-red-500/20 text-red-400' },
  'MEDC': { sector: 'Energi & Pertambangan', industry: 'Minyak & Gas', icon: '🛢️', color: 'bg-red-500/20 text-red-400' },
  'ELSA': { sector: 'Energi & Pertambangan', industry: 'Minyak & Gas', icon: '🛢️', color: 'bg-red-500/20 text-red-400' },
  
  // MINING - Nickel & Mineral
  'INCO': { sector: 'Energi & Pertambangan', industry: 'Nikel & Mineral', icon: '⚙️', color: 'bg-slate-500/20 text-slate-400' },
  'ANTM': { sector: 'Energi & Pertambangan', industry: 'Nikel & Mineral', icon: '⚙️', color: 'bg-slate-500/20 text-slate-400' },
  'TINS': { sector: 'Energi & Pertambangan', industry: 'Nikel & Mineral', icon: '⚙️', color: 'bg-slate-500/20 text-slate-400' },
  'MDKA': { sector: 'Energi & Pertambangan', industry: 'Nikel & Mineral', icon: '⚙️', color: 'bg-slate-500/20 text-slate-400' },
  'BRPT': { sector: 'Energi & Pertambangan', industry: 'Nikel & Mineral', icon: '⚙️', color: 'bg-slate-500/20 text-slate-400' },
  
  // TECHNOLOGY - E-Commerce
  'GOTO': { sector: 'Teknologi', industry: 'E-Commerce & Platform', icon: '💻', color: 'bg-indigo-500/20 text-indigo-400' },
  'BUKA': { sector: 'Teknologi', industry: 'E-Commerce & Platform', icon: '💻', color: 'bg-indigo-500/20 text-indigo-400' },
  'EMTK': { sector: 'Teknologi', industry: 'E-Commerce & Platform', icon: '💻', color: 'bg-indigo-500/20 text-indigo-400' },
  
  // TECHNOLOGY - Fintech
  'ARTO': { sector: 'Teknologi', industry: 'Fintech & Digital Banking', icon: '💳', color: 'bg-teal-500/20 text-teal-400' },
  'BBYB': { sector: 'Teknologi', industry: 'Fintech & Digital Banking', icon: '💳', color: 'bg-teal-500/20 text-teal-400' },
  
  // PHARMACEUTICAL
  'KLBF': { sector: 'Kesehatan', industry: 'Farmasi', icon: '💊', color: 'bg-green-500/20 text-green-400' },
  'KAEF': { sector: 'Kesehatan', industry: 'Farmasi', icon: '💊', color: 'bg-green-500/20 text-green-400' },
  'PYFA': { sector: 'Kesehatan', industry: 'Farmasi', icon: '💊', color: 'bg-green-500/20 text-green-400' },
  'SIDO': { sector: 'Kesehatan', industry: 'Farmasi', icon: '💊', color: 'bg-green-500/20 text-green-400' },
  
  // HEALTHCARE - Hospital
  'HEAL': { sector: 'Kesehatan', industry: 'Rumah Sakit', icon: '🏥', color: 'bg-red-500/20 text-red-400' },
  'SILO': { sector: 'Kesehatan', industry: 'Rumah Sakit', icon: '🏥', color: 'bg-red-500/20 text-red-400' },
  'MIKA': { sector: 'Kesehatan', industry: 'Rumah Sakit', icon: '🏥', color: 'bg-red-500/20 text-red-400' },
  
  // TRANSPORTATION
  'BIRD': { sector: 'Transportasi', industry: 'Airlines', icon: '✈️', color: 'bg-sky-500/20 text-sky-400' },
  
  // LOGISTICS
  'ASSA': { sector: 'Transportasi', industry: 'Logistik', icon: '📦', color: 'bg-amber-500/20 text-amber-400' },
  
  // PLANTATION
  'AALI': { sector: 'Agrikultur', industry: 'Perkebunan Kelapa Sawit', icon: '🌴', color: 'bg-lime-500/20 text-lime-400' },
  'LSIP': { sector: 'Agrikultur', industry: 'Perkebunan Kelapa Sawit', icon: '🌴', color: 'bg-lime-500/20 text-lime-400' },
  'SIMP': { sector: 'Agrikultur', industry: 'Perkebunan Kelapa Sawit', icon: '🌴', color: 'bg-lime-500/20 text-lime-400' },
  
  // LIVESTOCK
  'JPFA': { sector: 'Agrikultur', industry: 'Peternakan', icon: '🐔', color: 'bg-yellow-500/20 text-yellow-400' },
  'CPIN': { sector: 'Agrikultur', industry: 'Peternakan', icon: '🐔', color: 'bg-yellow-500/20 text-yellow-400' },
  'MAIN': { sector: 'Agrikultur', industry: 'Peternakan', icon: '🐔', color: 'bg-yellow-500/20 text-yellow-400' },
  
  // MEDIA
  'SCMA': { sector: 'Media', industry: 'Media & Broadcasting', icon: '📺', color: 'bg-fuchsia-500/20 text-fuchsia-400' },
  
  // AUTOMOTIVE
  'ASII': { sector: 'Otomotif', industry: 'Otomotif', icon: '🚗', color: 'bg-violet-500/20 text-violet-400' },
  'AUTO': { sector: 'Otomotif', industry: 'Otomotif', icon: '🚗', color: 'bg-violet-500/20 text-violet-400' },
  'UNTR': { sector: 'Otomotif', industry: 'Otomotif', icon: '🚗', color: 'bg-violet-500/20 text-violet-400' },
  
  // CEMENT
  'SMGR': { sector: 'Industri', industry: 'Semen', icon: '🏭', color: 'bg-zinc-500/20 text-zinc-400' },
  'INTP': { sector: 'Industri', industry: 'Semen', icon: '🏭', color: 'bg-zinc-500/20 text-zinc-400' },
  'WTON': { sector: 'Industri', industry: 'Semen', icon: '🏭', color: 'bg-zinc-500/20 text-zinc-400' },
  
  // TOWER
  'TOWR': { sector: 'Infrastruktur', industry: 'Tower', icon: '📶', color: 'bg-rose-500/20 text-rose-400' },
  'TBIG': { sector: 'Infrastruktur', industry: 'Tower', icon: '📶', color: 'bg-rose-500/20 text-rose-400' },
  
  // CONSUMER GOODS - Personal Care
  'UNVR': { sector: 'Konsumer', industry: 'Personal Care', icon: '🧴', color: 'bg-pink-500/20 text-pink-400' },
  'TCID': { sector: 'Konsumer', industry: 'Personal Care', icon: '🧴', color: 'bg-pink-500/20 text-pink-400' },
};

export const getStockIndustry = (ticker) => {
  // Extract stock code from ticker (e.g., "BBCA.JK" -> "BBCA")
  const code = ticker.replace('.JK', '').toUpperCase();
  return stockIndustryMap[code] || null;
};
