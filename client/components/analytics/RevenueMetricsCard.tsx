"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueMetricsCardProps {
  data: any;
  isLoading: boolean;
}

const RevenueMetricsCard: React.FC<RevenueMetricsCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-full py-6">
            <p className="text-muted-foreground">No revenue data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">
            Total revenue and orders
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center p-4 border rounded-lg">
            <div className="p-2 bg-primary/10 rounded-full mr-4">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h2 className="text-3xl font-bold">
                ${data.total.revenue ? data.total.revenue.toFixed(2) : '0.00'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center p-4 border rounded-lg">
            <div className="p-2 bg-green-500/10 rounded-full mr-4">
              <ShoppingCart className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <h2 className="text-3xl font-bold">
                {data.total.orders || 0}
              </h2>
            </div>
          </div>
          
          {data.total.orders > 0 && (
            <div className="flex items-center justify-between p-2 text-sm">
              <span className="text-muted-foreground">Average Order Value</span>
              <span className="font-medium">
                ${(data.total.revenue / data.total.orders).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueMetricsCard; 