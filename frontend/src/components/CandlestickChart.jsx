import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  Cell
} from 'recharts';

const CandlestickChart = ({ data, safeDate }) => {
  if (!data || data.length === 0) return null;

  // Format number for Y-axis
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  // Calculate Y domain
  const allPrices = data.flatMap(d => [d.high, d.low].filter(v => v));
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const padding = (maxPrice - minPrice) * 0.05;
  const yDomain = [minPrice - padding, maxPrice + padding];

  // Custom candlestick bar renderer
  const renderCandlestick = (props) => {
    const { x, y, width, height, index } = props;
    
    if (!data[index]) return null;
    
    const item = data[index];
    if (!item.open || !item.high || !item.low || !item.close) return null;

    const isGreen = item.close >= item.open;
    const color = isGreen ? '#10b981' : '#ef4444';

    // y is already the pixel position for the high value
    // height is the pixel height from high to low
    const priceRange = item.high - item.low;
    if (priceRange === 0) return null;

    // Calculate pixel positions within the bar height
    const openOffset = ((item.high - item.open) / priceRange) * height;
    const closeOffset = ((item.high - item.close) / priceRange) * height;

    const bodyTop = Math.min(openOffset, closeOffset);
    const bodyHeight = Math.max(Math.abs(closeOffset - openOffset), 1);
    const bodyWidth = Math.min(width * 0.7, 8);
    const wickX = width / 2;

    return (
      <g>
        {/* Wick from high to low */}
        <line
          x1={x + wickX}
          y1={y}
          x2={x + wickX}
          y2={y + height}
          stroke={color}
          strokeWidth={1.5}
        />
        {/* Body from open to close */}
        <rect
          x={x + (width - bodyWidth) / 2}
          y={y + bodyTop}
          width={bodyWidth}
          height={bodyHeight}
          fill={color}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  return (
    <div className="w-full" style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="#1e293b" />

          <XAxis
            dataKey="date"
            tickFormatter={(v) => safeDate(v, "axis")}
            tick={{ fill: "#fff", fontWeight: 600 }}
          />

          <YAxis 
            domain={yDomain}
            tick={{ fill: "#fff", fontSize: 12 }}
            tickFormatter={formatYAxis}
            width={60}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;

              const d = payload[0]?.payload;
              if (!d) return null;

              const isGreen = d.close >= d.open;

              return (
                <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 text-white p-4 rounded-xl shadow-2xl text-xs backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                    <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: isGreen ? '#10b981' : '#ef4444' }}></div>
                    <p className="font-bold text-sm bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {safeDate(label, "tooltip")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-800/50 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px] mb-0.5">Open</p>
                        <p className="font-bold text-white">{d.open?.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px] mb-0.5">Close</p>
                        <p className="font-bold text-white">{d.close?.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-2">
                        <p className="text-green-500 text-[10px] mb-0.5">High</p>
                        <p className="font-bold text-green-400">{d.high?.toLocaleString()}</p>
                      </div>
                      <div className="bg-red-900/20 rounded-lg p-2">
                        <p className="text-red-500 text-[10px] mb-0.5">Low</p>
                        <p className="font-bold text-red-400">{d.low?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5 bg-linear-to-r from-blue-500 to-blue-400 rounded"></div>
                          <span className="text-gray-400">Price</span>
                        </div>
                        <span className="font-bold text-emerald-400">{d.price?.toLocaleString()}</span>
                      </div>
                      {d.ema20 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-linear-to-r from-blue-600 to-blue-500 rounded"></div>
                            <span className="text-gray-400">EMA 20</span>
                          </div>
                          <span className="font-bold text-blue-400">{d.ema20?.toLocaleString()}</span>
                        </div>
                      )}
                      {d.ema50 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-linear-to-r from-purple-600 to-purple-500 rounded"></div>
                            <span className="text-gray-400">EMA 50</span>
                          </div>
                          <span className="font-bold text-purple-400">{d.ema50?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
          />

          <Legend />

          {/* Candlestick bars - using low as base and (high-low) as height */}
          <Bar
            dataKey={(entry) => [entry.low, entry.high]}
            shape={renderCandlestick}
            isAnimationActive={false}
            name="Price"
          />

          {/* EMA lines */}
          <Line
            dataKey="ema20"
            stroke="#3b82f6"
            dot={false}
            name="EMA 20"
            strokeWidth={2}
          />

          <Line
            dataKey="ema50"
            stroke="#a855f7"
            dot={false}
            name="EMA 50"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart;
