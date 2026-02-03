import React, { useState, useEffect, memo } from 'react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { formatNumber } from "./utils";

const API_BASE = "https://api.indonesiastockanalyst.my.id";

/* ================= MARKET CAP ================= */

const formatMarketCap = (n) => {
  if (!n) return "-";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + " T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " Jt";
  return n.toLocaleString("id-ID");
};

const classifyMarketCap = (n) => {
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

/* ================= DATE ================= */

const safeDate = (d, type = "axis") => {
  try {
    const date = new Date(d);
    if (isNaN(date)) return d;

    if (type === "tooltip") {
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    }

    return date.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric"
    });
  } catch {
    return d;
  }
};

/* ================= COMPONENT ================= */

const StockChart = ({ symbol }) => {
  const [json, setJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    const t = symbol.length === 4 ? symbol + ".JK" : symbol;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE}/api/chart/${t}?limit=120`
        );
        if (!res.ok) throw new Error("API Error");

        setJson(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [symbol]);

  if (loading)
    return <Loader2 className="animate-spin mx-auto mt-10" />;

  if (error)
    return (
      <p className="text-red-400 text-center mt-10">
        {error}
      </p>
    );

  if (!json) return null;

  const data = json.data || [];
  if (!data.length) return null;

  const first = data[0];
  const last = data[data.length - 1];

  let pct = 0;
  if (first?.price && last?.price)
    pct = ((last.price - first.price) / first.price) * 100;

  const isUp = pct >= 0;

  const mc = classifyMarketCap(json.market_cap);

  return (
    <div>

      {/* HEADER */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg">
          {json.ticker}
        </h3>

        <div className="flex flex-wrap gap-2 mt-2">

          {/* SYARIAH */}
          {json.syariah && (
            <span className="
              px-3 py-1 text-xs rounded-full
              bg-emerald-500/20 text-emerald-400
              font-semibold">
              SYARIAH
            </span>
          )}

          {/* MARKET CAP */}
          {mc && (
            <span className={`
              px-3 py-1 text-xs rounded-full
              font-semibold
              ${mc.color}
            `}>
              {mc.label} ({mc.desc})
              {" "}•{" "}
              {formatMarketCap(json.market_cap)}
            </span>
          )}

        </div>
      </div>

      <p className="text-3xl font-bold">
        Rp {last?.price?.toLocaleString("id-ID")}
      </p>

      {/* PERSENTASE */}
      <span className={`
        inline-flex items-center
        px-3 py-1 mt-2 text-sm font-semibold
        rounded-full
        ${isUp
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-red-500/20 text-red-400"}
      `}>
        {isUp ? "▲" : "▼"} {pct.toFixed(2)}%
      </span>

      {/* ================= PRICE ================= */}
      <div className="h-[280px] mt-4">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis
              dataKey="date"
              tickFormatter={(v) => safeDate(v, "axis")}
              tick={{ fill: "#fff", fontWeight: 600 }}
            />

            <YAxis />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const d = payload[0].payload;

                return (
                  <div className="bg-white text-black p-3 rounded shadow text-sm">
                    <p className="font-semibold mb-1">
                      {safeDate(label, "tooltip")}
                    </p>

                    <p>Open : {d.open}</p>
                    <p>High : {d.high}</p>
                    <p>Low : {d.low}</p>
                    <p>Close : {d.close}</p>

                    <hr className="my-1" />

                    {payload.map((p, i) => (
                      <p key={i} style={{ color: p.color }}>
                        {p.name} : {p.value}
                      </p>
                    ))}
                  </div>
                );
              }}
            />

            <Legend />

            <Line
              dataKey="ema20"
              stroke="#3b82f6"
              dot={false}
              name="EMA 20"
            />

            <Line
              dataKey="ema50"
              stroke="#a855f7"
              dot={false}
              name="EMA 50"
            />

            <Line
              dataKey="price"
              stroke="#10b981"
              dot={false}
              name="Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= VOLUME ================= */}
      <div className="h-[120px] mt-4">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis
              dataKey="date"
              tickFormatter={(v) => safeDate(v, "axis")}
              tick={{ fill: "#fff", fontWeight: 600 }}
            />

            <YAxis tickFormatter={formatNumber} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                return (
                  <div className="bg-white text-black p-3 rounded shadow text-sm">
                    <p className="font-semibold mb-1">
                      {safeDate(label, "tooltip")}
                    </p>

                    <p>
                      Volume :
                      {" "}
                      {formatNumber(payload[0].value)}
                    </p>
                  </div>
                );
              }}
            />

            <Legend />

            <Bar
              dataKey="volume"
              fill="#3b82f6"
              name="Volume"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default memo(StockChart);
