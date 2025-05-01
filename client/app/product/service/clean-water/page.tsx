"use client";

import { useState, useEffect } from "react";
import { machineService } from "@/lib/api/services";
import { Machine } from "@/lib/api/types";
import { Loader2, AlertCircle, Droplet, RotateCcw, ChevronDown } from "lucide-react";

export default function CleanWaterPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [machineId, setMachineId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRefillOptions, setShowRefillOptions] = useState(false);

  useEffect(() => {
    const storedMachineId = localStorage.getItem("machineId");
    if (storedMachineId) {
      setMachineId(storedMachineId);
      loadMachineData(storedMachineId);
    } else {
      setError("No machine ID found. Please reconnect to a machine.");
      setLoading(false);
    }
  }, []);

  const loadMachineData = async (id: string) => {
    try {
      setLoading(true);
      const response = await machineService.getMachineById(id);
      
      if (response.success && response.data) {
        setMachine(response.data);
      } else {
        setError("Failed to load machine data");
      }
    } catch (err) {
      console.error("Error loading machine data:", err);
      setError("Error loading machine data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefillWater = async (amount: number) => {
    if (!machineId || !machine) return;
    
    try {
      setUpdating(true);
      
      // Calculate new water level, maximum 2000ml
      const newWaterLevel = Math.min((machine.cleaning_water_ml || 0) + amount, 2000);
      
      const response = await machineService.updateMachine(machineId, {
        ...machine,
        cleaning_water_ml: newWaterLevel
      });
      
      if (response.success && response.data) {
        setMachine(response.data);
        setSuccess(`Successfully updated water level to ${newWaterLevel}ml`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to update water level");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error updating water level:", err);
      setError("Error updating water level");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(false);
      setShowRefillOptions(false);
    }
  };

  const handleFillToMax = async () => {
    if (!machine) return;
    const maxAmount = 2000 - (machine.cleaning_water_ml || 0);
    if (maxAmount > 0) {
      await handleRefillWater(maxAmount);
    }
  };

  const calculateWaterPercentage = () => {
    if (!machine) return 0;
    const maxCapacity = 2000; // Assuming 2L max capacity
    return Math.min(Math.max((machine.cleaning_water_ml / maxCapacity) * 100, 0), 100);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={30} className="text-amber-500 animate-spin" />
        <span className="ml-2 text-gray-300">Loading machine data...</span>
      </div>
    );
  }

  if (error && !machine) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error</h3>
        <p className="text-gray-400 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Clean Water Refilling</h1>
        <p className="text-gray-400">
          The cleaning system needs fresh water to operate properly. Check the current level and refill as needed.
        </p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-800 text-green-400 rounded-md">
          {success}
        </div>
      )}
      
      {error && machine && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-md">
          {error}
        </div>
      )}

      {machine && (
        <div className="bg-[#141414] border border-gray-800 rounded-lg p-6 shadow-md max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-medium text-white text-lg">Water Tank Status</h3>
              <p className="text-gray-400 text-sm">Machine: {machine.location}</p>
            </div>
            <button 
              onClick={() => loadMachineData(machineId!)}
              className="p-2 text-gray-400 hover:text-amber-500 bg-[#1A1A1A] rounded-full"
            >
              <RotateCcw size={18} />
            </button>
          </div>
          
          <div className="mb-8 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full border-4 border-[#1A1A1A] bg-[#0A0A0A]"></div>
              <div 
                className="absolute bottom-0 rounded-b-full bg-blue-500 transition-all duration-500 w-full"
                style={{ height: `${calculateWaterPercentage()}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Droplet size={30} className="text-blue-400 mb-1 opacity-80" />
                <span className="text-2xl font-bold text-white">
                  {machine.cleaning_water_ml} <span className="text-sm">ml</span>
                </span>
                <span className="text-sm text-gray-300">
                  {calculateWaterPercentage().toFixed(0)}% full
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="w-full bg-[#1A1A1A] rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  calculateWaterPercentage() < 20 
                    ? 'bg-red-500' 
                    : calculateWaterPercentage() < 50 
                    ? 'bg-blue-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${calculateWaterPercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 ml</span>
              <span>1000 ml</span>
              <span>2000 ml</span>
            </div>
          </div>

          {showRefillOptions ? (
            <div className="mb-4 bg-[#1A1A1A] rounded-md p-4 border border-gray-800">
              <h4 className="text-sm text-gray-300 mb-3">Select amount to refill:</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => handleRefillWater(250)}
                  disabled={updating || calculateWaterPercentage() >= 100}
                  className="py-2 text-center text-white bg-blue-600/80 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                >
                  +250 ml
                </button>
                <button
                  onClick={() => handleRefillWater(500)}
                  disabled={updating || calculateWaterPercentage() >= 100}
                  className="py-2 text-center text-white bg-blue-600/80 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                >
                  +500 ml
                </button>
                <button
                  onClick={() => handleRefillWater(1000)}
                  disabled={updating || calculateWaterPercentage() >= 100}
                  className="py-2 text-center text-white bg-blue-600/80 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                >
                  +1000 ml
                </button>
                <button
                  onClick={handleFillToMax}
                  disabled={updating || calculateWaterPercentage() >= 100}
                  className="py-2 text-center text-white bg-blue-700 hover:bg-blue-800 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                >
                  Fill to Max
                </button>
              </div>
              <button
                onClick={() => setShowRefillOptions(false)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-500 py-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowRefillOptions(true)}
              disabled={updating || calculateWaterPercentage() >= 100}
              className="w-full py-3 flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
            >
              {updating ? (
                <Loader2 size={16} className="inline animate-spin mr-1" />
              ) : (
                <Droplet size={16} className="mr-1" />
              )}
              Refill Water
              <ChevronDown size={14} className="ml-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
} 