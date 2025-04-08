'use client';

import React, { useEffect } from 'react';
import { useMachineStatus, useMachineTemperature, useMachineInventory } from '@/lib/websocket/socketContext';
import { useMachine } from '@/lib/api/hooks';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MachineStatusProps = {
  machineId: string;
};

export default function MachineStatus({ machineId }: MachineStatusProps) {
  // Get initial machine data from API
  const { machine, isLoading } = useMachine(machineId);
  
  // Get real-time updates from WebSocket
  const status = useMachineStatus(machineId);
  const temperature = useMachineTemperature(machineId);
  const inventory = useMachineInventory(machineId);
  
  if (isLoading) {
    return <div>Loading machine data...</div>;
  }
  
  if (!machine) {
    return <div>Machine not found</div>;
  }
  
  // Use real-time data if available, otherwise fall back to API data
  const currentStatus = status?.status || machine.status;
  const currentTemperature = temperature !== undefined ? temperature : machine.temperature_c;
  
  // Determine status color
  const statusColor = 
    currentStatus === 'operational' 
      ? 'text-green-500' 
      : currentStatus === 'maintenance' 
        ? 'text-yellow-500' 
        : 'text-red-500';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Machine Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className={`text-xl font-bold ${statusColor}`}>{currentStatus}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-xl font-bold">{status?.location || machine.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Temperature</p>
              <p className="text-xl font-bold">{currentTemperature}°C</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Regular Service</p>
              <p className="text-sm">{new Date(machine.last_regular_service).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ingredient Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredient Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(inventory || []).map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{item.ingredient_id}</span>
                  <span className="text-sm text-gray-500">{item.quantity} units</span>
                </div>
                <Progress value={(item.quantity / 100) * 100} className="h-2" />
              </div>
            ))}
            
            {(!inventory || inventory.length === 0) && (
              <p className="text-gray-500">No ingredient data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 