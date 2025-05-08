"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface SalesChartProps {
  data: Record<string, { units: number; amount: number }>;
  timeFrame: string;
}

// Helper to format hourly data
const formatHourlyData = (data: Record<string, { units: number; amount: number }>) => {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString());
  
  return hours.map(hour => {
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
const formatDailyData = (data: Record<string, { units: number; amount: number }>) => {
  return Object.entries(data).map(([date, values]) => ({
    date,
    units: values.units,
    amount: values.amount,
  }));
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary">Units: {payload[0].value}</p>
        <p className="text-sm text-green-500">Amount: ${payload[1].payload.amount.toFixed(2)}</p>
      </div>
    );
  }

  return null;
};

const SalesChart: React.FC<SalesChartProps> = ({ data, timeFrame }) => {
  if (!data) return null;
  
  const formattedData = timeFrame === 'today' 
    ? formatHourlyData(data)
    : formatDailyData(data);

  const xAxisKey = timeFrame === 'today' ? 'hour' : 'date';
  
  // Find the max units to set a reasonable Y-axis max
  const maxUnits = Math.max(...formattedData.map((item) => item.units));
  const yAxisMax = Math.ceil(maxUnits * 1.2); // Add 20% buffer
  
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
          barSize={timeFrame === 'today' ? 10 : 20}
          name="Units"
        />
        <ReferenceLine y={0} stroke="#e5e7eb" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesChart; 