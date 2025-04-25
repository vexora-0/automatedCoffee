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
      setSelectedMachineData(updatedMachine);

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

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Machine Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage ingredient inventory for each coffee machine
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Left Panel - Machine List */}
        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Machines</CardTitle>
            </CardHeader>
            <CardContent>
              {machinesLoading ? (
                <p>Loading machines...</p>
              ) : machines.length === 0 ? (
                <p>No machines found</p>
              ) : (
                <div className="space-y-2">
                  {machines.map((machine) => (
                    <Button
                      key={machine.machine_id}
                      variant={
                        selectedMachine === machine.machine_id
                          ? "default"
                          : "outline"
                      }
                      className="w-full justify-start text-left"
                      onClick={() => handleMachineSelect(machine.machine_id)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{machine.location}</span>
                        <span className="text-xs text-muted-foreground">
                          ID: {machine.machine_id}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Inventory Management */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedMachine
                  ? `Inventory for ${
                      machines.find((m) => m.machine_id === selectedMachine)
                        ?.location || "Selected Machine"
                    }`
                  : "Select a machine"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="inventory">
                <TabsList>
                  <TabsTrigger value="inventory">
                    Inventory Management
                  </TabsTrigger>
                  <TabsTrigger value="cleaning">Cleaning Water</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-4 pt-4">
                  <div className="flex justify-end space-x-2">
                    <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                      <DialogTrigger asChild>
                        <Button disabled={!selectedMachine}>
                          Add Ingredient
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Ingredient</DialogTitle>
                          <DialogDescription>
                            Add a new ingredient to this machine&apos;s
                            inventory
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
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
                          <div>
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
                          <div>
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
                                  max_capacity: parseFloat(e.target.value) || 0,
                                })
                              }
                              min={0}
                            />
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
                        <Button disabled={!selectedMachine}>
                          Update Inventory
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Inventory</DialogTitle>
                          <DialogDescription>
                            Update the ingredient quantity for this machine
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
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
                          <div>
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
                          <div>
                            <Label htmlFor="max-capacity">Max Capacity</Label>
                            <Input
                              id="max-capacity"
                              type="number"
                              value={updateData.max_capacity}
                              onChange={(e) =>
                                setUpdateData({
                                  ...updateData,
                                  max_capacity: parseFloat(e.target.value) || 0,
                                })
                              }
                              min={0}
                            />
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
                    <p>Loading inventory...</p>
                  ) : !selectedMachine ? (
                    <p>Select a machine to view its inventory</p>
                  ) : inventory.length === 0 ? (
                    <p>No ingredients found for this machine</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {getIngredientName(item)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>{item.quantity}</span>
                                  <span>{item.max_capacity || "Unknown"}</span>
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
                              {item.max_capacity || "Not set"}
                            </TableCell>
                            <TableCell>{getIngredientUnit(item)}</TableCell>
                            <TableCell>
                              {new Date(item.updated_at).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setUpdateData({
                                    ingredient_id: item.ingredient_id,
                                    quantity: item.quantity,
                                    max_capacity: item.max_capacity || 0,
                                  });
                                  setIsUpdating(true);
                                }}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="cleaning" className="space-y-4 pt-4">
                  {!selectedMachine ? (
                    <p>Select a machine to manage cleaning water</p>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
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
                        >
                          Update Cleaning Water
                        </Button>
                      </div>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex flex-col space-y-1">
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  Current Level:
                                </span>
                                <span>
                                  {selectedMachineData?.cleaning_water_ml || 0}{" "}
                                  ml
                                </span>
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

                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  Last Regular Service:
                                </span>
                                <span>
                                  {selectedMachineData?.last_regular_service
                                    ? new Date(
                                        selectedMachineData.last_regular_service
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  Last Deep Service:
                                </span>
                                <span>
                                  {selectedMachineData?.last_deep_service
                                    ? new Date(
                                        selectedMachineData.last_deep_service
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Dialog
                        open={isUpdatingCleaningWater}
                        onOpenChange={setIsUpdatingCleaningWater}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Cleaning Water</DialogTitle>
                            <DialogDescription>
                              Update the cleaning water level for this machine
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div>
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
