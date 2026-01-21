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

/* SAFE DATE FORMAT */
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

  return (
    <div>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-2">
        <h3 className="font-semibold text-lg">
          {json.ticker}
        </h3>

        {json.syariah && (
          <span className="
            px-2 py-0.5 text-xs
            bg-emerald-500/20 text-emerald-400
            rounded-full font-semibold">
            Syariah
          </span>
        )}
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

            {/* AXIS TANGGAL PUTIH */}
            <XAxis
              dataKey="date"
              tickFormatter={(v) => safeDate(v, "axis")}
              tick={{ fill: "#fff", fontWeight: 600 }}
            />

            <YAxis />

            {/* TOOLTIP PRICE */}
<Tooltip
  content={({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const d = payload[0].payload;

    return (
      <div className="bg-white text-black p-3 rounded shadow text-sm">
        <p className="font-semibold mb-1">
          {safeDate(label, "tooltip")}
        </p>

        {/* OHLC */}
        <p>Open : {d.open}</p>
        <p>High : {d.high}</p>
        <p>Low : {d.low}</p>
        <p>Close : {d.close}</p>

        <hr className="my-1" />

        {/* EMA */}
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

            <YAxis
              tickFormatter={formatNumber}
            />

            {/* TOOLTIP VOLUME */}
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
