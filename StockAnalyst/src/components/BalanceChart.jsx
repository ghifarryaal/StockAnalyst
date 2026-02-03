import React, { useEffect, useState, memo } from "react";
import {
  ResponsiveContainer, ComposedChart,
  Bar, Line, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid
} from "recharts";
import { Loader2 } from "lucide-react";
import {
  formatNumber,
  formatQuarter,
  scoreColor
} from "./utils";

const API_BASE = "https://api.indonesiastockanalyst.my.id";

const BalanceChart = ({ symbol }) => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    const t = symbol.length === 4 ? symbol + ".JK" : symbol;

    fetch(`${API_BASE}/api/chart/balance/${t}?limit=10`)
      .then(r => r.json())
      .then(setJson);
  }, [symbol]);

  if (!json)
    return <Loader2 className="animate-spin mx-auto mt-10" />;

  return (
    <div>
      <h3 className="font-semibold mb-3">
        Balance Sheet
      </h3>

      <div className="h-[450px]">
        <ResponsiveContainer>
          <ComposedChart data={json.chart}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis
              dataKey="date"
              tickFormatter={formatQuarter}
              tick={{ fill: "#fff" }}
            />

            <YAxis
              yAxisId="left"
              tickFormatter={formatNumber}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
            />

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
                        <span className="font-bold">
                          {p.dataKey === "debt_equity_ratio"
                            ? p.value.toFixed(2)
                            : formatNumber(p.value)}
                        </span>
                      </p>
                    ))}
                  </div>
                );
              }}
            />

            <Legend />

            <Bar
              yAxisId="left"
              dataKey="total_assets"
              fill="#6D28D9"
              name="Total Assets"
            />

            <Bar
              yAxisId="left"
              dataKey="total_liabilities"
              fill="#3B82F6"
              name="Total Liabilities"
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="debt_equity_ratio"
              stroke="#5EEAD4"
              strokeWidth={3}
              dot={{ r: 5 }}
              name="DER"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* SCORE */}
      <div className="mt-4 p-4 bg-gradient-to-r from-violet-950/30 to-pink-950/30 border border-violet-900/30 rounded-xl">
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

export default memo(BalanceChart);
