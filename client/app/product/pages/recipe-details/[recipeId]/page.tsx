"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useRecipe } from "@/lib/api/hooks";
import { orderService } from "@/lib/api/services";
import { Recipe, RecipeIngredient, Ingredient } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useRecipes } from "@/app/product/stores/useRecipeStore";
import useRecipeIngredientStore from "@/app/product/stores/useRecipeIngredientStore";
import useIngredientStore from "@/app/product/stores/useIngredientStore";
import {
  ArrowLeft,
  ChevronLeft,
  Coffee,
  CreditCard,
  Loader2,
  ThumbsUp,
} from "lucide-react";

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.recipeId as string;

  // Fetch recipe details using SWR hook
  const { recipe: apiRecipe, isLoading: isLoadingApiRecipe } =
    useRecipe(recipeId);
  // Fetch recipes from store
  const { recipes } = useRecipes();
  const storeRecipe = recipes.find((r: Recipe) => r.recipe_id === recipeId);

  // Merge data from API and store, prioritizing store data
  const recipe = storeRecipe || apiRecipe;

  // Get recipe ingredients from recipeIngredientStore
  const recipeIngredientStore = useRecipeIngredientStore();
  const recipeIngredients =
    recipeIngredientStore.getIngredientsByRecipeId(recipeId);

  // Get all ingredients from ingredientStore
  const ingredientStore = useIngredientStore();
  const ingredients = ingredientStore.getAllIngredients();

  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [error, setError] = useState("");

  // Format price as currency
  const formattedPrice = recipe
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(recipe.price)
    : "$0.00";

  const handleBackToRecipes = () => {
    if (recipe) {
      router.push(`/product/pages/recipes/${recipe.category_id}`);
    } else {
      router.push("/product/pages/recipes");
    }
  };

  const handlePlaceOrder = async () => {
    if (!recipe) return;

    // Get IDs from localStorage
    const userId = localStorage.getItem("userId");
    const machineId = localStorage.getItem("machineId");

    if (!userId || !machineId) {
      setError("Session expired. Please login again.");
      return;
    }

    setIsOrdering(true);
    setError("");

    try {
      // Place order using the API
      const response = await orderService.createOrder({
        user_id: userId,
        machine_id: machineId,
        recipe_id: recipeId,
        status: "pending",
      });

      if (response.success && response.data) {
        setOrderComplete(true);
        // Automatically return to the screensaver after a delay
        setTimeout(() => {
          router.push("/product/pages/screensaver");
        }, 5000);
      } else {
        setError("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order error:", err);
      setError("An error occurred while placing your order.");
    } finally {
      setIsOrdering(false);
    }
  };

  // Process ingredients for this recipe
  const recipeIngredientsList = recipeIngredients.map(
    (ri: RecipeIngredient) => {
      const ingredient = ingredients.find(
        (i: Ingredient) => i.ingredient_id === ri.ingredient_id
      );
      return {
        ...ri,
        name: ingredient?.name || "Unknown",
        unit: ingredient?.unit || "",
      };
    }
  );

  if (isLoadingApiRecipe && !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Loading recipe details...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Recipe Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find the recipe you&apos;re looking for.
            </p>
            <Button onClick={() => router.push("/product/pages/recipes")}>
              View All Recipes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 pb-16">
      {/* Recipe image header */}
      <div className="relative h-[30vh] w-full">
        {recipe.image && recipe.image.cdnUrl ? (
          <Image
            src={recipe.image.cdnUrl}
            alt={recipe.name}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        ) : recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            <Coffee className="h-16 w-16 text-foreground/40" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

        {/* Back button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-background/70 backdrop-blur-sm z-10"
          onClick={handleBackToRecipes}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Recipe details content */}
      <div className="relative -mt-12 px-4 max-w-4xl mx-auto">
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{recipe.name}</h1>
                <p className="text-muted-foreground">{recipe.description}</p>
              </div>
              <div className="text-2xl font-bold">{formattedPrice}</div>
            </div>

            <Tabs defaultValue="nutrition" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              </TabsList>

              <TabsContent value="nutrition" className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Calories</span>
                      <span className="text-sm font-medium">
                        {recipe.calories} cal
                      </span>
                    </div>
                    <Progress value={recipe.calories / 10} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Protein</span>
                      <span className="text-sm font-medium">
                        {recipe.protein}g
                      </span>
                    </div>
                    <Progress value={recipe.protein * 5} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Carbs</span>
                      <span className="text-sm font-medium">
                        {recipe.carbs}g
                      </span>
                    </div>
                    <Progress value={recipe.carbs * 2} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Fat</span>
                      <span className="text-sm font-medium">{recipe.fat}g</span>
                    </div>
                    <Progress value={recipe.fat * 3} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Sugar</span>
                      <span className="text-sm font-medium">
                        {recipe.sugar}g
                      </span>
                    </div>
                    <Progress value={recipe.sugar * 3} className="h-2" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ingredients" className="pt-4">
                {recipeIngredientsList.length > 0 ? (
                  <ul className="space-y-2">
                    {recipeIngredientsList.map(
                      (ingredient: RecipeIngredient) => (
                        <li
                          key={ingredient.ingredient_id}
                          className="flex justify-between items-center pb-2 border-b border-border"
                        >
                          <span className="text-sm text-muted-foreground">
                            {ingredient.quantity}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    Ingredient information not available.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {orderComplete ? (
          <Card className="mt-6 border-none bg-primary/10">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <ThumbsUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Order Successful!</h3>
              <p className="text-muted-foreground mb-4">
                Your order has been placed and is being prepared.
              </p>
              <p className="text-sm text-muted-foreground">
                Returning to home screen in a few seconds...
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {error && (
              <p className="text-destructive text-sm font-medium">{error}</p>
            )}

            <Button
              className="w-full py-6 text-lg"
              onClick={handlePlaceOrder}
              disabled={isOrdering}
            >
              {isOrdering ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay {formattedPrice}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleBackToRecipes}
              disabled={isOrdering}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Selection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
