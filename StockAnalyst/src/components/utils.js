export const formatNumber = (n) => {
  if (n === null || n === undefined) return "-";

  const abs = Math.abs(n);

  if (abs >= 1e12) return (n / 1e12).toFixed(2) + " T";
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + " B";
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + " Jt";

  return n.toLocaleString("id-ID");
};

export const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short"
    });
  } catch {
    return d;
  }
};

export const scoreColor = (status = "") => {
  const s = status.toUpperCase();

  // Sehat = Hijau (Green)
  if (s.includes("SEHAT") || s.includes("STRONG") || s.includes("GOOD"))
    return "text-emerald-400 bg-emerald-500/20";

  // Netral = Biru (Blue)
  if (s.includes("NETRAL") || s.includes("NEUTRAL"))
    return "text-blue-400 bg-blue-500/20";

  // Hati-hati = Kuning (Yellow)
  if (s.includes("HATI") || s.includes("FAIR") || s.includes("CAUTION"))
    return "text-yellow-400 bg-yellow-500/20";

  // Waspada = Merah (Red)
  if (s.includes("WASPADA") || s.includes("BURUK") || s.includes("WEAK") || s.includes("POOR"))
    return "text-red-400 bg-red-500/20";

  return "text-gray-400 bg-gray-500/20";
};

export const formatQuarter = (d) => {
  try {
    const date = new Date(d);
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `Q${q} ${date.getFullYear()}`;
  } catch {
    return d;
  }
};

export const formatMarketCap = (n) => {
  if (!n) return "-";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + " T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " Jt";
  return n.toLocaleString("id-ID");
};

export const classifyMarketCap = (n) => {
  if (!n) return null;

  if (n >= 10e12) {
    return {
      label: "BIG CAP",
      desc: "Blue Chip",
      color: "bg-emerald-500/20 text-emerald-400"
    };
  }

  if (n >= 500e9) {
    return {
      label: "MID CAP",
      desc: "Second Liner",
      color: "bg-yellow-500/20 text-yellow-400"
    };
  }

  return {
    label: "SMALL CAP",
    desc: "Third Liner",
    color: "bg-red-500/20 text-red-400"
  };
};

// Helper function to get score badge color based on status
export const getScoreBadgeColor = (status = "") => {
  const s = status.toUpperCase();

  // Sehat = Hijau (Green)
  if (s.includes("SEHAT") || s.includes("STRONG"))
    return "bg-gradient-to-r from-emerald-500 to-green-500";

  // Netral/Good = Biru (Blue)
  if (s.includes("NETRAL") || s.includes("NEUTRAL") || s.includes("GOOD"))
    return "bg-gradient-to-r from-blue-500 to-cyan-500";

  // Hati-hati = Kuning (Yellow)
  if (s.includes("HATI") || s.includes("FAIR") || s.includes("CAUTION"))
    return "bg-gradient-to-r from-yellow-500 to-orange-500";

  // Waspada = Merah (Red)
  if (s.includes("WASPADA") || s.includes("BURUK") || s.includes("WEAK") || s.includes("POOR"))
    return "bg-gradient-to-r from-red-500 to-rose-500";

  return "bg-gradient-to-r from-gray-500 to-gray-600";
};