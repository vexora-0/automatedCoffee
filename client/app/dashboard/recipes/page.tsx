"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  useRecipes,
  useRecipeCategories,
  useIngredients,
} from "@/lib/api/hooks";
import { recipeService, recipeIngredientService } from "@/lib/api/services";
import { Recipe, RecipeFormData, Ingredient } from "@/lib/api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Coffee,
  Scale,
  Clock,
} from "lucide-react";
import { DragDropImageUpload } from "@/components/DragDropImageUpload";

interface IngredientWithQuantity extends Ingredient {
  quantity: number;
}

export default function RecipesManagement() {
  const { recipes, isLoading, mutate } = useRecipes();
  const { categories, isLoading: categoriesLoading } = useRecipeCategories();
  const { ingredients, isLoading: ingredientsLoading } = useIngredients();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Partial<Recipe> | null>(
    null
  );
  const [selectedIngredients, setSelectedIngredients] = useState<
    IngredientWithQuantity[]
  >([]);
  const [ingredientToAdd, setIngredientToAdd] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<RecipeFormData>({
    name: "",
    description: "",
    category_id: "",
    price: 0,
    image_url: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    ingredients: [],
  });

  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      price: 0,
      image_url: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      ingredients: [],
    });
    setSelectedIngredients([]);
    setIngredientToAdd("");
    setIngredientQuantity(0);
    setImageFile(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "calories" ||
        name === "protein" ||
        name === "carbs" ||
        name === "fat" ||
        name === "sugar"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = () => {
    if (!ingredientToAdd || ingredientQuantity <= 0) return;

    const ingredient = ingredients.find(
      (i) => i.ingredient_id === ingredientToAdd
    );
    if (!ingredient) return;

    // Check if ingredient already exists
    const exists = selectedIngredients.some(
      (i) => i.ingredient_id === ingredientToAdd
    );
    if (exists) {
      // Update quantity if already exists
      setSelectedIngredients((prev) =>
        prev.map((i) =>
          i.ingredient_id === ingredientToAdd
            ? { ...i, quantity: ingredientQuantity }
            : i
        )
      );
    } else {
      // Add new ingredient with quantity
      setSelectedIngredients((prev) => [
        ...prev,
        { ...ingredient, quantity: ingredientQuantity },
      ]);
    }

    // Reset ingredient selection
    setIngredientToAdd("");
    setIngredientQuantity(0);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) =>
      prev.filter((i) => i.ingredient_id !== ingredientId)
    );
  };

  const prepareFormData = (): RecipeFormData => {
    return {
      ...formData,
      ingredients: selectedIngredients.map((i) => ({
        ingredient_id: i.ingredient_id,
        quantity: i.quantity,
      })),
    };
  };

  const handleCreateRecipe = async () => {
    const recipeData = prepareFormData();

    try {
      // Use createRecipeWithImage if image file is provided
      if (imageFile) {
        await recipeService.createRecipeWithImage(recipeData, imageFile);
      } else {
        await recipeService.createRecipe(recipeData);
      }
      await mutate();
      resetForm();
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Recipe created successfully",
      });
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Error",
        description: "Failed to create recipe",
        variant: "destructive",
      });
    }
  };

  const handleEditRecipe = async (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setFormData({
      name: recipe.name,
      description: recipe.description,
      category_id: recipe.category_id,
      price: recipe.price,
      image_url: recipe.image_url || "",
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      sugar: recipe.sugar,
    });

    // Fetch recipe ingredients and populate selectedIngredients
    try {
      const response = await recipeIngredientService.getRecipeIngredientsByRecipeId(recipe.recipe_id);
      
      if (response.success && response.data) {
        // Map recipe ingredients to IngredientWithQuantity format
        const mappedIngredients: IngredientWithQuantity[] = response.data
          .map((ri) => {
            // Find the full ingredient details from the ingredients list
            const ingredient = ingredients.find((ing) => ing.ingredient_id === ri.ingredient_id);
            if (ingredient) {
              return {
                ...ingredient,
                quantity: ri.quantity,
              };
            }
            return null;
          })
          .filter((ing): ing is IngredientWithQuantity => ing !== null);
        
        setSelectedIngredients(mappedIngredients);
      } else {
        // If no ingredients found or error, set empty array
        setSelectedIngredients([]);
      }
    } catch (error) {
      console.error("Error fetching recipe ingredients:", error);
      // On error, set empty array
      setSelectedIngredients([]);
    }
    
    setImageFile(null);

    setIsEditing(true);
  };

  const handleUpdateRecipe = async () => {
    if (!currentRecipe?.recipe_id) return;

    const recipeData = prepareFormData();

    try {
      // Update image if a new file was uploaded
      if (imageFile) {
        await recipeService.updateRecipeImage(
          currentRecipe.recipe_id,
          imageFile,
          recipeData.image_url
        );
      } else if (
        recipeData.image_url &&
        recipeData.image_url !== currentRecipe.image_url
      ) {
        // Update image URL if it changed
        await recipeService.updateRecipeImage(
          currentRecipe.recipe_id,
          undefined,
          recipeData.image_url
        );
      }

      // Update recipe data
      await recipeService.updateRecipe(currentRecipe.recipe_id, recipeData);
      await mutate();
      resetForm();
      setCurrentRecipe(null);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Recipe updated successfully",
      });
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast({
        title: "Error",
        description: "Failed to update recipe",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await recipeService.deleteRecipe(recipeId);
      await mutate();
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    }
  };

  // Loading skeleton components
  const RecipesSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );

  const RecipeFormSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <Skeleton className="h-24" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
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
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#C28654]/10"
              style={{
                width: Math.random() * 65 + 20 + "px",
                height: Math.random() * 40 + 12 + "px",
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
              Recipes
            </h1>
            <p className="text-[#8A5738] text-lg">
              Create and manage your coffee recipes
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
                  Add New Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Recipe</DialogTitle>
                  <DialogDescription>
                    Add a new coffee recipe with ingredients and nutritional
                    information
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <div className="grid grid-cols-2 gap-6 py-4 pr-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g. Cappuccino"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe the recipe"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) =>
                            handleSelectChange("category_id", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesLoading ? (
                              <SelectItem value="">
                                Loading categories...
                              </SelectItem>
                            ) : (
                              categories?.map((category) => (
                                <SelectItem
                                  key={category.category_id}
                                  value={category.category_id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          min={0}
                          step={0.01}
                        />
                      </div>

                      <div className="space-y-2">
                        <DragDropImageUpload
                          onChange={(file) => setImageFile(file)}
                          previewUrl={formData.image_url}
                          label="Recipe Image"
                          maxSizeMB={5}
                        />
                        {!imageFile && formData.image_url && (
                          <div className="mt-2">
                            <Label htmlFor="image_url">
                              Or enter image URL
                            </Label>
                            <Input
                              id="image_url"
                              name="image_url"
                              value={formData.image_url}
                              onChange={handleInputChange}
                              placeholder="e.g. https://example.com/image.jpg"
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            name="calories"
                            type="number"
                            value={formData.calories}
                            onChange={handleInputChange}
                            min={0}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            name="protein"
                            type="number"
                            value={formData.protein}
                            onChange={handleInputChange}
                            min={0}
                            step={0.1}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="carbs">Carbs (g)</Label>
                          <Input
                            id="carbs"
                            name="carbs"
                            type="number"
                            value={formData.carbs}
                            onChange={handleInputChange}
                            min={0}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            name="fat"
                            type="number"
                            value={formData.fat}
                            onChange={handleInputChange}
                            min={0}
                            step={0.1}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sugar">Sugar (g)</Label>
                        <Input
                          id="sugar"
                          name="sugar"
                          type="number"
                          value={formData.sugar}
                          onChange={handleInputChange}
                          min={0}
                          step={0.1}
                        />
                      </div>
                    </div>

                    <div className="col-span-2 space-y-4 border-t pt-4">
                      <h3 className="font-medium">Recipe Ingredients</h3>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="ingredient">Ingredient</Label>
                          <Select
                            value={ingredientToAdd}
                            onValueChange={setIngredientToAdd}
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
                                ingredients?.map((ingredient) => (
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
                          <Label htmlFor="quantity">Quantity</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="quantity"
                              type="number"
                              value={ingredientQuantity || ""}
                              onChange={(e) =>
                                setIngredientQuantity(
                                  parseFloat(e.target.value)
                                )
                              }
                              min={0}
                              step={1}
                            />
                            <Button
                              type="button"
                              onClick={handleAddIngredient}
                              disabled={
                                !ingredientToAdd || ingredientQuantity <= 0
                              }
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      {selectedIngredients.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ingredient</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedIngredients.map((ingredient) => (
                                <TableRow key={ingredient.ingredient_id}>
                                  <TableCell className="font-medium">
                                    {ingredient.name}
                                  </TableCell>
                                  <TableCell>{ingredient.quantity}</TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">
                                      {ingredient.unit}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveIngredient(
                                          ingredient.ingredient_id
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground border rounded-md">
                          No ingredients added yet.
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRecipe}
                    disabled={
                      !formData.name ||
                      !formData.category_id ||
                      selectedIngredients.length === 0
                    }
                  >
                    Create Recipe
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-[#C28654]/20 bg-[#F4EBDE]/50">
            <CardTitle className="text-xl text-[#5F3023]">
              Recipes List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <RecipesSkeleton />
            ) : recipes.length === 0 ? (
              <div className="text-center py-12 text-[#8A5738]">
                No recipes found. Create your first recipe to get started.
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
                        Category
                      </TableHead>
                      <TableHead className="text-[#5F3023] font-semibold">
                        Price
                      </TableHead>
                      <TableHead className="text-[#5F3023] font-semibold">
                        Nutrition
                      </TableHead>
                      <TableHead className="text-right text-[#5F3023] font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipes.map((recipe) => (
                      <TableRow
                        key={recipe.recipe_id}
                        className="hover:bg-[#F4EBDE]/20"
                      >
                        <TableCell className="font-medium text-[#5F3023]">
                          {recipe.name}
                        </TableCell>
                        <TableCell>
                          {categoriesLoading ? (
                            "Loading..."
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-[#C28654]/20 text-[#5F3023] hover:bg-[#C28654]/30"
                            >
                              {categories?.find(
                                (c) => c.category_id === recipe.category_id
                              )?.name || "Unknown"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-[#5F3023] font-medium">
                          ${recipe.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className="border-[#C28654]/30 text-[#5F3023]"
                            >
                              <Coffee className="h-3 w-3 mr-1" />
                              {recipe.calories} cal
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-[#8A5738]/30 text-[#8A5738]"
                            >
                              <Scale className="h-3 w-3 mr-1" />
                              {recipe.protein}g protein
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRecipe(recipe)}
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
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the recipe
                                    &quot;
                                    {recipe.name}&quot;. This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteRecipe(recipe.recipe_id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Recipe</DialogTitle>
              <DialogDescription>
                Update the recipe details and ingredients
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="grid grid-cols-2 gap-6 py-4 pr-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        handleSelectChange("category_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="">
                            Loading categories...
                          </SelectItem>
                        ) : (
                          categories?.map((category) => (
                            <SelectItem
                              key={category.category_id}
                              value={category.category_id}
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      min={0}
                      step={0.01}
                    />
                  </div>

                  <div>
                    <DragDropImageUpload
                      onChange={(file) => setImageFile(file)}
                      previewUrl={formData.image_url}
                      label="Recipe Image"
                      maxSizeMB={5}
                    />
                    {!imageFile && formData.image_url && (
                      <div className="mt-2">
                        <Label htmlFor="edit-image-url">
                          Or enter image URL
                        </Label>
                        <Input
                          id="edit-image-url"
                          name="image_url"
                          value={formData.image_url}
                          onChange={handleInputChange}
                          placeholder="e.g. https://example.com/image.jpg"
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-calories">Calories</Label>
                      <Input
                        id="edit-calories"
                        name="calories"
                        type="number"
                        value={formData.calories}
                        onChange={handleInputChange}
                        min={0}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-protein">Protein (g)</Label>
                      <Input
                        id="edit-protein"
                        name="protein"
                        type="number"
                        value={formData.protein}
                        onChange={handleInputChange}
                        min={0}
                        step={0.1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-carbs">Carbs (g)</Label>
                      <Input
                        id="edit-carbs"
                        name="carbs"
                        type="number"
                        value={formData.carbs}
                        onChange={handleInputChange}
                        min={0}
                        step={0.1}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-fat">Fat (g)</Label>
                      <Input
                        id="edit-fat"
                        name="fat"
                        type="number"
                        value={formData.fat}
                        onChange={handleInputChange}
                        min={0}
                        step={0.1}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-sugar">Sugar (g)</Label>
                    <Input
                      id="edit-sugar"
                      name="sugar"
                      type="number"
                      value={formData.sugar}
                      onChange={handleInputChange}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>

                <div className="col-span-2 space-y-4 border-t pt-4">
                  <h3 className="font-medium">Recipe Ingredients</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="edit-ingredient">Ingredient</Label>
                      <Select
                        value={ingredientToAdd}
                        onValueChange={setIngredientToAdd}
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
                            ingredients?.map((ingredient) => (
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
                      <Label htmlFor="edit-quantity">Quantity</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="edit-quantity"
                          type="number"
                          value={ingredientQuantity || ""}
                          onChange={(e) =>
                            setIngredientQuantity(parseFloat(e.target.value))
                          }
                          min={0}
                          step={1}
                        />
                        <Button
                          type="button"
                          onClick={handleAddIngredient}
                          disabled={!ingredientToAdd || ingredientQuantity <= 0}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedIngredients.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ingredient</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedIngredients.map((ingredient) => (
                            <TableRow key={ingredient.ingredient_id}>
                              <TableCell className="font-medium">
                                {ingredient.name}
                              </TableCell>
                              <TableCell>{ingredient.quantity}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {ingredient.unit}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveIngredient(
                                      ingredient.ingredient_id
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                      No ingredients added yet.
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRecipe}
                disabled={!formData.name || !formData.category_id}
              >
                Update Recipe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
