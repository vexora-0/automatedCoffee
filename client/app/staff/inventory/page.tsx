"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Plus,
  AlertCircle,
  ChevronDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Machine {
  machine_id: string;
  location: string;
  status: string;
}

interface Ingredient {
  ingredient_id: string;
  name: string;
  unit: string;
}

interface InventoryItem {
  id: string;
  machine_id: string;
  ingredient_id: string;
  quantity: number;
  max_capacity: number;
  updated_at: string;
  ingredient?: Ingredient;
}

interface StaffData {
  staff_id: string;
  name: string;
  assigned_machines: Machine[];
}

export default function StaffInventoryPage() {
  const searchParams = useSearchParams();
  const initialMachineId = searchParams.get("machine");

  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("staffToken");
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      }${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Load staff data and initial machine
  useEffect(() => {
    const storedStaffData = localStorage.getItem("staffData");
    if (storedStaffData) {
      const parsedData = JSON.parse(storedStaffData);
      setStaffData(parsedData);

      // Set initial machine if provided in URL
      if (
        initialMachineId &&
        parsedData.assigned_machines?.some(
          (m: Machine) => m.machine_id === initialMachineId
        )
      ) {
        setSelectedMachine(initialMachineId);
      } else if (parsedData.assigned_machines?.length > 0) {
        setSelectedMachine(parsedData.assigned_machines[0].machine_id);
      }
    }
    setLoading(false);
  }, [initialMachineId]);

  // Load inventory when machine is selected
  useEffect(() => {
    if (selectedMachine && staffData) {
      loadInventory(selectedMachine);
    }
  }, [selectedMachine, staffData]);

  const loadInventory = async (machineId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use staff-specific inventory endpoint
      const response = await apiCall(
        `/staff/${staffData?.staff_id}/machines/${machineId}/inventory`
      );

      if (response.success && response.data) {
        setInventoryItems(response.data);
      } else {
        setError("Failed to load inventory data");
      }
    } catch (err: any) {
      console.error("Error loading inventory:", err);
      setError(err.message || "Error loading inventory data");
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (item: InventoryItem, amount: number) => {
    if (!selectedMachine || !staffData) return;

    try {
      setUpdating({ ...updating, [item.id]: true });
      setError(null);

      const newQuantity = Math.min(
        (item.quantity || 0) + amount,
        item.max_capacity || 1000
      );

      // Use machine service to update inventory
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/machines/${selectedMachine}/inventory`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({
            ingredient_id: item.ingredient_id,
            quantity: newQuantity,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(
          `Successfully updated ${item.ingredient?.name} to ${newQuantity} ${item.ingredient?.unit}`
        );

        // Update local state
        setInventoryItems((prevItems) =>
          prevItems.map((invItem) =>
            invItem.id === item.id
              ? { ...invItem, quantity: newQuantity }
              : invItem
          )
        );

        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.message || "Failed to update inventory");
      }
    } catch (err: any) {
      console.error("Error updating inventory:", err);
      setError(`Error updating ${item.ingredient?.name}: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating({ ...updating, [item.id]: false });
      setSelectedItem(null);
    }
  };

  const handleFillToMax = async (item: InventoryItem) => {
    const maxCapacity = item.max_capacity || 1000;
    const amountToAdd = maxCapacity - item.quantity;
    if (amountToAdd > 0) {
      await updateInventory(item, amountToAdd);
    }
  };

  const calculateFillPercentage = (item: InventoryItem) => {
    const max = item.max_capacity || 1000;
    return Math.min(Math.max((item.quantity / max) * 100, 0), 100);
  };

  const getSelectedMachineData = () => {
    return staffData?.assigned_machines?.find(
      (m) => m.machine_id === selectedMachine
    );
  };

  if (loading && !selectedMachine) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <motion.div
            className="relative w-12 h-12 mx-auto mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute w-12 h-12 rounded-full border-2 border-amber-500/20"></div>
            <motion.div
              className="absolute w-12 h-12 rounded-full border-t-2 border-amber-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Loading inventory...
          </motion.p>
        </div>
      </div>
    );
  }

  if (
    !staffData?.assigned_machines ||
    staffData.assigned_machines.length === 0
  ) {
    return (
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-[#141414] border-gray-800">
            <CardContent className="p-6 lg:p-8 text-center">
              <Package size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 mb-2">No machines assigned</p>
              <p className="text-sm text-gray-500">
                Contact your administrator to get machines assigned to you.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      className="p-4 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Machine Inventory
        </h1>
        <p className="text-gray-400 text-sm lg:text-base">
          Monitor and refill ingredient levels for your assigned machines
        </p>
      </motion.div>

      {/* Machine Selector */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-xs">
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger className="bg-[#141414] border-gray-800 text-white h-12 lg:h-10">
                <SelectValue placeholder="Select a machine" />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-gray-800">
                {staffData.assigned_machines.map((machine) => (
                  <SelectItem
                    key={machine.machine_id}
                    value={machine.machine_id}
                    className="text-white"
                  >
                    {machine.location} ({machine.machine_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMachine && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => loadInventory(selectedMachine)}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:text-amber-400 h-12 lg:h-9 px-4"
              >
                <RotateCcw size={16} className="mr-2" />
                Refresh
              </Button>
            </motion.div>
          )}
        </div>

        {selectedMachine && (
          <motion.div
            className="mt-3 flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge
              variant="outline"
              className="border-blue-600/30 text-blue-400"
            >
              {getSelectedMachineData()?.location}
            </Badge>
            <Badge
              className={
                getSelectedMachineData()?.status === "active"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }
            >
              {getSelectedMachineData()?.status}
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mb-4 p-4 bg-green-900/30 border border-green-800 text-green-400 rounded-xl"
          >
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mb-4 p-4 bg-red-900/30 border border-red-800 text-red-400 rounded-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory Items */}
      {selectedMachine && (
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 size={30} className="text-amber-500" />
                </motion.div>
                <span className="ml-3 text-gray-300">Loading inventory...</span>
              </motion.div>
            </div>
          ) : inventoryItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-[#141414] border-gray-800">
                <CardContent className="p-6 lg:p-8 text-center">
                  <AlertCircle
                    size={48}
                    className="mx-auto text-gray-500 mb-4"
                  />
                  <p className="text-gray-400 mb-2">No inventory data found</p>
                  <p className="text-sm text-gray-500">
                    This machine may not have any ingredients configured.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {inventoryItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        delay: index * 0.1,
                      },
                    },
                  }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  layout
                >
                  <Card className="bg-[#141414] border-gray-800 hover:border-gray-700 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/10">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base lg:text-lg text-white">
                          {item.ingredient?.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="border-gray-600 text-gray-400"
                        >
                          {item.ingredient?.unit}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div className="w-full bg-[#1A1A1A] rounded-full h-3 lg:h-4 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full transition-all duration-500 ${
                            calculateFillPercentage(item) < 20
                              ? "bg-red-500"
                              : calculateFillPercentage(item) < 50
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${calculateFillPercentage(item)}%` }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${calculateFillPercentage(item)}%`,
                          }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>

                      {/* Quantity Info */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          {item.quantity} / {item.max_capacity || 1000}{" "}
                          {item.ingredient?.unit}
                        </span>
                        <span
                          className={`text-sm font-medium ${
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

                      {/* Refill Options */}
                      <div className="mt-4">
                        <AnimatePresence mode="wait">
                          {selectedItem === item.id ? (
                            <motion.div
                              key="refill-options"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800"
                            >
                              <h4 className="text-sm text-gray-300 mb-3">
                                Select amount to refill:
                              </h4>
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                {[
                                  {
                                    amount: 100,
                                    label: `+100 ${item.ingredient?.unit}`,
                                  },
                                  {
                                    amount: 250,
                                    label: `+250 ${item.ingredient?.unit}`,
                                  },
                                  {
                                    amount: 500,
                                    label: `+500 ${item.ingredient?.unit}`,
                                  },
                                  { amount: -1, label: "Fill Max" },
                                ].map((option, idx) => (
                                  <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      onClick={() =>
                                        option.amount === -1
                                          ? handleFillToMax(item)
                                          : updateInventory(item, option.amount)
                                      }
                                      disabled={
                                        updating[item.id] ||
                                        calculateFillPercentage(item) >= 100
                                      }
                                      variant="outline"
                                      size="sm"
                                      className="w-full border-amber-600/30 text-amber-400 hover:bg-amber-600/20 h-10 text-xs"
                                    >
                                      {option.label}
                                    </Button>
                                  </motion.div>
                                ))}
                              </div>
                              <Button
                                onClick={() => setSelectedItem(null)}
                                variant="ghost"
                                size="sm"
                                className="w-full text-gray-400 hover:text-gray-300 h-10"
                              >
                                Cancel
                              </Button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="refill-button"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                onClick={() => setSelectedItem(item.id)}
                                disabled={
                                  updating[item.id] ||
                                  calculateFillPercentage(item) >= 100
                                }
                                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:text-gray-500 h-12 lg:h-10 transition-all duration-200"
                              >
                                {updating[item.id] ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                    >
                                      <Loader2 size={16} className="mr-2" />
                                    </motion.div>
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Plus size={16} className="mr-2" />
                                    Refill
                                    <ChevronDown size={14} className="ml-2" />
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
