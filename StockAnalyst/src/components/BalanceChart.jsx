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
  scoreColor,
  getScoreBadgeColor
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

  // Check if chart data is empty or not available
  const hasChartData = json.chart && json.chart.length > 0;

  return (
    <div>
      <h3 className="font-semibold mb-3">
        Balance Sheet
      </h3>

      {!hasChartData ? (
        <div className="h-[450px] flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl font-semibold text-gray-300 mb-2">Data Tidak Tersedia</p>
            <p className="text-sm text-gray-500">Data laporan keuangan untuk saham ini belum tersedia</p>
          </div>
        </div>
      ) : (
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
      )}

      {/* SCORE */}
      {json.score && json.score.status && json.score.score !== undefined ? (
        <div className="mt-4 p-4 bg-gradient-to-r from-violet-950/30 to-pink-950/30 border border-violet-900/30 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className={`px-4 py-2 rounded-lg font-bold text-white text-sm ${getScoreBadgeColor(json.score.status)}`}>
              Skor {json.score.score}
            </div>
            <span className="text-white font-semibold text-sm">{json.score.status}</span>
          </div>

          {json.score.notes && json.score.notes.length > 0 && (
            <ul className="list-disc ml-5 text-xs text-gray-300 space-y-1">
              {json.score.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 border border-gray-600/30 rounded-xl">
          <p className="text-sm text-gray-400 text-center">
            📊 Data scoring tidak tersedia untuk saham ini
          </p>
        </div>
      )}
    </div>
  );
};

export default memo(BalanceChart);
