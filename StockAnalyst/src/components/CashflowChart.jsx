import React, { useEffect, useState, memo } from "react";
import {
  ResponsiveContainer, BarChart,
  Bar, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid
} from "recharts";
import { Loader2 } from "lucide-react";
import {
  formatNumber,
  formatQuarter,
  scoreColor
} from "./utils";

const API_BASE = "https://api.indonesiastockanalyst.my.id";

const CashflowChart = ({ symbol }) => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    const t = symbol.length === 4 ? symbol + ".JK" : symbol;

    fetch(`${API_BASE}/api/chart/cashflow/${t}?limit=10`)
      .then(r => r.json())
      .then(setJson);
  }, [symbol]);

  if (!json)
    return <Loader2 className="animate-spin mx-auto mt-10" />;

  return (
    <div>
      <h3 className="font-semibold mb-3">
        Cashflow
      </h3>

      <div className="h-[450px]">
        <ResponsiveContainer>
          <BarChart data={json.chart}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis
              dataKey="date"
              tickFormatter={formatQuarter}
              tick={{ fill: "#fff" }}
            />

            <YAxis tickFormatter={formatNumber} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                return (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 text-white p-4 rounded-xl shadow-2xl text-sm backdrop-blur-sm">
                    <p className="font-semibold mb-2 text-cyan-400">
                      {formatQuarter(label)}
                    </p>

                    {payload.map((p, i) => (
                      <p key={i} style={{ color: p.color }} className="text-xs">
                        {p.name}:
                        {" "}
                        <span className="font-bold">{formatNumber(p.value)}</span>
                      </p>
                    ))}
                  </div>
                );
              }}
            />

            <Legend />

            <Bar
              dataKey="operating"
              fill="#6D28D9"
              name="Operating"
            />

            <Bar
              dataKey="investing"
              fill="#3B82F6"
              name="Investing"
            />

            <Bar
              dataKey="financing"
              fill="#EF4444"
              name="Financing"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SCORE */}
      <div className="mt-4 p-4 bg-gradient-to-r from-rose-950/30 to-orange-950/30 border border-rose-900/30 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className={`px-4 py-2 rounded-lg font-bold text-white text-sm ${
            json.score.status === 'STRONG' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
            json.score.status === 'GOOD' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
            json.score.status === 'FAIR' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
            'bg-gradient-to-r from-red-500 to-rose-500'
          }`}>
            Skor {json.score.score}
          </div>
          <span className="text-white font-semibold text-sm">{json.score.status}</span>
        </div>

        <ul className="list-disc ml-5 text-xs text-gray-300 space-y-1">
          {json.score.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default memo(CashflowChart);
