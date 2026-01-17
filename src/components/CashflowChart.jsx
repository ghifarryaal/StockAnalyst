import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, Legend, CartesianGrid
} from "recharts";
import { Loader2 } from "lucide-react";

const API_BASE = "https://api.indonesiastockanalyst.my.id";

const normalizeTicker = (s) => {
  if (!s) return "";
  s = s.toUpperCase();
  if (s.length === 4 && !s.endsWith(".JK")) return `${s}.JK`;
  return s;
};

const formatUnit = (n) => {
  if (!n) return "-";
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + " T";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + " B";
  return n.toLocaleString("id-ID");
};

const CashflowChart = ({ symbol }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      const t = normalizeTicker(symbol);

      const res = await fetch(
        `${API_BASE}/api/chart/cashflow/${t}`
      );

      const json = await res.json();

      setData(json.chart);
      setLoading(false);
    };

    fetchData();
  }, [symbol]);

  if (loading)
    return (
      <div className="h-[350px] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="bg-[#0B1221] p-6 rounded-xl border border-gray-800">
      <h3 className="text-white font-semibold mb-3">
        Arus Kas
      </h3>

      <div className="h-[320px]">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatUnit} />

            <Tooltip />
            <Legend />

            <Bar
              dataKey="operating"
              fill="#7c3aed"
              name="Operating"
            />

            <Bar
              dataKey="investing"
              fill="#3b82f6"
              name="Investing"
            />

            <Bar
              dataKey="financing"
              fill="#ef4444"
              name="Financing"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashflowChart;
