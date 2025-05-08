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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-sm text-primary">Units: {payload[0].payload.units}</p>
        <p className="text-sm text-green-500">Amount: ${payload[0].payload.amount.toFixed(2)}</p>
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={95}
          innerRadius={40}
          fill="#8884d8"
          dataKey="units"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value, entry, index) => (
            <span className="text-xs">{value}</span>
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