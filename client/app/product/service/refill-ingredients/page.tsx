"use client";

import { useState, useEffect } from "react";
import { machineService } from "@/lib/api/services";
import { Ingredient, MachineIngredientInventory } from "@/lib/api/types";
import { Loader2, PlusCircle, AlertCircle, ChevronDown } from "lucide-react";

export default function RefillIngredientsPage() {
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<
    (MachineIngredientInventory & { ingredient?: Ingredient })[]
  >([]);
  const [machineId, setMachineId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    const storedMachineId = localStorage.getItem("machineId");
    if (storedMachineId) {
      setMachineId(storedMachineId);
      loadInventory(storedMachineId);
    } else {
      setError("No machine ID found. Please reconnect to a machine.");
      setLoading(false);
    }
  }, []);

  const loadInventory = async (machineId: string) => {
    try {
      setLoading(true);
      const response = await machineService.getMachineInventory(machineId);

      if (response.success && response.data) {
        setInventoryItems(response.data);
      } else {
        setError("Failed to load inventory data");
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
      setError("Error loading inventory data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = async (
    item: MachineIngredientInventory & { ingredient?: Ingredient },
    amount: number
  ) => {
    if (!machineId) return;

    try {
      setIsUpdating({ ...isUpdating, [item.id]: true });

      const newQuantity = Math.min(
        (item.quantity || 0) + amount,
        item.max_capacity || 1000
      );

      const response = await machineService.updateMachineInventory(machineId, {
        ingredient_id: item.ingredient_id,
        quantity: newQuantity,
      });

      if (response.success) {
        setSuccess(
          `Successfully updated ${item.ingredient?.name} to ${newQuantity} ${item.ingredient?.unit}`
        );
        // Update the local state
        setInventoryItems(
          inventoryItems.map((invItem) =>
            invItem.id === item.id
              ? { ...invItem, quantity: newQuantity }
              : invItem
          )
        );

        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(`Failed to update ${item.ingredient?.name}`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error updating inventory:", err);
      setError(`Error updating ${item.ingredient?.name}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsUpdating({ ...isUpdating, [item.id]: false });
      setSelectedItem(null);
    }
  };

  const handleFillToMax = async (
    item: MachineIngredientInventory & { ingredient?: Ingredient }
  ) => {
    const maxCapacity = item.max_capacity || 1000;
    const amountToAdd = maxCapacity - item.quantity;
    if (amountToAdd > 0) {
      await handleRefill(item, amountToAdd);
    }
  };

  const calculateFillPercentage = (item: MachineIngredientInventory) => {
    const max = item.max_capacity || 1000;
    return Math.min(Math.max((item.quantity / max) * 100, 0), 100);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={30} className="text-amber-500 animate-spin" />
        <span className="ml-2 text-gray-300">Loading inventory...</span>
      </div>
    );
  }

  if (error && inventoryItems.length === 0) {
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
        <h1 className="text-2xl font-bold text-white mb-2">
          Refill Ingredients
        </h1>
        <p className="text-gray-400">
          Check the current levels and refill ingredients as needed.
        </p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-800 text-green-400 rounded-md">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventoryItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#141414] border border-gray-800 rounded-lg p-4 shadow-md relative"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-white">
                {item.ingredient?.name}
              </h3>
              <span className="text-xs bg-[#1A1A1A] px-2 py-1 rounded text-gray-400">
                {item.ingredient?.unit}
              </span>
            </div>

            <div className="w-full bg-[#1A1A1A] rounded-full h-4 mb-4 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  calculateFillPercentage(item) < 20
                    ? "bg-red-500"
                    : calculateFillPercentage(item) < 50
                    ? "bg-amber-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${calculateFillPercentage(item)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">
                {item.quantity} / {item.max_capacity || 1000}{" "}
                {item.ingredient?.unit}
              </span>
              <span
                className={`text-xs font-medium ${
                  calculateFillPercentage(item) < 20
                    ? "text-red-400"
                    : calculateFillPercentage(item) < 50
                    ? "text-amber-400"
                    : "text-green-400"
                }`}
              >
                {calculateFillPercentage(item).toFixed(0)}% full
              </span>
            </div>

            <div className="mt-4">
              {selectedItem === item.id ? (
                <div className="bg-[#1A1A1A] rounded-md p-3 mb-3 border border-gray-800">
                  <h4 className="text-sm text-gray-300 mb-2">
                    Select amount to refill:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => handleRefill(item, 100)}
                      disabled={
                        isUpdating[item.id] ||
                        calculateFillPercentage(item) >= 100
                      }
                      className="px-2 py-1.5 text-sm font-medium text-white bg-amber-600/80 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                    >
                      +100 {item.ingredient?.unit}
                    </button>
                    <button
                      onClick={() => handleRefill(item, 250)}
                      disabled={
                        isUpdating[item.id] ||
                        calculateFillPercentage(item) >= 100
                      }
                      className="px-2 py-1.5 text-sm font-medium text-white bg-amber-600/80 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                    >
                      +250 {item.ingredient?.unit}
                    </button>
                    <button
                      onClick={() => handleRefill(item, 500)}
                      disabled={
                        isUpdating[item.id] ||
                        calculateFillPercentage(item) >= 100
                      }
                      className="px-2 py-1.5 text-sm font-medium text-white bg-amber-600/80 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                    >
                      +500 {item.ingredient?.unit}
                    </button>
                    <button
                      onClick={() => handleFillToMax(item)}
                      disabled={
                        isUpdating[item.id] ||
                        calculateFillPercentage(item) >= 100
                      }
                      className="px-2 py-1.5 text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                    >
                      Fill Max
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="w-full text-center text-sm text-amber-600 hover:text-amber-500 py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedItem(item.id)}
                  disabled={
                    isUpdating[item.id] || calculateFillPercentage(item) >= 100
                  }
                  className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                >
                  {isUpdating[item.id] ? (
                    <Loader2 size={16} className="animate-spin mr-1" />
                  ) : (
                    <PlusCircle size={16} className="mr-1" />
                  )}
                  Refill
                  <ChevronDown size={14} className="ml-1" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
