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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

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

  // Loading skeleton component
  const IngredientsSkeleton = () => (
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
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#C28654]/10"
              style={{
                width: Math.random() * 60 + 20 + "px",
                height: Math.random() * 35 + 10 + "px",
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
              Ingredients
            </h1>
            <p className="text-[#8A5738] text-lg">
              Manage your coffee ingredients
            </p>
          </div>
          <div className="flex space-x-2">
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
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Ingredient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-[#C28654]/20">
                <DialogHeader>
                  <DialogTitle className="text-[#5F3023]">
                    Create New Ingredient
                  </DialogTitle>
                  <DialogDescription className="text-[#8A5738]">
                    Add a new ingredient to be used in your recipes
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-[#5F3023] font-medium"
                    >
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Milk"
                      className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023] placeholder:text-[#8A5738]/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="unit"
                      className="text-[#5F3023] font-medium"
                    >
                      Unit
                    </Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="e.g. ml"
                      className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023] placeholder:text-[#8A5738]/60"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    className="border-[#8A5738]/30 text-[#8A5738] hover:bg-[#8A5738]/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateIngredient}
                    className="bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white"
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-[#C28654]/20 bg-[#F4EBDE]/50">
            <CardTitle className="text-xl text-[#5F3023]">
              Ingredients List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <IngredientsSkeleton />
            ) : ingredients.length === 0 ? (
              <div className="text-center py-12 text-[#8A5738]">
                No ingredients found. Create your first ingredient to get
                started.
              </div>
            ) : (
              <div className="rounded-md border border-[#C28654]/20">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-[#F4EBDE]/30">
                      <TableHead className="text-[#5F3023] font-semibold">
                        Name
                      </TableHead>
                      <TableHead className="text-[#5F3023] font-semibold">
                        Unit
                      </TableHead>
                      <TableHead className="text-right text-[#5F3023] font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients.map((ingredient) => (
                      <TableRow
                        key={ingredient.ingredient_id}
                        className="hover:bg-[#F4EBDE]/20"
                      >
                        <TableCell className="font-medium text-[#5F3023]">
                          {ingredient.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-[#C28654]/20 text-[#5F3023] hover:bg-[#C28654]/30"
                          >
                            {ingredient.unit}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditIngredient(ingredient)}
                              className="text-[#8A5738] hover:text-[#5F3023] hover:bg-[#C28654]/20"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-[#C28654]/20">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-[#5F3023]">
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-[#8A5738]">
                                    This will permanently delete the ingredient
                                    "{ingredient.name}". This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-[#8A5738]/30 text-[#8A5738] hover:bg-[#8A5738]/10">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteIngredient(
                                        ingredient.ingredient_id
                                      )
                                    }
                                    className="bg-red-600 text-white hover:bg-red-700"
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-[#C28654]/20">
            <DialogHeader>
              <DialogTitle className="text-[#5F3023]">
                Edit Ingredient
              </DialogTitle>
              <DialogDescription className="text-[#8A5738]">
                Update the ingredient details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-name"
                  className="text-[#5F3023] font-medium"
                >
                  Name
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023]"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-unit"
                  className="text-[#5F3023] font-medium"
                >
                  Unit
                </Label>
                <Input
                  id="edit-unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-[#8A5738]/30 text-[#8A5738] hover:bg-[#8A5738]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateIngredient}
                className="bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white"
              >
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
