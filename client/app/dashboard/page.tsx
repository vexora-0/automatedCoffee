'use client';

import React, { useState } from 'react';
import MachineStatus from '@/components/MachineStatus';
import RecipeList from '@/components/RecipeList';
import { useMachines } from '@/lib/api/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const { machines, isLoading } = useMachines();
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  
  // Handle initial loading
  if (isLoading) {
    return <div className="p-8">Loading dashboard data...</div>;
  }
  
  // Select the first machine by default if none is selected
  if (machines.length > 0 && !selectedMachineId) {
    setSelectedMachineId(machines[0].machine_id);
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Coffee Machine Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Machines</CardTitle>
            </CardHeader>
            <CardContent>
              {machines.length === 0 ? (
                <p className="text-gray-500">No machines available</p>
              ) : (
                <div className="space-y-2">
                  {machines.map((machine) => (
                    <button
                      key={machine.machine_id}
                      onClick={() => setSelectedMachineId(machine.machine_id)}
                      className={`w-full p-3 text-left rounded-lg transition ${
                        selectedMachineId === machine.machine_id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-medium">{machine.location}</div>
                      <div className="text-sm mt-1">
                        Status: {machine.status}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="status">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="status">Machine Status</TabsTrigger>
              <TabsTrigger value="recipes">Recipes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status">
              {selectedMachineId ? (
                <MachineStatus machineId={selectedMachineId} />
              ) : (
                <p className="text-gray-500">Please select a machine</p>
              )}
            </TabsContent>
            
            <TabsContent value="recipes">
              <RecipeList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 