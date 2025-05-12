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
  Cell,
  Legend
} from 'recharts';

interface ProductSalesData {
  name: string;
  units: number;
  amount: number;
  category: string;
}

interface ProductSalesChartProps {
  data: ProductSalesData[];
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#6366F1', // indigo
  '#EC4899', // pink
  '#8B5CF6', // purple
  '#14B8A6', // teal
  '#F43F5E', // rose
  '#84CC16', // lime
  '#06B6D4', // cyan
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary">Units: {payload[0].value}</p>
        <p className="text-sm text-green-500">Amount: {formatCurrency(payload[0].payload.amount)}</p>
        <p className="text-xs text-muted-foreground">Category: {payload[0].payload.category}</p>
      </div>
    );
  }

  return null;
};

const ProductSalesChart: React.FC<ProductSalesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <p className="text-gray-500">No product sales data available</p>
      </div>
    );
  }
  
  // Always display the actual data values, even if they're zero
  const sortedData = [...data].sort((a, b) => (b.units || 0) - (a.units || 0));
  
  // Set a reasonable domain for better visualization
  const maxUnits = Math.max(...sortedData.map(item => item.units || 0));
  // If all values are zero, set a small domain
  const xAxisMax = maxUnits > 0 ? Math.ceil(maxUnits * 1.2) : 5;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={sortedData}
        margin={{ top: 0, right: 30, left: 50, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis 
          type="number" 
          tick={{ fontSize: 12 }}
          tickLine={false}
          domain={[0, xAxisMax]}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          tickLine={false}
          width={120}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="units" 
          fill="#8884d8" 
          radius={[0, 4, 4, 0]}
          barSize={15}
          stroke="#fff"
          strokeWidth={1}
          minPointSize={2} // Ensure tiny bars are still visible
        >
          {sortedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              fillOpacity={1.0}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProductSalesChart; 