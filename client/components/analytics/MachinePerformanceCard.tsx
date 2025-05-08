"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Activity,
  Star,
  DollarSign,
  Coffee,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Local Skeleton component since the import might be missing
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className || ""}`} />
);

interface MachinePerformanceProps {
  data: any;
  isLoading: boolean;
  selectedMachine: string;
  machines: any[];
}

const MachinePerformanceCard: React.FC<MachinePerformanceProps> = ({
  data,
  isLoading,
  selectedMachine,
  machines,
}) => {
  const getMachineName = (machineId: string) => {
    const machine = machines.find((m) => m.machine_id === machineId);
    return machine
      ? machine.name || `Machine ${machine.machine_id}`
      : "All Machines";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Machine Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : data ? (
          <>
            <div className="text-center">
              <h3 className="text-xl font-semibold">
                {selectedMachine !== "all"
                  ? getMachineName(selectedMachine)
                  : "All Machines"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 border rounded-lg">
                <Coffee className="h-6 w-6 text-primary mb-1" />
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-semibold">{data.totalOrders}</p>
              </div>

              <div className="flex flex-col items-center p-3 border rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500 mb-1" />
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-semibold">
                  ${data.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Completed
                </span>
                <span className="text-sm font-medium">
                  {data.ordersCompleted}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Failed
                </span>
                <span className="text-sm font-medium">{data.ordersFailed}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <Activity className="h-4 w-4 text-yellow-500" />
                  Success Rate
                </span>
                <span className="text-sm font-medium">
                  {data.successRate.toFixed(1)}%
                </span>
              </div>

              <Progress value={data.successRate} className="h-2 mt-1" />
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Customer Rating
                </span>
                <span className="text-sm font-medium">
                  {data.averageRating ? data.averageRating.toFixed(1) : "N/A"} /
                  5{data.ratingCount > 0 && ` (${data.ratingCount} ratings)`}
                </span>
              </div>

              {data.averageRating && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(data.averageRating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              No performance data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MachinePerformanceCard;
