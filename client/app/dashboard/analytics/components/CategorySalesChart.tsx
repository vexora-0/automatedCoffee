"use client";

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface CategorySalesData {
  name: string;
  units: number;
  amount: number;
}

interface CategorySalesChartProps {
  data: CategorySalesData[];
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

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}: any) => {
  const radius = outerRadius * 0.8;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-sm text-primary">Units: {payload[0].payload.units}</p>
        <p className="text-sm text-green-500">Amount: {formatCurrency(payload[0].payload.amount)}</p>
        <p className="text-xs text-muted-foreground">
          {(payload[0].percent * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }

  return null;
};

const CategorySalesChart: React.FC<CategorySalesChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  // Always show chart even with zero values
  // Only check for completely empty data
  const isEmpty = data.length === 0;
  
  if (isEmpty) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <p className="text-gray-500">No category sales data available</p>
      </div>
    );
  }

  // Process data to handle display names and merge duplicates
  const categoryMap: Record<string, CategorySalesData> = {};
  
  // First pass: collect all data by category name (case insensitive)
  data.forEach(item => {
    // Use original category name without hardcoding
    const categoryName = item.name || "Uncategorized";
    const lowerName = categoryName.toLowerCase();
    
    if (!categoryMap[lowerName]) {
      categoryMap[lowerName] = {
        name: categoryName, // Keep original capitalization
        units: 0,
        amount: 0
      };
    }
    
    // Add units and amount
    categoryMap[lowerName].units += (item.units || 0);
    categoryMap[lowerName].amount += (item.amount || 0);
  });
  
  // Convert back to array and sort
  let processedData = Object.values(categoryMap).sort((a, b) => b.units - a.units);
  
  // If there's only one category or all zeroes, add a placeholder category for better visualization
  let chartData = [...processedData];
  
  // Check if all values are zero
  const allZeros = chartData.every(item => (item.units || 0) === 0);
  
  // If all values are zero and we have data, give each item a small value for visualization
  if (allZeros && chartData.length > 0) {
    chartData = chartData.map((item, index) => ({
      ...item,
      units: 1 + index // Small different values for better visualization
    }));
  }
  
  // If we have no data at all, show the empty state
  if (chartData.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <p className="text-gray-500">No category sales data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={95}
          innerRadius={40}
          fill="#8884d8"
          dataKey="units"
          nameKey="name"
          stroke="#fff"
          strokeWidth={2}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              opacity={1.0}
              stroke={COLORS[index % COLORS.length]}
              strokeOpacity={0.7}
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value, entry, index) => (
            <span className="text-xs font-medium">{value}</span>
          )}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ paddingLeft: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategorySalesChart; 