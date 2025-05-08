"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface TimeSeriesData {
  timeInterval: string;
  units?: number;
  amount?: number;
  revenue?: number;
  orders?: number;
}

interface SalesOverTimeChartProps {
  data: TimeSeriesData[];
  dataKey: string;
  color: string;
  timeFrame: string;
}

// Helper to format time intervals for display
const formatTimeInterval = (timeInterval: string, timeFrame: string) => {
  if (timeFrame === 'today') {
    // Format like "14:00" to just "14"
    return timeInterval.split(':')[0];
  }
  
  if (timeFrame === '7days') {
    // For dates like "2023-05-21", return "05/21"
    const parts = timeInterval.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`;
    }
  }
  
  if (timeFrame === '30days' && timeInterval.includes('W')) {
    // For week format like "2023-W21", return "Week 21"
    const week = timeInterval.split('W')[1];
    return `W${week}`;
  }
  
  // Default case just returns the original interval
  return timeInterval;
};

const CustomTooltip = ({ active, payload, label, dataKey }: any) => {
  if (active && payload && payload.length) {
    // Determine the right label based on the dataKey
    let valueLabel = 'Value';
    let valuePrefix = '';
    
    if (dataKey === 'units') {
      valueLabel = 'Units Sold';
    } else if (dataKey === 'amount' || dataKey === 'revenue') {
      valueLabel = dataKey === 'amount' ? 'Sales Amount' : 'Revenue';
      valuePrefix = '$';
    }
    
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary">
          {valueLabel}: {valuePrefix}{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }

  return null;
};

const SalesOverTimeChart: React.FC<SalesOverTimeChartProps> = ({ 
  data, 
  dataKey,
  color,
  timeFrame
}) => {
  if (!data || data.length === 0) return null;
  
  // Format data for the chart
  const formattedData = data.map(item => ({
    ...item,
    timeLabel: formatTimeInterval(item.timeInterval, timeFrame)
  }));
  
  // Find the max value to set a reasonable Y-axis max
  const maxValue = Math.max(...formattedData.map((item) => item[dataKey] || 0));
  const yAxisMax = Math.ceil(maxValue * 1.2); // Add 20% buffer
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="timeLabel" 
          padding={{ left: 10, right: 10 }}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          domain={[0, yAxisMax]}
        />
        <Tooltip content={<CustomTooltip dataKey={dataKey} />} />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        <ReferenceLine y={0} stroke="#e5e7eb" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesOverTimeChart; 