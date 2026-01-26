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