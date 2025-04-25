"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useIngredients } from "@/lib/api/hooks";
import { ingredientService } from "@/lib/api/services";
import { Ingredient } from "@/lib/api/types";

export default function IngredientsManagement() {
  const { ingredients, isLoading, mutate } = useIngredients();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentIngredient, setCurrentIngredient] =
    useState<Partial<Ingredient> | null>(null);
  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: "",
    unit: "",
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateIngredient = async () => {
    try {
      await ingredientService.createIngredient(formData);
      await mutate();
      setFormData({ name: "", unit: "" });
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Ingredient created successfully",
      });
    } catch (error) {
      console.error("Error creating ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to create ingredient",
        variant: "destructive",
      });
    }
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
    });
    setIsEditing(true);
  };

  const handleUpdateIngredient = async () => {
    if (!currentIngredient?.ingredient_id) return;

    try {
      await ingredientService.updateIngredient(
        currentIngredient.ingredient_id,
        formData
      );
      await mutate();
      setFormData({ name: "", unit: "" });
      setCurrentIngredient(null);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Ingredient updated successfully",
      });
    } catch (error) {
      console.error("Error updating ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to update ingredient",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIngredient = async (ingredientId: string) => {
    try {
      await ingredientService.deleteIngredient(ingredientId);
      await mutate();
      toast({
        title: "Success",
        description: "Ingredient deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      toast({
        title: "Error",
        description: "Failed to delete ingredient",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ingredient Management</h1>
          <p className="text-muted-foreground">
            Create and manage ingredients for your recipes
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>Add New Ingredient</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Ingredient</DialogTitle>
                <DialogDescription>
                  Add a new ingredient to be used in your recipes
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="e.g. Milk"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">
                    Unit
                  </Label>
                  <Input
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="e.g. ml"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIngredient}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading ingredients...</p>
          ) : ingredients.length === 0 ? (
            <p>
              No ingredients found. Create your first ingredient to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient) => (
                  <TableRow key={ingredient.ingredient_id}>
                    <TableCell>{ingredient.name}</TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditIngredient(ingredient)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the ingredient.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteIngredient(
                                    ingredient.ingredient_id
                                  )
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>Update the ingredient details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-unit" className="text-right">
                Unit
              </Label>
              <Input
                id="edit-unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateIngredient}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
