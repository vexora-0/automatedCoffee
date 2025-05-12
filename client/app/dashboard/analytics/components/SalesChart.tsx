"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface SalesChartProps {
  data: Record<string, { units: number; amount: number }>;
  timeFrame: string;
}

// Helper to format hourly data
const formatHourlyData = (
  data: Record<string, { units: number; amount: number }>
) => {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString());

  return hours.map((hour) => {
    const hourData = data[hour] || { units: 0, amount: 0 };
    const hourFormatted = `${hour}:00`;

    return {
      hour: hourFormatted,
      units: hourData.units,
      amount: hourData.amount,
    };
  });
};

// Helper to format daily data
const formatDailyData = (
  data: Record<string, { units: number; amount: number }>
) => {
  return Object.entries(data).map(([date, values]) => ({
    date,
    units: values.units,
    amount: values.amount,
  }));
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Add checks to prevent accessing undefined properties
    const units = payload[0]?.value ?? 0;

    // Check if we have a second data series (payload[1]) or get amount from first series
    let amount = 0;
    if (
      payload[1] &&
      payload[1].payload &&
      payload[1].payload.amount !== undefined
    ) {
      amount = payload[1].payload.amount;
    } else if (payload[0]?.payload?.amount !== undefined) {
      amount = payload[0].payload.amount;
    }

    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary">Units: {units}</p>
        <p className="text-sm text-green-500">Amount: {formatCurrency(amount)}</p>
      </div>
    );
  }

  return null;
};

const SalesChart: React.FC<SalesChartProps> = ({ data, timeFrame }) => {
  if (!data) return null;

  const formattedData =
    timeFrame === "today" ? formatHourlyData(data) : formatDailyData(data);

  const xAxisKey = timeFrame === "today" ? "hour" : "date";

  // Find the max units to set a reasonable Y-axis max
  const maxUnits = Math.max(...formattedData.map((item) => item.units));
  
  // Always set a minimum value to make chart visible
  const yAxisMax = Math.max(5, Math.ceil(maxUnits * 1.2)); // At least 5 or 120% of max

  // Check if there's actual data to display - only truly empty if ALL values are 0
  const hasData = formattedData.some(item => item.units > 0 || item.amount > 0);

  if (formattedData.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <p className="text-gray-500">No sales data for this time period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={formattedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          padding={{ left: 10, right: 10 }}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          domain={[0, yAxisMax]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={false}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          yAxisId="left"
          dataKey="units"
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
          barSize={timeFrame === "today" ? 10 : 20}
          name="Units"
          fillOpacity={1.0}
          stroke="#2563EB"
          strokeWidth={1}
        />
        {/* Make amount data visible in a separate bar */}
        <Bar
          yAxisId="right"
          dataKey="amount"
          fill="#10B981"
          radius={[4, 4, 0, 0]}
          barSize={timeFrame === "today" ? 5 : 10}
          name="Amount"
          fillOpacity={0.9}
          stroke="#059669"
          strokeWidth={1}
        />
        <ReferenceLine y={0} stroke="#e5e7eb" yAxisId="left" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
