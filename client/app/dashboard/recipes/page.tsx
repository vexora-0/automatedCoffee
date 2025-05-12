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
import { recipeService } from "@/lib/api/services";
import { Recipe, RecipeFormData, Ingredient } from "@/lib/api/types";

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
      await recipeService.createRecipe(recipeData);
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

  const handleEditRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setFormData({
      name: recipe.name,
      description: recipe.description,
      category_id: recipe.category_id,
      price: recipe.price,
      image_url: recipe.image_url,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      sugar: recipe.sugar,
    });

    // Fetch recipe ingredients and populate selectedIngredients
    // For this example, we'll just set it empty - in a real app you'd load the ingredients
    setSelectedIngredients([]);

    setIsEditing(true);
  };

  const handleUpdateRecipe = async () => {
    if (!currentRecipe?.recipe_id) return;

    const recipeData = prepareFormData();

    try {
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

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Recipe Management</h1>
          <p className="text-muted-foreground">
            Create and manage coffee recipes
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>Add New Recipe</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Recipe</DialogTitle>
                <DialogDescription>
                  Add a new coffee recipe with ingredients and nutritional
                  information
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Cappuccino"
                    />
                  </div>

                  <div>
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

                  <div>
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

                  <div>
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

                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="e.g. https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
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
                    <div>
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
                    <div>
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
                    <div>
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

                  <div>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedIngredients.map((ingredient) => (
                          <TableRow key={ingredient.ingredient_id}>
                            <TableCell>{ingredient.name}</TableCell>
                            <TableCell>{ingredient.quantity}</TableCell>
                            <TableCell>{ingredient.unit}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleRemoveIngredient(
                                    ingredient.ingredient_id
                                  )
                                }
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No ingredients added yet.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
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

      <Card>
        <CardHeader>
          <CardTitle>Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading recipes...</p>
          ) : recipes.length === 0 ? (
            <p>No recipes found. Create your first recipe to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map((recipe) => (
                  <TableRow key={recipe.recipe_id}>
                    <TableCell className="font-medium">{recipe.name}</TableCell>
                    <TableCell>
                      {categoriesLoading
                        ? "Loading..."
                        : categories?.find(
                            (c) => c.category_id === recipe.category_id
                          )?.name || "Unknown"}
                    </TableCell>
                    <TableCell>${recipe.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRecipe(recipe)}
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
                                This will permanently delete the recipe &quot;
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
            <DialogDescription>
              Update the recipe details and ingredients
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
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
                      <SelectItem value="">Loading categories...</SelectItem>
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
                <Label htmlFor="edit-image-url">Image URL</Label>
                <Input
                  id="edit-image-url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="e.g. https://example.com/image.jpg"
                />
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
                        <SelectItem value="">Loading ingredients...</SelectItem>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedIngredients.map((ingredient) => (
                      <TableRow key={ingredient.ingredient_id}>
                        <TableCell>{ingredient.name}</TableCell>
                        <TableCell>{ingredient.quantity}</TableCell>
                        <TableCell>{ingredient.unit}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleRemoveIngredient(ingredient.ingredient_id)
                            }
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No ingredients added yet.
                </p>
              )}
            </div>
          </div>
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
  );
}
