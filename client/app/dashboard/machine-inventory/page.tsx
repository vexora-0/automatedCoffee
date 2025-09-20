"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  useMachines,
  useMachineInventory,
  useIngredients,
} from "@/lib/api/hooks";
import { machineService } from "@/lib/api/services";
import { Progress } from "@/components/ui/progress";
import {
  MachineIngredientInventory,
  Ingredient,
  Machine,
} from "@/lib/api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Pencil, Droplet } from "lucide-react";

export default function MachineInventoryManagement() {
  const { machines, isLoading: machinesLoading } = useMachines();
  const { ingredients, isLoading: ingredientsLoading } = useIngredients();
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const {
    inventory,
    isLoading: inventoryLoading,
    mutate: refreshInventory,
  } = useMachineInventory(selectedMachine || undefined);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({
    ingredient_id: "",
    quantity: 0,
    max_capacity: 0,
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIngredientData, setNewIngredientData] = useState({
    ingredient_id: "",
    quantity: 0,
    max_capacity: 0,
  });

  // Add cleaning water state
  const [isUpdatingCleaningWater, setIsUpdatingCleaningWater] = useState(false);
  const [cleaningWaterLevel, setCleaningWaterLevel] = useState(0);
  const [selectedMachineData, setSelectedMachineData] =
    useState<Machine | null>(null);

  const { toast } = useToast();

  // Auto-select the first machine when data loads
  useEffect(() => {
    if (machines.length > 0 && !selectedMachine) {
      setSelectedMachine(machines[0].machine_id);
    }
  }, [machines, selectedMachine]);

  // Update selected machine data when machine changes
  useEffect(() => {
    if (selectedMachine) {
      const foundMachine = machines.find(
        (m) => m.machine_id === selectedMachine
      );

      // Explicitly assign to make TypeScript happy
      const machineData: Machine | null = foundMachine ? foundMachine : null;
      setSelectedMachineData(machineData);

      if (machineData) {
        setCleaningWaterLevel(machineData.cleaning_water_ml);
      }
    }
  }, [selectedMachine, machines]);

  const handleMachineSelect = (machineId: string) => {
    setSelectedMachine(machineId);
  };

  const handleUpdateInventory = async () => {
    if (!selectedMachine || !updateData.ingredient_id) return;

    try {
      await machineService.updateMachineInventory(selectedMachine, updateData);
      await refreshInventory();
      setIsUpdating(false);
      resetUpdateData();
      toast({
        title: "Success",
        description: "Inventory updated successfully",
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    }
  };

  const handleAddIngredient = async () => {
    if (!selectedMachine || !newIngredientData.ingredient_id) return;

    try {
      await machineService.updateMachineInventory(
        selectedMachine,
        newIngredientData
      );
      await refreshInventory();
      setIsAddingNew(false);
      resetNewIngredientData();
      toast({
        title: "Success",
        description: "Ingredient added to inventory",
      });
    } catch (error) {
      console.error("Error adding ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to add ingredient",
        variant: "destructive",
      });
    }
  };

  // Handle updating cleaning water level
  const handleUpdateCleaningWater = async () => {
    if (!selectedMachine) return;

    try {
      await machineService.updateMachine(selectedMachine, {
        cleaning_water_ml: cleaningWaterLevel,
      });

      // Update the local machine data
      const updatedMachines = machines.map((machine) =>
        machine.machine_id === selectedMachine
          ? { ...machine, cleaning_water_ml: cleaningWaterLevel }
          : machine
      );

      // Update the selected machine data
      const updatedMachine = updatedMachines.find(
        (m) => m.machine_id === selectedMachine
      );
      setSelectedMachineData(updatedMachine || null);

      setIsUpdatingCleaningWater(false);
      toast({
        title: "Success",
        description: "Cleaning water level updated successfully",
      });
    } catch (error) {
      console.error("Error updating cleaning water:", error);
      toast({
        title: "Error",
        description: "Failed to update cleaning water level",
        variant: "destructive",
      });
    }
  };

  // Find the ingredient name by ID
  const getIngredientName = (
    item: MachineIngredientInventory & { ingredient?: Ingredient }
  ): string => {
    if (item.ingredient && item.ingredient.name) {
      return item.ingredient.name;
    }

    // Fallback to looking up in ingredients array
    const ingredient = ingredients.find(
      (i) => i.ingredient_id === item.ingredient_id
    );
    return ingredient ? ingredient.name : "Unknown Ingredient";
  };

  // Get ingredient unit by ID
  const getIngredientUnit = (
    item: MachineIngredientInventory & { ingredient?: Ingredient }
  ): string => {
    if (item.ingredient && item.ingredient.unit) {
      return item.ingredient.unit;
    }

    // Fallback to looking up in ingredients array
    const ingredient = ingredients.find(
      (i) => i.ingredient_id === item.ingredient_id
    );
    return ingredient ? ingredient.unit : "";
  };

  // Reset with max capacity included
  const resetUpdateData = () => {
    setUpdateData({
      ingredient_id: "",
      quantity: 0,
      max_capacity: 0,
    });
  };

  // Reset new ingredient data with max capacity
  const resetNewIngredientData = () => {
    setNewIngredientData({
      ingredient_id: "",
      quantity: 0,
      max_capacity: 0,
    });
  };

  // Calculate percentage for progress bar
  const calculateFillPercentage = (
    quantity: number,
    maxCapacity: number | undefined
  ): number => {
    if (!maxCapacity || maxCapacity <= 0) return 0;
    const percentage = (quantity / maxCapacity) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Ensure between 0-100
  };

  // Add loading skeleton components
  const MachineSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );

  const InventorySkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] opacity-90"></div>

        {/* Coffee bean pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#C28654]/10"
              style={{
                width: Math.random() * 70 + 25 + "px",
                height: Math.random() * 40 + 15 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto py-10 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-[#5F3023]">
              Machine Inventory
            </h1>
            <p className="text-[#8A5738] text-lg">
              Manage and monitor your coffee machines
            </p>
          </div>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="border-[#8A5738]/30 text-[#8A5738] hover:bg-[#8A5738] hover:text-white backdrop-blur-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {/* Left Panel - Machine List */}
          <Card className="col-span-1 border-none shadow-xl bg-white/90 backdrop-blur-xl">
            <CardHeader className="border-b border-[#C28654]/20 bg-[#F4EBDE]/50">
              <CardTitle className="text-xl text-[#5F3023]">Machines</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {machinesLoading ? (
                  <div className="p-4">
                    <MachineSkeleton />
                  </div>
                ) : machines.length === 0 ? (
                  <div className="p-4 text-center text-[#8A5738]">
                    No machines found
                  </div>
                ) : (
                  <div className="p-2">
                    {machines.map((machine) => (
                      <Button
                        key={machine.machine_id}
                        variant={
                          selectedMachine === machine.machine_id
                            ? "default"
                            : "ghost"
                        }
                        className={cn(
                          "w-full justify-start text-left p-4 mb-2 transition-all",
                          selectedMachine === machine.machine_id
                            ? "bg-gradient-to-r from-[#8A5738] to-[#5F3023] text-white shadow-md"
                            : "text-[#8A5738] hover:bg-[#C28654]/20 hover:text-[#5F3023]"
                        )}
                        onClick={() => handleMachineSelect(machine.machine_id)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {machine.location}
                          </span>
                          <span className="text-xs opacity-70">
                            ID: {machine.machine_id}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Panel - Inventory Management */}
          <Card className="col-span-3 border-none shadow-xl bg-white/90 backdrop-blur-xl">
            <CardHeader className="border-b border-[#C28654]/20 bg-[#F4EBDE]/50">
              <CardTitle className="text-xl text-[#5F3023]">
                {selectedMachine
                  ? `Inventory for ${
                      machines.find((m) => m.machine_id === selectedMachine)
                        ?.location || "Selected Machine"
                    }`
                  : "Select a machine"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="inventory" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-[#F4EBDE]/80">
                  <TabsTrigger
                    value="inventory"
                    className="data-[state=active]:bg-[#C28654]/20 data-[state=active]:text-[#5F3023] text-[#8A5738] font-medium"
                  >
                    Inventory Management
                  </TabsTrigger>
                  <TabsTrigger
                    value="cleaning"
                    className="data-[state=active]:bg-[#C28654]/20 data-[state=active]:text-[#5F3023] text-[#8A5738] font-medium"
                  >
                    Cleaning Water
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-6">
                  <div className="flex justify-end space-x-2">
                    <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!selectedMachine}
                          size="lg"
                          className="bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Ingredient
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-[#C28654]/20">
                        <DialogHeader>
                          <DialogTitle className="text-[#5F3023]">
                            Add New Ingredient
                          </DialogTitle>
                          <DialogDescription className="text-[#8A5738]">
                            Add a new ingredient to this machine&apos;s
                            inventory
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-ingredient">Ingredient</Label>
                            <Select
                              value={newIngredientData.ingredient_id}
                              onValueChange={(value) =>
                                setNewIngredientData({
                                  ...newIngredientData,
                                  ingredient_id: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an ingredient" />
                              </SelectTrigger>
                              <SelectContent>
                                {ingredientsLoading ? (
                                  <SelectItem value="">
                                    Loading ingredients...
                                  </SelectItem>
                                ) : (
                                  ingredients
                                    .filter(
                                      (ingredient) =>
                                        !inventory.some(
                                          (inv) =>
                                            inv.ingredient_id ===
                                            ingredient.ingredient_id
                                        )
                                    )
                                    .map((ingredient) => (
                                      <SelectItem
                                        key={ingredient.ingredient_id}
                                        value={ingredient.ingredient_id}
                                      >
                                        {ingredient.name} ({ingredient.unit})
                                      </SelectItem>
                                    ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="new-quantity">Quantity</Label>
                              <Input
                                id="new-quantity"
                                type="number"
                                value={newIngredientData.quantity}
                                onChange={(e) =>
                                  setNewIngredientData({
                                    ...newIngredientData,
                                    quantity: parseFloat(e.target.value) || 0,
                                  })
                                }
                                min={0}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-max-capacity">
                                Max Capacity
                              </Label>
                              <Input
                                id="new-max-capacity"
                                type="number"
                                value={newIngredientData.max_capacity}
                                onChange={(e) =>
                                  setNewIngredientData({
                                    ...newIngredientData,
                                    max_capacity:
                                      parseFloat(e.target.value) || 0,
                                  })
                                }
                                min={0}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddingNew(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddIngredient}>
                            Add Ingredient
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isUpdating} onOpenChange={setIsUpdating}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!selectedMachine}
                          size="lg"
                          className="bg-gradient-to-r from-[#C28654] to-[#8A5738] hover:from-[#8A5738] hover:to-[#5F3023] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Update Inventory
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Update Inventory</DialogTitle>
                          <DialogDescription>
                            Update the ingredient quantity for this machine
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="ingredient">Ingredient</Label>
                            <Select
                              value={updateData.ingredient_id}
                              onValueChange={(value) =>
                                setUpdateData({
                                  ...updateData,
                                  ingredient_id: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an ingredient" />
                              </SelectTrigger>
                              <SelectContent>
                                {ingredientsLoading ? (
                                  <SelectItem value="">
                                    Loading ingredients...
                                  </SelectItem>
                                ) : (
                                  inventory.map((item) => (
                                    <SelectItem
                                      key={item.ingredient_id}
                                      value={item.ingredient_id}
                                    >
                                      {getIngredientName(item)} (
                                      {getIngredientUnit(item)})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                type="number"
                                value={updateData.quantity}
                                onChange={(e) =>
                                  setUpdateData({
                                    ...updateData,
                                    quantity: parseFloat(e.target.value) || 0,
                                  })
                                }
                                min={0}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="max-capacity">Max Capacity</Label>
                              <Input
                                id="max-capacity"
                                type="number"
                                value={updateData.max_capacity}
                                onChange={(e) =>
                                  setUpdateData({
                                    ...updateData,
                                    max_capacity:
                                      parseFloat(e.target.value) || 0,
                                  })
                                }
                                min={0}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsUpdating(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateInventory}>
                            Update
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {inventoryLoading ? (
                    <InventorySkeleton />
                  ) : !selectedMachine ? (
                    <div className="text-center py-12 text-[#8A5738]">
                      Select a machine to view its inventory
                    </div>
                  ) : inventory.length === 0 ? (
                    <div className="text-center py-12 text-[#8A5738]">
                      No ingredients found for this machine
                    </div>
                  ) : (
                    <div className="rounded-md border border-[#C28654]/20">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-[#F4EBDE]/30">
                            <TableHead className="text-[#5F3023] font-semibold">
                              Ingredient
                            </TableHead>
                            <TableHead className="text-[#5F3023] font-semibold">
                              Level
                            </TableHead>
                            <TableHead className="text-[#5F3023] font-semibold">
                              Capacity
                            </TableHead>
                            <TableHead className="text-[#5F3023] font-semibold">
                              Unit
                            </TableHead>
                            <TableHead className="text-[#5F3023] font-semibold">
                              Last Updated
                            </TableHead>
                            <TableHead className="text-right text-[#5F3023] font-semibold">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventory.map((item) => (
                            <TableRow
                              key={item.id}
                              className="hover:bg-[#F4EBDE]/20"
                            >
                              <TableCell className="font-medium text-[#5F3023]">
                                {getIngredientName(item)}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span>{item.quantity}</span>
                                    <span>
                                      {item.max_capacity || "Unknown"}
                                    </span>
                                  </div>
                                  <Progress
                                    value={calculateFillPercentage(
                                      item.quantity,
                                      item.max_capacity
                                    )}
                                    className="h-2"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="border-[#C28654]/30 text-[#5F3023]"
                                >
                                  {item.max_capacity || "Not set"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[#8A5738]">
                                {getIngredientUnit(item)}
                              </TableCell>
                              <TableCell className="text-[#8A5738]">
                                {new Date(item.updated_at).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUpdateData({
                                      ingredient_id: item.ingredient_id,
                                      quantity: item.quantity,
                                      max_capacity: item.max_capacity || 0,
                                    });
                                    setIsUpdating(true);
                                  }}
                                  className="text-[#8A5738] hover:text-[#5F3023] hover:bg-[#C28654]/20"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cleaning" className="space-y-6">
                  {!selectedMachine ? (
                    <div className="text-center py-12 text-[#8A5738]">
                      Select a machine to manage cleaning water
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium">
                            Cleaning Water Level
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Manage the cleaning water level for this machine
                          </p>
                        </div>
                        <Button
                          onClick={() => setIsUpdatingCleaningWater(true)}
                          disabled={!selectedMachine}
                          size="lg"
                        >
                          <Droplet className="mr-2 h-4 w-4" />
                          Update Cleaning Water
                        </Button>
                      </div>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  Current Level:
                                </span>
                                <Badge variant="secondary">
                                  {selectedMachineData?.cleaning_water_ml || 0}{" "}
                                  ml
                                </Badge>
                              </div>
                              <Progress
                                value={Math.min(
                                  (selectedMachineData?.cleaning_water_ml ||
                                    0) / 10,
                                  100
                                )}
                                className="h-2"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Last Regular Service</Label>
                                <div className="text-sm">
                                  {selectedMachineData?.last_regular_service
                                    ? new Date(
                                        selectedMachineData.last_regular_service
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Last Deep Service</Label>
                                <div className="text-sm">
                                  {selectedMachineData?.last_deep_service
                                    ? new Date(
                                        selectedMachineData.last_deep_service
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Dialog
                        open={isUpdatingCleaningWater}
                        onOpenChange={setIsUpdatingCleaningWater}
                      >
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Update Cleaning Water</DialogTitle>
                            <DialogDescription>
                              Update the cleaning water level for this machine
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="cleaning-water">
                                Cleaning Water (ml)
                              </Label>
                              <Input
                                id="cleaning-water"
                                type="number"
                                value={cleaningWaterLevel}
                                onChange={(e) =>
                                  setCleaningWaterLevel(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                min={0}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsUpdatingCleaningWater(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateCleaningWater}>
                              Update
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
