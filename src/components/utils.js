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

  if (s.includes("SEHAT")) return "text-emerald-400 bg-emerald-500/20";
  if (s.includes("WASPADA")) return "text-yellow-400 bg-yellow-500/20";
  if (s.includes("BURUK")) return "text-red-400 bg-red-500/20";

  return "text-gray-400 bg-gray-500/20";
};

